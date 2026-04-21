import asyncio
import sys
from contextlib import asynccontextmanager

import psycopg
from psycopg import sql

from .config import settings


# Psycopg async on Windows requires Selector event loop (not Proactor).
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


async def get_db_conn():
    """FastAPI dependency that yields a fresh DB connection per request."""
    conn = await psycopg.AsyncConnection.connect(settings.database_url)
    try:
        yield conn
    finally:
        # Rollback any pending/aborted transaction and close safely
        try:
            if conn and not conn.closed:
                await conn.rollback()
        except Exception:
            pass
        try:
            if conn and not conn.closed:
                await conn.close()
        except Exception:
            pass


# Backwards-compatible context (not used by FastAPI dependencies directly)
@asynccontextmanager
async def get_db_conn_context():
    async with get_db_conn() as conn:
        yield conn


def _ensure_database_exists_sync() -> None:
    """
    Create the target database if it doesn't exist.
    Runs sync in a worker thread so app startup stays async-friendly.
    """
    target_db = settings.db_name
    if not target_db:
        raise RuntimeError("DB_NAME is empty")

    # Connect to the maintenance DB to create the target DB if needed.
    maintenance_db = "postgres"
    conninfo = {
        "host": settings.db_host,
        "port": settings.db_port,
        "dbname": maintenance_db,
        "user": settings.db_user,
        "password": settings.db_password,
    }

    with psycopg.connect(**conninfo, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (target_db,))
            exists = cur.fetchone() is not None
            if not exists:
                cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(target_db)))


def _ensure_tables_exist_sync(conn) -> None:
    """
    Synchronous version of table creation logic, for use on Windows where
    psycopg's async connections can conflict with the Proactor event loop.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                mobile TEXT NOT NULL,
                whatsapp_number TEXT,
                address TEXT,
                role TEXT NOT NULL CHECK (role IN ('provider','customer')),
                password_hash TEXT NOT NULL,
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )

        # Ensure location columns exist for deployments that created the table
        # before latitude/longitude were added.
        cur.execute(
            """
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
            """
        )
        cur.execute(
            """
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
            """
        )
        cur.execute(
            """
            ALTER TABLE users
            ALTER COLUMN address DROP NOT NULL;
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,
                provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                price NUMERIC(12,2),
                photo_url TEXT,
                photo_urls TEXT[],
                location TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )

        # Allow NULL price (pricing is per item, not per service).
        cur.execute(
            """
            ALTER TABLE services
            ALTER COLUMN price DROP NOT NULL;
            """
        )

        # Ensure new photo_urls column exists for deployments created before it was added.
        cur.execute(
            """
            ALTER TABLE services
            ADD COLUMN IF NOT EXISTS photo_urls TEXT[];
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                event_date DATE NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                notes TEXT,
                address TEXT,
                duration_hours INTEGER,
                paid_amount NUMERIC(12,2),
                status TEXT NOT NULL CHECK (status IN ('pending','confirmed','cancelled')) DEFAULT 'pending',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            ALTER TABLE bookings
            ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12,2);
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS service_items (
                id SERIAL PRIMARY KEY,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                quantity TEXT,
                amount NUMERIC(12,2),
                photo_url TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                order_id TEXT NOT NULL UNIQUE,
                payment_id TEXT NOT NULL UNIQUE,
                signature_status TEXT NOT NULL CHECK (signature_status IN ('verified','failed')),
                amount NUMERIC(12,2) NOT NULL,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            ALTER TABLE payments
            ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL;
            """
        )

        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                comment TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS service_unavailable_dates (
                id SERIAL PRIMARY KEY,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                blocked_date DATE NOT NULL,
                reason TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (service_id, blocked_date)
            );
            """
        )

        # Ensure new columns exist for deployments created before they were added.
        cur.execute(
            """
            ALTER TABLE service_items
            ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
            """
        )
        cur.execute(
            """
            ALTER TABLE service_items
            ADD COLUMN IF NOT EXISTS photo_url TEXT;
            """
        )

        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_service_items_service_id
            ON service_items (service_id);
            """
        )

        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_services_name
            ON services USING GIN (to_tsvector('english', name));
            """
        )

        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_services_location
            ON services (location);
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_reviews_service_id
            ON reviews (service_id);
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_reviews_customer_id
            ON reviews (customer_id);
            """
        )
        cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_unavailable_service_date
            ON service_unavailable_dates (service_id, blocked_date);
            """
        )


def _ensure_db_ready_sync() -> None:
    """
    Full DB readiness check in synchronous mode (Windows-safe).
    """
    _ensure_database_exists_sync()

    with psycopg.connect(settings.database_url, autocommit=False) as conn:
        _ensure_tables_exist_sync(conn)
        conn.commit()


async def _ensure_tables_exist_async(conn: "psycopg.AsyncConnection") -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                mobile TEXT NOT NULL,
                whatsapp_number TEXT,
                address TEXT,
                role TEXT NOT NULL CHECK (role IN ('provider','customer')),
                password_hash TEXT NOT NULL,
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )

        # Ensure location columns exist for deployments that created the table
        # before latitude/longitude were added.
        await cur.execute(
            """
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
            """
        )
        await cur.execute(
            """
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
            """
        )
        await cur.execute(
            """
            ALTER TABLE users
            ALTER COLUMN address DROP NOT NULL;
            """
        )

        await cur.execute(
            """
            CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,
                provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                price NUMERIC(12,2),
                photo_url TEXT,
                photo_urls TEXT[],
                location TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )

        # Allow NULL price (pricing is per item, not per service).
        await cur.execute(
            """
            ALTER TABLE services
            ALTER COLUMN price DROP NOT NULL;
            """
        )

        # Ensure new photo_urls column exists for deployments created before it was added.
        await cur.execute(
            """
            ALTER TABLE services
            ADD COLUMN IF NOT EXISTS photo_urls TEXT[];
            """
        )

        await cur.execute(
            """
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                event_date DATE NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                notes TEXT,
                address TEXT,
                duration_hours INTEGER,
                paid_amount NUMERIC(12,2),
                status TEXT NOT NULL CHECK (status IN ('pending','confirmed','cancelled')) DEFAULT 'pending',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )
        await cur.execute(
            """
            ALTER TABLE bookings
            ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12,2);
            """
        )

        await cur.execute(
            """
            CREATE TABLE IF NOT EXISTS service_items (
                id SERIAL PRIMARY KEY,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                quantity TEXT,
                amount NUMERIC(12,2),
                photo_url TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )

        await cur.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                order_id TEXT NOT NULL UNIQUE,
                payment_id TEXT NOT NULL UNIQUE,
                signature_status TEXT NOT NULL CHECK (signature_status IN ('verified','failed')),
                amount NUMERIC(12,2) NOT NULL,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )
        await cur.execute(
            """
            ALTER TABLE payments
            ADD COLUMN IF NOT EXISTS booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL;
            """
        )

        await cur.execute(
            """
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                comment TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )
        await cur.execute(
            """
            CREATE TABLE IF NOT EXISTS service_unavailable_dates (
                id SERIAL PRIMARY KEY,
                service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
                blocked_date DATE NOT NULL,
                reason TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (service_id, blocked_date)
            );
            """
        )

        # Ensure new columns exist for deployments created before they were added.
        await cur.execute(
            """
            ALTER TABLE service_items
            ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);
            """
        )
        await cur.execute(
            """
            ALTER TABLE service_items
            ADD COLUMN IF NOT EXISTS photo_url TEXT;
            """
        )

        await cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_service_items_service_id
            ON service_items (service_id);
            """
        )

        await cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_services_name
            ON services USING GIN (to_tsvector('english', name));
            """
        )

        await cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_services_location
            ON services (location);
            """
        )
        await cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_reviews_service_id
            ON reviews (service_id);
            """
        )
        await cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_reviews_customer_id
            ON reviews (customer_id);
            """
        )
        await cur.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_unavailable_service_date
            ON service_unavailable_dates (service_id, blocked_date);
            """
        )


async def ensure_db_ready() -> None:
    """
    Ensures the database exists and all required tables exist.
    Uses environment from `backend/.env` via `settings`.
    """
    # On Windows, avoid async psycopg with Proactor loop by doing all
    # DB readiness work synchronously in a thread.
    if sys.platform.startswith("win"):
        await asyncio.to_thread(_ensure_db_ready_sync)
        return

    # Non-Windows: keep fully-async path.
    await asyncio.to_thread(_ensure_database_exists_sync)

    conn = await psycopg.AsyncConnection.connect(settings.database_url)
    try:
        await _ensure_tables_exist_async(conn)
        await conn.commit()
    finally:
        try:
            await conn.close()
        except Exception:
            pass

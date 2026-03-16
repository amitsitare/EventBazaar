import asyncio
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routes import auth as auth_routes
from .routes import services as services_routes
from .routes import bookings as bookings_routes
from .routes import payments as payments_routes
from .config import settings
from .db import ensure_db_ready


# Psycopg async on Windows requires Selector event loop (not Proactor).
if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

app = FastAPI(title="EventBazaar API", version="0.1.0")

# Ensure uploads directory exists and serve it as static files.
uploads_root = Path(__file__).parent / "uploads"
uploads_root.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_root)), name="uploads")

# Configure CORS with frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "database": f"{settings.db_host}:{settings.db_port}/{settings.db_name}"}


app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(services_routes.router, prefix="/api/services", tags=["services"])
app.include_router(bookings_routes.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(payments_routes.router, prefix="/api/payments", tags=["payments"])


@app.on_event("startup")
async def _startup():
    # Ensure DB exists and schema is present before serving requests.
    try:
        await ensure_db_ready()
    except Exception as e:
        # Don't prevent the API from starting if the DB is temporarily unavailable
        # (e.g., local Postgres not running or wrong credentials).
        print(f"WARNING: Database not ready on startup: {e}")


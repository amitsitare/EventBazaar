from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import hmac
import hashlib
import razorpay
import logging

from ..config import settings
from .auth import get_current_user
from ..db import get_db_conn
from ..schemas import BookingCreate
from .bookings import create_confirmed_booking_and_notify, ensure_service_date_available

logger = logging.getLogger(__name__)


router = APIRouter()


class CreateOrderRequest(BaseModel):
    amount: int  # in paise
    currency: str = "INR"
    receipt: str


class VerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    service_id: int
    event_date: str
    quantity: int = 1
    notes: str | None = None
    address: str | None = None
    duration_hours: int | None = None


def get_client() -> razorpay.Client:
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay is not configured"
        )
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


async def _get_user_email(conn, user_id: int) -> str | None:
    async with conn.cursor() as cur:
        await cur.execute("SELECT email FROM users WHERE id = %s", (user_id,))
        row = await cur.fetchone()
        return row[0].strip().lower() if row and row[0] else None


async def _is_admin_user(conn, user_id: int) -> bool:
    email = await _get_user_email(conn, user_id)
    return bool(email and email in settings.admin_emails)


async def _fetch_booking_payload_by_id(conn, booking_id: int) -> dict | None:
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT id, service_id, customer_id, event_date, quantity, notes, address, duration_hours, paid_amount, status
            FROM bookings
            WHERE id = %s
            """,
            (booking_id,),
        )
        b = await cur.fetchone()
    if not b:
        return None
    return {
        "id": b[0],
        "service_id": b[1],
        "customer_id": b[2],
        "event_date": str(b[3]),
        "quantity": b[4],
        "notes": b[5],
        "address": b[6],
        "duration_hours": b[7],
        "paid_amount": float(b[8] or 0),
        "status": b[9],
    }


@router.get("/config")
async def get_config():
    if not settings.razorpay_key_id:
        raise HTTPException(status_code=503, detail="Razorpay key not configured")
    return {"key_id": settings.razorpay_key_id}


@router.post("/create-order")
async def create_order(body: CreateOrderRequest, _=Depends(get_current_user)):
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    client = get_client()
    try:
        order = client.order.create({
            "amount": body.amount,
            "currency": body.currency,
            "receipt": body.receipt,
            "payment_capture": 1,
        })
        return order
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to create order: {e}")


@router.post("/verify")
async def verify_signature(body: VerifyRequest, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    # Verify signature: generated_signature = HMAC_SHA256(order_id|payment_id, secret)
    if payload.get("role") != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers only")
    user_id = int(payload["sub"])

    try:
        # Serialize verify calls per payment id to prevent duplicate booking creation.
        async with conn.cursor() as lock_cur:
            await lock_cur.execute("SELECT pg_advisory_xact_lock(hashtext(%s))", (body.razorpay_payment_id,))

        sign_payload = f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode()
        expected = hmac.new(settings.razorpay_key_secret.encode(), sign_payload, hashlib.sha256).hexdigest()
        signature_verified = hmac.compare_digest(expected, body.razorpay_signature)

        client = get_client()
        payment_info = client.payment.fetch(body.razorpay_payment_id)
        amount_rupees = (payment_info.get("amount") or 0) / 100.0
        if payment_info.get("order_id") != body.razorpay_order_id:
            raise HTTPException(status_code=400, detail="Order/payment mismatch")

        async with conn.cursor() as cur:
            # idempotency path for repeated verify calls
            await cur.execute(
                """
                SELECT booking_id, signature_status
                FROM payments
                WHERE payment_id = %s OR order_id = %s
                ORDER BY id DESC
                LIMIT 1
                """,
                (body.razorpay_payment_id, body.razorpay_order_id),
            )
            existing = await cur.fetchone()

            if existing and existing[1] == "verified" and existing[0]:
                booking_payload = await _fetch_booking_payload_by_id(conn, int(existing[0]))
                if booking_payload:
                    return {
                        "status": "verified",
                        "booking": booking_payload,
                    }

            if not signature_verified:
                await cur.execute(
                    """
                    INSERT INTO payments (order_id, payment_id, signature_status, amount, user_id, service_id)
                    VALUES (%s, %s, 'failed', %s, %s, %s)
                    ON CONFLICT (payment_id) DO UPDATE
                    SET signature_status = EXCLUDED.signature_status,
                        amount = EXCLUDED.amount,
                        user_id = EXCLUDED.user_id,
                        service_id = EXCLUDED.service_id
                    WHERE payments.signature_status <> 'verified'
                    """,
                    (body.razorpay_order_id, body.razorpay_payment_id, amount_rupees, user_id, body.service_id),
                )
                await conn.commit()
                raise HTTPException(status_code=400, detail="Signature verification failed")

            booking_data = BookingCreate(
                service_id=body.service_id,
                event_date=body.event_date,
                quantity=body.quantity,
                notes=body.notes,
                address=body.address,
                duration_hours=body.duration_hours,
                paid_amount=amount_rupees,
            )
            await ensure_service_date_available(conn, booking_data.service_id, booking_data.event_date)
            booking = await create_confirmed_booking_and_notify(conn, user_id, booking_data)

            await cur.execute(
                """
                INSERT INTO payments (order_id, payment_id, signature_status, amount, user_id, service_id, booking_id)
                VALUES (%s, %s, 'verified', %s, %s, %s, %s)
                ON CONFLICT (payment_id) DO UPDATE
                SET signature_status = EXCLUDED.signature_status,
                    amount = EXCLUDED.amount,
                    user_id = EXCLUDED.user_id,
                    service_id = EXCLUDED.service_id,
                    booking_id = COALESCE(payments.booking_id, EXCLUDED.booking_id)
                """,
                (body.razorpay_order_id, body.razorpay_payment_id, amount_rupees, user_id, body.service_id, booking.id),
            )
            await conn.commit()
            return {"status": "verified", "booking": booking.model_dump()}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Payment verification failed")
        raise HTTPException(status_code=400, detail=f"Verification error: {e}")


@router.get("/my")
async def my_payments(payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    if payload.get("role") != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers only")
    user_id = int(payload["sub"])
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT
                p.id, p.order_id, p.payment_id, p.signature_status, p.amount, p.user_id, p.service_id, p.booking_id, p.created_at,
                s.name, s.location
            FROM payments p
            JOIN services s ON s.id = p.service_id
            WHERE p.user_id = %s
            ORDER BY p.id DESC
            """,
            (user_id,),
        )
        rows = await cur.fetchall()
    return [
        {
            "id": r[0],
            "order_id": r[1],
            "payment_id": r[2],
            "signature_status": r[3],
            "amount": float(r[4] or 0),
            "user_id": r[5],
            "service_id": r[6],
            "booking_id": r[7],
            "created_at": r[8].isoformat() if r[8] else None,
            "service_name": r[9],
            "service_location": r[10],
        }
        for r in rows
    ]


@router.get("/provider")
async def provider_payments(payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    """All payment rows for services owned by the logged-in provider."""
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT
                p.id, p.order_id, p.payment_id, p.signature_status, p.amount, p.user_id,
                p.service_id, p.booking_id, p.created_at,
                s.name AS service_name,
                u.name AS customer_name, u.email AS customer_email,
                b.event_date, b.status AS booking_status
            FROM payments p
            JOIN services s ON s.id = p.service_id AND s.provider_id = %s
            JOIN users u ON u.id = p.user_id
            LEFT JOIN bookings b ON b.id = p.booking_id
            ORDER BY p.id DESC
            LIMIT 500
            """,
            (provider_id,),
        )
        rows = await cur.fetchall()
    return [
        {
            "id": r[0],
            "order_id": r[1],
            "payment_id": r[2],
            "signature_status": r[3],
            "amount": float(r[4] or 0),
            "user_id": r[5],
            "service_id": r[6],
            "booking_id": r[7],
            "created_at": r[8].isoformat() if r[8] else None,
            "service_name": r[9],
            "customer_name": r[10],
            "customer_email": r[11],
            "event_date": str(r[12]) if r[12] else None,
            "booking_status": r[13],
        }
        for r in rows
    ]


@router.get("/all")
async def all_payments(payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    user_id = int(payload["sub"])
    if not await _is_admin_user(conn, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only")

    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT
                p.id, p.order_id, p.payment_id, p.signature_status, p.amount, p.user_id, p.service_id, p.booking_id, p.created_at,
                u.name, u.email,
                s.name, s.location
            FROM payments p
            JOIN users u ON u.id = p.user_id
            JOIN services s ON s.id = p.service_id
            ORDER BY p.id DESC
            LIMIT 1000
            """
        )
        rows = await cur.fetchall()
    return [
        {
            "id": r[0],
            "order_id": r[1],
            "payment_id": r[2],
            "signature_status": r[3],
            "amount": float(r[4] or 0),
            "user_id": r[5],
            "service_id": r[6],
            "booking_id": r[7],
            "created_at": r[8].isoformat() if r[8] else None,
            "customer_name": r[9],
            "customer_email": r[10],
            "service_name": r[11],
            "service_location": r[12],
        }
        for r in rows
    ]



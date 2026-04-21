import asyncio
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from typing import List
import logging

from ..db import get_db_conn
from ..schemas import BookingCreate, BookingPublic, ReviewCreate, ReviewPublic
from .auth import get_current_user
from ..services.whatsapp import send_booking_notification_to_provider, send_booking_notification_to_admin
from ..services.invoice_pdf import generate_invoice_pdf
from ..services.emailer import send_booking_confirmation_email

logger = logging.getLogger(__name__)


router = APIRouter()


async def ensure_service_date_available(conn, service_id: int, event_date: date) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT id
            FROM service_unavailable_dates
            WHERE service_id = %s AND blocked_date = %s
            LIMIT 1
            """,
            (service_id, event_date),
        )
        if await cur.fetchone():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Selected date is unavailable for this service")


async def create_confirmed_booking_and_notify(conn, customer_id: int, data: BookingCreate) -> BookingPublic:
    await ensure_service_date_available(conn, data.service_id, data.event_date)
    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT u.name, u.email, u.mobile, u.address
            FROM users u
            WHERE u.id = %s
            """,
            (customer_id,),
        )
        customer_data = await cur.fetchone()

        await cur.execute(
            """
            SELECT s.name, s.price, s.location, p.name as provider_name, p.mobile as provider_mobile, p.whatsapp_number as provider_whatsapp, p.email as provider_email
            FROM services s
            JOIN users p ON s.provider_id = p.id
            WHERE s.id = %s
            """,
            (data.service_id,),
        )
        service_data = await cur.fetchone()

        if not customer_data or not service_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer or service not found")

        await cur.execute(
            """
            INSERT INTO bookings (service_id, customer_id, event_date, quantity, notes, address, duration_hours, paid_amount, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'confirmed')
            RETURNING id, service_id, customer_id, event_date, quantity, notes, address, duration_hours, paid_amount, status
            """,
            (data.service_id, customer_id, data.event_date, data.quantity, data.notes, data.address, data.duration_hours, data.paid_amount),
        )
        row = await cur.fetchone()
        await conn.commit()

    # Send WhatsApp notification to provider and admin (best-effort)
    try:
        provider_whatsapp = service_data[5]
        if provider_whatsapp:
            await send_booking_notification_to_provider(
                provider_whatsapp=provider_whatsapp,
                customer_name=customer_data[0],
                customer_mobile=customer_data[2],
                customer_address=(data.address or customer_data[3]),
                service_name=service_data[0],
                service_price=float(service_data[1] or 0),
                event_date=str(data.event_date),
                quantity=data.quantity,
                duration_hours=data.duration_hours,
                notes=data.notes,
            )
            logger.info(f"WhatsApp notification sent to provider {service_data[3]} for booking {row[0]}")
        else:
            logger.warning(f"Provider {service_data[3]} has no WhatsApp number configured")
        await send_booking_notification_to_admin(
            customer_name=customer_data[0],
            customer_email=customer_data[1],
            customer_mobile=customer_data[2],
            service_name=service_data[0],
            service_price=float(service_data[1] or 0),
            event_date=str(data.event_date),
            quantity=data.quantity,
            booking_address=(data.address or customer_data[3]),
            duration_hours=data.duration_hours,
            provider_name=service_data[3],
            provider_mobile=service_data[4],
            notes=data.notes,
        )
    except Exception as e:
        logger.error(f"Failed to send WhatsApp notification: {str(e)}")

    # Send confirmation email to customer with invoice (best-effort)
    try:
        invoice_payload = {
            "booking_id": row[0],
            "booking_created_at": datetime.now().strftime("%d %b %Y"),
            "event_date": str(data.event_date),
            "customer_name": customer_data[0],
            "customer_email": customer_data[1],
            "customer_mobile": customer_data[2],
            "service_name": service_data[0],
            "service_location": service_data[2],
            "quantity": data.quantity,
            "unit_price": float(service_data[1] or 0),
            "paid_amount": float(data.paid_amount or service_data[1] or 0),
            "status": "confirmed",
            "provider_name": service_data[3],
            "provider_mobile": service_data[4],
            "provider_email": service_data[6],
            "address": data.address,
        }
        invoice_bytes = generate_invoice_pdf(invoice_payload)
        invoice_filename = f"invoice_booking_{row[0]}.pdf"
        await asyncio.to_thread(
            send_booking_confirmation_email,
            customer_data[1],
            f"Booking Confirmed | EventBazaar | #{row[0]}",
            invoice_payload,
            invoice_bytes,
            invoice_filename,
        )
    except Exception as e:
        logger.error(f"Failed to send booking confirmation email: {str(e)}")

    return BookingPublic(
        id=row[0], service_id=row[1], customer_id=row[2], event_date=row[3], quantity=row[4], notes=row[5], address=row[6], duration_hours=row[7], paid_amount=float(row[8] or 0), status=row[9]
    )


@router.post("/", response_model=BookingPublic)
async def create_booking(data: BookingCreate, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    if payload.get("role") != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers only")
    customer_id = int(payload["sub"])
    return await create_confirmed_booking_and_notify(conn, customer_id, data)


@router.get("/my", response_model=List[BookingPublic])
async def my_bookings(payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    role = payload.get("role")
    user_id = int(payload["sub"])
    async with conn.cursor() as cur:
        if role == "customer":
            await cur.execute(
                """
                SELECT
                    b.id, b.service_id, b.customer_id, b.event_date, b.quantity, b.notes, b.address, b.duration_hours, b.paid_amount, b.status,
                    s.name, s.location,
                    r.rating, r.comment
                FROM bookings b
                JOIN services s ON s.id = b.service_id
                LEFT JOIN reviews r ON r.booking_id = b.id
                WHERE b.customer_id=%s
                ORDER BY b.id DESC
                """,
                (user_id,),
            )
        else:
            # provider: bookings for their services
            await cur.execute(
                """
                SELECT
                    b.id, b.service_id, b.customer_id, b.event_date, b.quantity, b.notes, b.address, b.duration_hours, b.paid_amount, b.status,
                    s.name, s.location,
                    NULL::INTEGER AS review_rating, NULL::TEXT AS review_comment
                FROM bookings b
                JOIN services s ON s.id = b.service_id
                WHERE s.provider_id = %s
                ORDER BY b.id DESC
                """,
                (user_id,),
            )
        rows = await cur.fetchall()
        return [
            BookingPublic(
                id=r[0], service_id=r[1], customer_id=r[2], event_date=r[3], quantity=r[4], notes=r[5], address=r[6], duration_hours=r[7], paid_amount=float(r[8] or 0), status=r[9], service_name=r[10], service_location=r[11], review_rating=r[12], review_comment=r[13]
            ) for r in rows
        ]


@router.get("/{booking_id}/invoice")
async def download_invoice(booking_id: int, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    user_id = int(payload["sub"])
    role = payload.get("role")
    if role != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers only")

    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT
                b.id, b.event_date, b.quantity, b.address, b.paid_amount, b.status, b.created_at,
                s.name, s.location, s.price,
                c.name, c.email, c.mobile,
                p.name, p.mobile, p.email
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            JOIN users c ON c.id = b.customer_id
            JOIN users p ON p.id = s.provider_id
            WHERE b.id = %s AND b.customer_id = %s
            """,
            (booking_id, user_id),
        )
        row = await cur.fetchone()

    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    invoice_payload = {
        "booking_id": row[0],
        "event_date": str(row[1]),
        "quantity": row[2],
        "address": row[3],
        "paid_amount": float(row[4] or row[9] or 0),
        "status": row[5],
        "booking_created_at": row[6].strftime("%d %b %Y") if row[6] else "-",
        "service_name": row[7],
        "service_location": row[8],
        "unit_price": float(row[9] or 0),
        "customer_name": row[10],
        "customer_email": row[11],
        "customer_mobile": row[12],
        "provider_name": row[13],
        "provider_mobile": row[14],
        "provider_email": row[15],
    }

    pdf_bytes = generate_invoice_pdf(invoice_payload)
    filename = f"invoice_booking_{booking_id}.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


@router.post("/{booking_id}/review", response_model=ReviewPublic)
async def submit_booking_review(booking_id: int, data: ReviewCreate, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    if payload.get("role") != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers only")
    user_id = int(payload["sub"])
    comment = (data.comment or "").strip()

    async with conn.cursor() as cur:
        await cur.execute(
            """
            SELECT b.id, b.service_id, b.customer_id, b.event_date, b.status, u.name
            FROM bookings b
            JOIN users u ON u.id = b.customer_id
            WHERE b.id = %s AND b.customer_id = %s
            """,
            (booking_id, user_id),
        )
        booking = await cur.fetchone()
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        if booking[4] != "confirmed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only confirmed bookings can be reviewed")
        if booking[3] >= date.today():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Review can be submitted after event date")

        await cur.execute(
            """
            INSERT INTO reviews (booking_id, service_id, customer_id, rating, comment, updated_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            ON CONFLICT (booking_id) DO UPDATE
            SET rating = EXCLUDED.rating,
                comment = EXCLUDED.comment,
                updated_at = NOW()
            RETURNING id, booking_id, service_id, customer_id, rating, comment, created_at
            """,
            (booking_id, booking[1], user_id, data.rating, comment or None),
        )
        review = await cur.fetchone()
        await conn.commit()

    return ReviewPublic(
        id=review[0],
        booking_id=review[1],
        service_id=review[2],
        customer_id=review[3],
        customer_name=booking[5],
        rating=int(review[4]),
        comment=review[5],
        created_at=review[6].isoformat() if review[6] else "",
    )




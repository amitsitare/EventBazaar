from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging

from ..db import get_db_conn
from ..schemas import BookingCreate, BookingPublic
from .auth import get_current_user
from ..services.whatsapp import send_booking_notification_to_provider, send_booking_notification_to_admin

logger = logging.getLogger(__name__)


router = APIRouter()


@router.post("/", response_model=BookingPublic)
async def create_booking(data: BookingCreate, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    if payload.get("role") != "customer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers only")
    customer_id = int(payload["sub"])
    
    async with conn.cursor() as cur:
        # First, get customer and service details for WhatsApp notification
        await cur.execute(
            """
            SELECT u.name, u.email, u.mobile, u.address 
            FROM users u 
            WHERE u.id = %s
            """,
            (customer_id,)
        )
        customer_data = await cur.fetchone()
        
        await cur.execute(
            """
            SELECT s.name, s.price, s.location, p.name as provider_name, p.mobile as provider_mobile, p.whatsapp_number as provider_whatsapp
            FROM services s
            JOIN users p ON s.provider_id = p.id
            WHERE s.id = %s
            """,
            (data.service_id,)
        )
        service_data = await cur.fetchone()
        
        if not customer_data or not service_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer or service not found")
        
        # Create the booking
        await cur.execute(
            """
            INSERT INTO bookings (service_id, customer_id, event_date, quantity, notes, address, duration_hours, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING id, service_id, customer_id, event_date, quantity, notes, address, duration_hours, status
            """,
            (data.service_id, customer_id, data.event_date, data.quantity, data.notes, data.address, data.duration_hours),
        )
        row = await cur.fetchone()
        await conn.commit()
        
        # Send WhatsApp notification to provider and admin (best-effort)
        try:
            provider_whatsapp = service_data[5]  # provider_whatsapp
            if provider_whatsapp:
                await send_booking_notification_to_provider(
                    provider_whatsapp=provider_whatsapp,
                    customer_name=customer_data[0],   # name
                    customer_mobile=customer_data[2], # mobile
                    customer_address=(data.address or customer_data[3]), # booking address override or user address
                    service_name=service_data[0],     # service_name
                    service_price=float(service_data[1] or 0),
                    event_date=str(data.event_date),
                    quantity=data.quantity,
                    duration_hours=data.duration_hours,
                    notes=data.notes,
                )
                logger.info(f"WhatsApp notification sent to provider {service_data[3]} for booking {row[0]}")
            else:
                logger.warning(f"Provider {service_data[3]} has no WhatsApp number configured")
            # Also notify admin number if configured
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
            # Don't fail the booking if WhatsApp fails
        
        return BookingPublic(
            id=row[0], service_id=row[1], customer_id=row[2], event_date=row[3], quantity=row[4], notes=row[5], address=row[6], duration_hours=row[7], status=row[8]
        )


@router.get("/my", response_model=List[BookingPublic])
async def my_bookings(payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    role = payload.get("role")
    user_id = int(payload["sub"])
    async with conn.cursor() as cur:
        if role == "customer":
            await cur.execute(
                "SELECT id, service_id, customer_id, event_date, quantity, notes, address, duration_hours, status FROM bookings WHERE customer_id=%s ORDER BY id DESC",
                (user_id,),
            )
        else:
            # provider: bookings for their services
            await cur.execute(
                """
                SELECT b.id, b.service_id, b.customer_id, b.event_date, b.quantity, b.notes, b.address, b.duration_hours, b.status
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
                id=r[0], service_id=r[1], customer_id=r[2], event_date=r[3], quantity=r[4], notes=r[5], address=r[6], duration_hours=r[7], status=r[8]
            ) for r in rows
        ]




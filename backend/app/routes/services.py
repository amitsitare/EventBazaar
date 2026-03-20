from fastapi import APIRouter, Depends, HTTPException, status, Header, UploadFile, File, Request
from typing import Optional, List
from pathlib import Path
import os
from uuid import uuid4

from ..db import get_db_conn
from ..schemas import ServiceCreate, ServicePublic, ServiceItemCreate, ServiceItemPublic, ReviewPublic
from .auth import get_current_user


router = APIRouter()


UPLOAD_DIR = Path(__file__).parent.parent / "uploads" / "services"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

ITEM_UPLOAD_DIR = Path(__file__).parent.parent / "uploads" / "items"
ITEM_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

RATING_STATS_JOIN = """
LEFT JOIN (
    SELECT service_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*)::int AS review_count
    FROM reviews
    GROUP BY service_id
) rs ON rs.service_id = s.id
"""


@router.post("/upload-images")
async def upload_service_images(
    request: Request,
    files: List[UploadFile] = File(...),
    payload=Depends(get_current_user),
):
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")

    if not files:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No files uploaded")

    provider_id = int(payload["sub"])
    saved_urls: List[str] = []

    for upload in files:
        original_name = upload.filename or ""
        ext = os.path.splitext(original_name)[1].lower()
        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            continue

        safe_name = f"{provider_id}_{uuid4().hex}{ext}"
        dest_path = UPLOAD_DIR / safe_name

        content = await upload.read()
        with dest_path.open("wb") as f:
            f.write(content)

        base_url = str(request.base_url).rstrip("/")
        url = f"{base_url}/uploads/services/{safe_name}"
        saved_urls.append(url)

    if not saved_urls:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid image files uploaded")

    return {"urls": saved_urls}


@router.post("/{service_id}/items/upload-image")
async def upload_item_image(
    service_id: int,
    request: Request,
    file: UploadFile = File(...),
    payload=Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    await _assert_provider_owns_service(service_id, provider_id, conn)

    original_name = file.filename or ""
    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file type")

    safe_name = f"{provider_id}_{service_id}_{uuid4().hex}{ext}"
    dest_path = ITEM_UPLOAD_DIR / safe_name
    content = await file.read()
    with dest_path.open("wb") as f:
        f.write(content)

    base_url = str(request.base_url).rstrip("/")
    url = f"{base_url}/uploads/items/{safe_name}"
    return {"url": url}


@router.post("/", response_model=ServicePublic)
async def create_service(data: ServiceCreate, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    # Require at least one image (either primary photo_url or at least one entry in photo_urls).
    has_primary = bool((data.photo_url or "").strip())
    has_gallery = bool(data.photo_urls and any((u or "").strip() for u in data.photo_urls))
    if not (has_primary or has_gallery):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one image is required")

    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    price_val = data.price if data.price is not None else None
    async with conn.cursor() as cur:
        await cur.execute(
            """
            INSERT INTO services (provider_id, name, description, price, photo_url, photo_urls, location)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, provider_id, name, description, price, photo_url, photo_urls, location
            """,
            (provider_id, data.name, data.description, price_val, data.photo_url, data.photo_urls, data.location),
        )
        row = await cur.fetchone()
        await conn.commit()
        return ServicePublic(**{
            "id": row[0],
            "provider_id": row[1],
            "name": row[2],
            "description": row[3],
            "price": float(row[4]) if row[4] is not None else None,
            "photo_url": row[5],
            "photo_urls": row[6],
            "location": row[7],
            "avg_rating": 0,
            "review_count": 0,
        })


@router.get("/", response_model=List[ServicePublic])
async def list_services(query: Optional[str] = None, location: Optional[str] = None, conn=Depends(get_db_conn)):
    base = f"""
    SELECT
        s.id, s.provider_id, s.name, s.description, s.price, s.photo_url, s.photo_urls, s.location,
        COALESCE(rs.avg_rating, 0) AS avg_rating, COALESCE(rs.review_count, 0) AS review_count
    FROM services s
    {RATING_STATS_JOIN}
    """
    filters = []
    params = []
    if query:
        filters.append("(s.name ILIKE %s OR s.description ILIKE %s)")
        like = f"%{query}%"
        params.extend([like, like])
    if location:
        filters.append("s.location ILIKE %s")
        params.append(f"%{location}%")
    if filters:
        base += " WHERE " + " AND ".join(filters)
    base += " ORDER BY COALESCE(rs.avg_rating, 0) DESC, COALESCE(rs.review_count, 0) DESC, s.id DESC"
    async with conn.cursor() as cur:
        await cur.execute(base, params)
        rows = await cur.fetchall()
        return [
            ServicePublic(
                id=r[0],
                provider_id=r[1],
                name=r[2],
                description=r[3],
                price=float(r[4]) if r[4] is not None else None,
                photo_url=r[5],
                photo_urls=r[6],
                location=r[7],
                avg_rating=float(r[8] or 0),
                review_count=int(r[9] or 0),
            )
            for r in rows
        ]


@router.get("/my", response_model=List[ServicePublic])
async def get_my_services(payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    async with conn.cursor() as cur:
        await cur.execute(
            f"""
            SELECT
                s.id, s.provider_id, s.name, s.description, s.price, s.photo_url, s.photo_urls, s.location,
                COALESCE(rs.avg_rating, 0) AS avg_rating, COALESCE(rs.review_count, 0) AS review_count
            FROM services s
            {RATING_STATS_JOIN}
            WHERE s.provider_id = %s
            ORDER BY s.id DESC
            """,
            (provider_id,),
        )
        rows = await cur.fetchall()
        return [
            ServicePublic(
                id=r[0],
                provider_id=r[1],
                name=r[2],
                description=r[3],
                price=float(r[4]) if r[4] is not None else None,
                photo_url=r[5],
                photo_urls=r[6],
                location=r[7],
                avg_rating=float(r[8] or 0),
                review_count=int(r[9] or 0),
            )
            for r in rows
        ]


@router.get("/{service_id}", response_model=ServicePublic)
async def get_service(service_id: int, conn=Depends(get_db_conn)):
    async with conn.cursor() as cur:
        await cur.execute(
            f"""
            SELECT
                s.id, s.provider_id, s.name, s.description, s.price, s.photo_url, s.photo_urls, s.location,
                COALESCE(rs.avg_rating, 0) AS avg_rating, COALESCE(rs.review_count, 0) AS review_count
            FROM services s
            {RATING_STATS_JOIN}
            WHERE s.id=%s
            """,
            (service_id,),
        )
        row = await cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Service not found")
        return ServicePublic(
            id=row[0],
            provider_id=row[1],
            name=row[2],
            description=row[3],
            price=float(row[4]) if row[4] is not None else None,
            photo_url=row[5],
            photo_urls=row[6],
            location=row[7],
            avg_rating=float(row[8] or 0),
            review_count=int(row[9] or 0),
        )


@router.put("/{service_id}", response_model=ServicePublic)
async def update_service(service_id: int, data: ServiceCreate, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    # Require at least one image when updating as well.
    has_primary = bool((data.photo_url or "").strip())
    has_gallery = bool(data.photo_urls and any((u or "").strip() for u in data.photo_urls))
    if not (has_primary or has_gallery):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one image is required")
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    price_val = data.price if data.price is not None else None
    async with conn.cursor() as cur:
        await cur.execute("SELECT provider_id FROM services WHERE id=%s", (service_id,))
        row = await cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Service not found")
        if row[0] != provider_id:
            raise HTTPException(status_code=403, detail="Not owner")
        await cur.execute(
            """
            UPDATE services SET name=%s, description=%s, price=%s, photo_url=%s, photo_urls=%s, location=%s
            WHERE id=%s
            RETURNING id, provider_id, name, description, price, photo_url, photo_urls, location
            """,
            (data.name, data.description, price_val, data.photo_url, data.photo_urls, data.location, service_id),
        )
        row = await cur.fetchone()
        await conn.commit()
        return ServicePublic(
            id=row[0],
            provider_id=row[1],
            name=row[2],
            description=row[3],
            price=float(row[4]) if row[4] is not None else None,
            photo_url=row[5],
            photo_urls=row[6],
            location=row[7],
            avg_rating=0,
            review_count=0,
        )


async def _assert_provider_owns_service(service_id: int, provider_id: int, conn) -> None:
    async with conn.cursor() as cur:
        await cur.execute("SELECT provider_id FROM services WHERE id=%s", (service_id,))
        row = await cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Service not found")
        if int(row[0]) != int(provider_id):
            raise HTTPException(status_code=403, detail="Not owner")


@router.get("/{service_id}/items/public", response_model=List[ServiceItemPublic])
async def list_service_items_public(service_id: int, conn=Depends(get_db_conn)):
    """List items for a service (public, no auth). Used on service detail page for customers."""
    async with conn.cursor() as cur:
        await cur.execute("SELECT id FROM services WHERE id=%s", (service_id,))
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Service not found")
        await cur.execute(
            "SELECT id, service_id, name, quantity, amount, photo_url FROM service_items WHERE service_id=%s ORDER BY id",
            (service_id,),
        )
        rows = await cur.fetchall()
        return [
            ServiceItemPublic(
                id=r[0], service_id=r[1], name=r[2], quantity=r[3],
                amount=float(r[4]) if r[4] is not None else None,
                photo_url=r[5],
            )
            for r in rows
        ]


@router.get("/{service_id}/items", response_model=List[ServiceItemPublic])
async def list_service_items(service_id: int, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    await _assert_provider_owns_service(service_id, provider_id, conn)

    async with conn.cursor() as cur:
        await cur.execute(
            "SELECT id, service_id, name, quantity, amount, photo_url FROM service_items WHERE service_id=%s ORDER BY id DESC",
            (service_id,),
        )
        rows = await cur.fetchall()
        return [
            ServiceItemPublic(id=r[0], service_id=r[1], name=r[2], quantity=r[3], amount=float(r[4]) if r[4] is not None else None, photo_url=r[5])
            for r in rows
        ]


@router.post("/{service_id}/items", response_model=ServiceItemPublic)
async def add_service_item(service_id: int, data: ServiceItemCreate, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    await _assert_provider_owns_service(service_id, provider_id, conn)

    name = (data.name or "").strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item name is required")
    photo_url = (data.photo_url or "").strip()
    if not photo_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item image is required")
    qty = (data.quantity or "").strip()
    if not qty:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity is required")
    amount = data.amount
    if amount is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount is required")
    if float(amount) < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be >= 0")

    async with conn.cursor() as cur:
        await cur.execute(
            """
            INSERT INTO service_items (service_id, name, quantity, amount, photo_url)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, service_id, name, quantity, amount, photo_url
            """,
            (service_id, name, qty, amount, photo_url),
        )
        row = await cur.fetchone()
        await conn.commit()
        return ServiceItemPublic(
            id=row[0],
            service_id=row[1],
            name=row[2],
            quantity=row[3],
            amount=float(row[4]) if row[4] is not None else None,
            photo_url=row[5],
        )


@router.put("/{service_id}/items/{item_id}", response_model=ServiceItemPublic)
async def update_service_item(
    service_id: int,
    item_id: int,
    data: ServiceItemCreate,
    payload=Depends(get_current_user),
    conn=Depends(get_db_conn),
):
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    await _assert_provider_owns_service(service_id, provider_id, conn)

    name = (data.name or "").strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item name is required")
    qty = (data.quantity or "").strip()
    if not qty:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity is required")
    amount = data.amount
    if amount is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount is required")
    if float(amount) < 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be >= 0")

    async with conn.cursor() as cur:
        await cur.execute(
            "SELECT id, service_id, name, quantity, amount, photo_url FROM service_items WHERE id=%s AND service_id=%s",
            (item_id, service_id),
        )
        row = await cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Item not found")

        photo_url = (data.photo_url or "").strip() or row[5]
        if not photo_url:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item image is required")

        await cur.execute(
            """
            UPDATE service_items SET name=%s, quantity=%s, amount=%s, photo_url=%s
            WHERE id=%s AND service_id=%s
            RETURNING id, service_id, name, quantity, amount, photo_url
            """,
            (name, qty, amount, photo_url, item_id, service_id),
        )
        row = await cur.fetchone()
        await conn.commit()
        return ServiceItemPublic(
            id=row[0],
            service_id=row[1],
            name=row[2],
            quantity=row[3],
            amount=float(row[4]) if row[4] is not None else None,
            photo_url=row[5],
        )


@router.delete("/{service_id}/items/{item_id}")
async def delete_service_item(service_id: int, item_id: int, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    await _assert_provider_owns_service(service_id, provider_id, conn)

    async with conn.cursor() as cur:
        await cur.execute("DELETE FROM service_items WHERE id=%s AND service_id=%s", (item_id, service_id))
        await conn.commit()
        return {"status": "deleted"}


@router.delete("/{service_id}")
async def delete_service(service_id: int, payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    if payload.get("role") != "provider":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Providers only")
    provider_id = int(payload["sub"])
    async with conn.cursor() as cur:
        await cur.execute("SELECT provider_id FROM services WHERE id=%s", (service_id,))
        row = await cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Service not found")
        if row[0] != provider_id:
            raise HTTPException(status_code=403, detail="Not owner")
        await cur.execute("DELETE FROM services WHERE id=%s", (service_id,))
        await conn.commit()
        return {"status": "deleted"}


@router.get("/{service_id}/reviews", response_model=List[ReviewPublic])
async def list_service_reviews(service_id: int, conn=Depends(get_db_conn)):
    async with conn.cursor() as cur:
        await cur.execute("SELECT id FROM services WHERE id=%s", (service_id,))
        if not await cur.fetchone():
            raise HTTPException(status_code=404, detail="Service not found")
        await cur.execute(
            """
            SELECT r.id, r.booking_id, r.service_id, r.customer_id, u.name, r.rating, r.comment, r.created_at
            FROM reviews r
            JOIN users u ON u.id = r.customer_id
            WHERE r.service_id = %s
            ORDER BY r.created_at DESC
            LIMIT 100
            """,
            (service_id,),
        )
        rows = await cur.fetchall()
    return [
        ReviewPublic(
            id=r[0],
            booking_id=r[1],
            service_id=r[2],
            customer_id=r[3],
            customer_name=r[4],
            rating=int(r[5]),
            comment=r[6],
            created_at=r[7].isoformat() if r[7] else "",
        )
        for r in rows
    ]

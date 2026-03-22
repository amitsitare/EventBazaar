from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional
import psycopg

from ..db import get_db_conn
from ..schemas import UserCreate, UserLogin, UserPublic, TokenResponse
from ..security import hash_password, verify_password, create_access_token, decode_access_token


router = APIRouter()


async def get_current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
        return payload
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.post("/register", response_model=UserPublic)
async def register(user: UserCreate, conn=Depends(get_db_conn)):
    try:
        normalized_email = user.email.strip().lower()
        async with conn.cursor() as cur:
            # Check if user already exists
            await cur.execute("SELECT id FROM users WHERE LOWER(email) = %s", (normalized_email,))
            existing_user = await cur.fetchone()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="User with this email already exists"
                )
            
            # Insert new user
            await cur.execute(
                """
                INSERT INTO users (
                    name,
                    email,
                    mobile,
                    whatsapp_number,
                    address,
                    role,
                    password_hash,
                    latitude,
                    longitude
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, email, mobile, whatsapp_number, address, role, latitude, longitude
                """,
                (
                    user.name,
                    normalized_email,
                    user.mobile,
                    user.whatsapp_number,
                    user.address,
                    user.role,
                    hash_password(user.password),
                    user.latitude,
                    user.longitude,
                ),
            )
            row = await cur.fetchone()
            await conn.commit()
            
            return UserPublic(**{
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "mobile": row[3],
                "whatsapp_number": row[4],
                "address": row[5],
                "role": row[6],
                "latitude": row[7],
                "longitude": row[8],
            })
    except psycopg.IntegrityError as e:
        await conn.rollback()
        if "users_email_key" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="User with this email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Invalid data provided"
        )
    except HTTPException:
        await conn.rollback()
        raise
    except Exception:
        await conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Registration failed"
        )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, conn=Depends(get_db_conn)):
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id, email, password_hash, role FROM users WHERE email = %s", 
                (data.email,)
            )
            row = await cur.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, 
                    detail="Invalid email or password"
                )
            
            user_id, email, password_hash_value, role = row
            
            if not verify_password(data.password, password_hash_value):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, 
                    detail="Invalid email or password"
                )
            
            token = create_access_token(str(user_id), role)
            return TokenResponse(access_token=token)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Login failed"
        )


@router.get("/me", response_model=UserPublic)
async def me(payload=Depends(get_current_user), conn=Depends(get_db_conn)):
    try:
        user_id = int(payload["sub"])  # subject is user id
        async with conn.cursor() as cur:
            await cur.execute(
                """
                SELECT
                    id,
                    name,
                    email,
                    mobile,
                    whatsapp_number,
                    address,
                    role,
                    latitude,
                    longitude
                FROM users
                WHERE id = %s
                """,
                (user_id,),
            )
            row = await cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="User not found")
            return UserPublic(**{
                "id": row[0],
                "name": row[1],
                "email": row[2],
                "mobile": row[3],
                "whatsapp_number": row[4],
                "address": row[5],
                "role": row[6],
                "latitude": row[7],
                "longitude": row[8],
            })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to get user profile"
        )

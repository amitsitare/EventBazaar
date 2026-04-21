from typing import Optional, Literal, List
from datetime import date
from pydantic import BaseModel, EmailStr, Field, constr


UserRole = Literal["provider", "customer"]


class UserBase(BaseModel):
    name: str
    email: EmailStr
    mobile: constr(pattern=r"^\d{10}$")
    whatsapp_number: Optional[str] = None
    address: Optional[str] = None
    role: UserRole
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    mobile: str
    whatsapp_number: Optional[str] = None
    address: Optional[str] = None
    role: UserRole
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    photo_url: Optional[str] = None
    photo_urls: Optional[List[str]] = None
    location: str


class ServiceCreate(ServiceBase):
    pass


class ServicePublic(ServiceBase):
    id: int
    provider_id: int
    avg_rating: Optional[float] = None
    review_count: int = 0


class ServiceItemBase(BaseModel):
    name: str
    quantity: Optional[str] = None
    amount: Optional[float] = None
    photo_url: Optional[str] = None


class ServiceItemCreate(ServiceItemBase):
    pass


class ServiceItemPublic(ServiceItemBase):
    id: int
    service_id: int


class ServiceUnavailableDateCreate(BaseModel):
    blocked_date: date
    reason: Optional[str] = None


class ServiceUnavailableDatePublic(BaseModel):
    id: int
    service_id: int
    blocked_date: date
    reason: Optional[str] = None
    created_at: str


class BookingBase(BaseModel):
    service_id: int
    event_date: date
    quantity: Optional[int] = 1
    notes: Optional[str] = None
    address: Optional[str] = None
    duration_hours: Optional[int] = None
    paid_amount: Optional[float] = None


class BookingCreate(BookingBase):
    pass


class BookingPublic(BookingBase):
    id: int
    customer_id: int
    status: Literal["pending", "confirmed", "cancelled"]
    service_name: Optional[str] = None
    service_location: Optional[str] = None
    review_rating: Optional[int] = None
    review_comment: Optional[str] = None


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class ReviewPublic(BaseModel):
    id: int
    booking_id: int
    service_id: int
    customer_id: int
    customer_name: str
    rating: int
    comment: Optional[str] = None
    created_at: str




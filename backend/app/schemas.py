from typing import Optional, Literal, List
from datetime import date
from pydantic import BaseModel, EmailStr, constr


UserRole = Literal["provider", "customer"]


class UserBase(BaseModel):
    name: str
    email: EmailStr
    mobile: constr(pattern=r"^\d{10}$")
    whatsapp_number: Optional[str] = None
    address: str
    role: UserRole
    latitude: float
    longitude: float


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
    address: str
    role: UserRole
    latitude: float
    longitude: float


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


class BookingBase(BaseModel):
    service_id: int
    event_date: date
    quantity: Optional[int] = 1
    notes: Optional[str] = None
    address: Optional[str] = None
    duration_hours: Optional[int] = None


class BookingCreate(BookingBase):
    pass


class BookingPublic(BookingBase):
    id: int
    customer_id: int
    status: Literal["pending", "confirmed", "cancelled"]




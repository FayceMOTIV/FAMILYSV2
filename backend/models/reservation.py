from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timezone, date, time
import uuid

class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    customer_name: str
    customer_email: Optional[EmailStr] = None
    customer_phone: str
    reservation_date: date
    reservation_time: time
    party_size: int
    status: str = "pending"  # pending, confirmed, canceled, completed
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReservationCreate(BaseModel):
    customer_name: str
    customer_email: Optional[EmailStr] = None
    customer_phone: str
    reservation_date: date
    reservation_time: time
    party_size: int
    notes: Optional[str] = None

class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

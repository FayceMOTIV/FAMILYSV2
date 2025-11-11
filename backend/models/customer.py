from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    email: EmailStr
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    loyalty_points: float = 0.0
    total_orders: int = 0
    total_spent: float = 0.0
    last_order_date: Optional[datetime] = None
    segment: Optional[str] = None  # loyal, inactive, high_value
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomerCreate(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    segment: Optional[str] = None

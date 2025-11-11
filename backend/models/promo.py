from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, date
import uuid

class Promo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    title: str
    description: str
    discount_type: str  # percentage, fixed
    discount_value: float
    code: Optional[str] = None
    start_date: date
    end_date: date
    target_category: Optional[str] = None
    target_product: Optional[str] = None
    min_purchase: Optional[float] = None
    is_active: bool = True
    usage_limit: Optional[int] = None
    usage_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PromoCreate(BaseModel):
    title: str
    description: str
    discount_type: str
    discount_value: float
    code: Optional[str] = None
    start_date: date
    end_date: date
    target_category: Optional[str] = None
    target_product: Optional[str] = None
    min_purchase: Optional[float] = None
    usage_limit: Optional[int] = None

class PromoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    code: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_category: Optional[str] = None
    target_product: Optional[str] = None
    min_purchase: Optional[float] = None
    is_active: Optional[bool] = None
    usage_limit: Optional[int] = None

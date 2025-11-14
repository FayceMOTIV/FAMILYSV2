from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    name: str
    image: Optional[str] = None
    icon: Optional[str] = None
    order: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(BaseModel):
    name: str
    image: Optional[str] = None
    icon: Optional[str] = None
    order: int = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None

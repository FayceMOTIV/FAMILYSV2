from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone
import uuid

class ProductOption(BaseModel):
    id: str
    name: str
    delta_price: float = 0.0

class ProductOptionGroup(BaseModel):
    id: str
    name: str
    type: str  # single, multi
    required: bool = False
    show_if: Optional[Dict[str, str]] = None
    options: List[ProductOption]

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    name: str
    category: str
    description: str
    base_price: float
    vat_rate: float = 10.0
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)  # best-seller, new, popular
    badge: Optional[str] = None  # "promo", "bestseller", "nouveau", "cashback_booste"
    is_available: bool = True
    is_out_of_stock: bool = False
    stock_status: Optional[str] = None  # '2h', 'today', 'indefinite'
    stock_resume_at: Optional[str] = None  # Timestamp pour réactivation auto
    option_groups: List[ProductOptionGroup] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    category: str
    description: str
    base_price: float
    vat_rate: float = 10.0
    image_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    option_groups: List[ProductOptionGroup] = Field(default_factory=list)

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = None
    vat_rate: Optional[float] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_available: Optional[bool] = None
    is_out_of_stock: Optional[bool] = None
    option_groups: Optional[List[ProductOptionGroup]] = None

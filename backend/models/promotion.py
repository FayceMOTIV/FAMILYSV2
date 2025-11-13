from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, date, time
from enum import Enum
import uuid

class PromotionType(str, Enum):
    BOGO = "bogo"  # Buy One Get One
    PERCENT_ITEM = "percent_item"  # % sur produit
    PERCENT_CATEGORY = "percent_category"  # % sur catégorie
    FIXED_ITEM = "fixed_item"  # € sur produit
    FIXED_CATEGORY = "fixed_category"  # € sur catégorie
    CONDITIONAL_DISCOUNT = "conditional_discount"  # 2e à -50%, 3 pour 2
    THRESHOLD = "threshold"  # Dès X€ d'achat
    SHIPPING_FREE = "shipping_free"  # Livraison gratuite
    NEW_CUSTOMER = "new_customer"  # 1ère commande
    INACTIVE_CUSTOMER = "inactive_customer"  # Client inactif
    LOYALTY_MULTIPLIER = "loyalty_multiplier"  # x2, x3 points
    HAPPY_HOUR = "happy_hour"  # Horaires définis
    FLASH = "flash"  # Durée limitée
    SEASONAL = "seasonal"  # Événementiel
    PROMO_CODE = "promo_code"  # Code manuel

class DiscountValueType(str, Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    FREE_ITEM = "free_item"
    MULTIPLIER = "multiplier"

class Promotion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    
    # Identification
    name: str
    description: str
    type: PromotionType
    
    # Ciblage
    eligible_products: List[str] = []
    eligible_categories: List[str] = []
    excluded_products: List[str] = []
    excluded_categories: List[str] = []
    
    # Valeur de la remise
    discount_type: DiscountValueType
    discount_value: float
    
    # Conditions BOGO
    bogo_buy_quantity: Optional[int] = 1
    bogo_get_quantity: Optional[int] = 1
    bogo_cheapest_free: bool = False
    
    # Conditions conditionnelles (2e à -50%)
    conditional_quantity: Optional[int] = None
    conditional_discount_percent: Optional[float] = None
    
    # Seuil de panier
    min_cart_amount: Optional[float] = None
    max_cart_amount: Optional[float] = None
    
    # Dates et horaires
    start_date: date
    end_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    days_active: List[str] = []  # ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    
    # Code promo
    promo_code: Optional[str] = None
    code_required: bool = False
    
    # Limites
    limit_per_customer: Optional[int] = None
    limit_total: Optional[int] = None
    usage_count: int = 0
    
    # Priorités et cumul
    priority: int = 0  # Plus élevé = appliqué en premier
    stackable: bool = False
    stacking_group: Optional[str] = None
    
    # Ciblage client
    target_new_customers: bool = False
    target_inactive_days: Optional[int] = None
    
    # Multiplicateur fidélité
    multiplier_value: Optional[float] = None
    limit_points: Optional[int] = None
    
    # Affichage
    badge_text: Optional[str] = None
    badge_color: Optional[str] = None
    banner_text: Optional[str] = None
    banner_image: Optional[str] = None
    ticket_text: Optional[str] = None
    
    # Événementiel
    event_name: Optional[str] = None
    event_theme: Optional[str] = None
    
    # État
    is_active: bool = True
    status: str = "active"  # draft, active, paused, expired
    
    # Métadonnées
    created_by: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Analytics
    analytics: Dict[str, Any] = {}

class PromotionCreate(BaseModel):
    name: str
    description: str
    type: PromotionType
    eligible_products: List[str] = []
    eligible_categories: List[str] = []
    excluded_products: List[str] = []
    excluded_categories: List[str] = []
    discount_type: DiscountValueType
    discount_value: float
    bogo_buy_quantity: Optional[int] = 1
    bogo_get_quantity: Optional[int] = 1
    bogo_cheapest_free: bool = False
    conditional_quantity: Optional[int] = None
    conditional_discount_percent: Optional[float] = None
    min_cart_amount: Optional[float] = None
    max_cart_amount: Optional[float] = None
    start_date: date
    end_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    days_active: List[str] = []
    promo_code: Optional[str] = None
    code_required: bool = False
    limit_per_customer: Optional[int] = None
    limit_total: Optional[int] = None
    priority: int = 0
    stackable: bool = False
    stacking_group: Optional[str] = None
    target_new_customers: bool = False
    target_inactive_days: Optional[int] = None
    multiplier_value: Optional[float] = None
    limit_points: Optional[int] = None
    badge_text: Optional[str] = None
    badge_color: Optional[str] = None
    banner_text: Optional[str] = None
    banner_image: Optional[str] = None
    ticket_text: Optional[str] = None
    event_name: Optional[str] = None
    event_theme: Optional[str] = None

class PromotionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[PromotionType] = None
    eligible_products: Optional[List[str]] = None
    eligible_categories: Optional[List[str]] = None
    excluded_products: Optional[List[str]] = None
    excluded_categories: Optional[List[str]] = None
    discount_type: Optional[DiscountValueType] = None
    discount_value: Optional[float] = None
    bogo_buy_quantity: Optional[int] = None
    bogo_get_quantity: Optional[int] = None
    bogo_cheapest_free: Optional[bool] = None
    conditional_quantity: Optional[int] = None
    conditional_discount_percent: Optional[float] = None
    min_cart_amount: Optional[float] = None
    max_cart_amount: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    days_active: Optional[List[str]] = None
    promo_code: Optional[str] = None
    code_required: Optional[bool] = None
    limit_per_customer: Optional[int] = None
    limit_total: Optional[int] = None
    priority: Optional[int] = None
    stackable: Optional[bool] = None
    stacking_group: Optional[str] = None
    target_new_customers: Optional[bool] = None
    target_inactive_days: Optional[int] = None
    multiplier_value: Optional[float] = None
    limit_points: Optional[int] = None
    badge_text: Optional[str] = None
    badge_color: Optional[str] = None
    banner_text: Optional[str] = None
    banner_image: Optional[str] = None
    ticket_text: Optional[str] = None
    event_name: Optional[str] = None
    event_theme: Optional[str] = None
    is_active: Optional[bool] = None
    status: Optional[str] = None

class PromotionUsageLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    promotion_id: str
    order_id: str
    customer_id: str
    discount_amount: float
    original_amount: float
    final_amount: float
    promo_code_used: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone
import uuid

class OrderStatus:
    NEW = "new"
    IN_PREPARATION = "in_preparation"
    OUT_FOR_DELIVERY = "out_for_delivery"
    READY = "ready"
    COMPLETED = "completed"
    CANCELED = "canceled"

class PaymentMethod:
    CARD = "card"
    CASH = "cash"
    TICKET_RESTO = "ticket_resto"
    CHECK = "check"
    LOYALTY = "loyalty"

class OrderItem(BaseModel):
    product_id: str
    name: str
    base_price: float
    quantity: int
    options: List[Dict] = Field(default_factory=list)
    total_price: float
    notes: Optional[str] = None
    promo_applied: Optional[Dict] = None  # Promo appliquée sur cet item

class AppliedPromotion(BaseModel):
    promo_id: str
    promo_name: str
    promo_type: str
    discount_amount: float
    badge_text: Optional[str] = None
    details: Optional[Dict] = None  # Ex: items gratuits pour BOGO

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    order_number: str
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    items: List[OrderItem]
    subtotal: float  # Total avant promos
    promotions_applied: List[AppliedPromotion] = Field(default_factory=list)  # Promos appliquées
    promotions_discount: float = 0.0  # Montant total des remises promos
    vat_amount: float
    total: float  # Total final (après promos et cashback)
    cashback_used: float = 0.0  # Montant de cashback utilisé pour payer
    cashback_earned: float = 0.0  # Montant de cashback gagné avec cette commande
    loyalty_points_earned: int = 0  # Points fidélité gagnés
    loyalty_multiplier: float = 1.0  # Multiplicateur points (ex: x2 pour promo)
    status: str = OrderStatus.NEW
    payment_method: str = PaymentMethod.CARD
    payment_status: Optional[str] = None  # 'paid' (payé en ligne), 'pending' (à payer au restaurant), None (legacy)
    consumption_mode: str  # takeaway, on_site, delivery
    pickup_date: Optional[str] = None
    pickup_time: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    items: List[OrderItem]
    subtotal: float
    promotions_applied: List[Dict] = Field(default_factory=list)  # Promos from cart/calculate
    promotions_discount: float = 0.0
    vat_amount: float
    total: float
    use_cashback: bool = False  # Le client veut utiliser son cashback
    cashback_used: float = 0.0  # Sera calculé côté backend
    promo_code: Optional[str] = None  # Code promo saisi par le client
    payment_method: str = PaymentMethod.CARD
    consumption_mode: str
    pickup_date: Optional[str] = None
    pickup_time: Optional[str] = None
    notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str
    cancellation_reason: Optional[str] = None

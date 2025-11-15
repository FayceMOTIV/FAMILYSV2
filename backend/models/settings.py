from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, List
from datetime import datetime, timezone, time
import uuid

class RestaurantSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    name: str
    email: EmailStr
    phone: str
    address: str
    logo_url: Optional[str] = None
    primary_color: str = "#C62828"
    secondary_color: str = "#FFD54F"
    opening_hours: Dict[str, Dict] = Field(default_factory=dict)
    order_hours: Dict[str, Dict] = Field(default_factory=dict)  # Horaires de commande (différents des horaires d'ouverture)
    order_cutoff_minutes: int = 20
    preparation_time_minutes: int = 15  # Temps de préparation par créneau
    enable_delivery: bool = True
    enable_takeaway: bool = True
    enable_onsite: bool = True
    enable_reservations: bool = True
    is_paused: bool = False  # Restaurant en pause (pas de nouvelles commandes)
    pause_reason: Optional[str] = None  # Raison de la pause
    pause_duration_minutes: Optional[int] = None  # Durée de la pause en minutes
    pause_until: Optional[str] = None  # Timestamp de fin de pause
    no_more_orders_today: bool = False  # Plus de commandes pour aujourd'hui
    # Codes PIN pour les modes
    pin_orders_mode: Optional[str] = None  # PIN pour Mode Commande (4 chiffres)
    pin_delivery_mode: Optional[str] = None  # PIN pour Mode Livraison (4 chiffres)
    pin_reservation_mode: Optional[str] = None  # PIN pour Mode Réservation (4 chiffres)
    loyalty_percentage: float = 5.0
    stripe_key: Optional[str] = None
    service_links: Dict[str, str] = Field(default_factory=dict)  # Liens Stripe, PayPal, etc
    social_media: Dict[str, str] = Field(default_factory=dict)  # Liens réseaux sociaux
    terms_url: Optional[str] = None
    privacy_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    opening_hours: Optional[Dict] = None
    order_hours: Optional[Dict] = None
    order_cutoff_minutes: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    enable_delivery: Optional[bool] = None
    enable_takeaway: Optional[bool] = None
    enable_onsite: Optional[bool] = None
    enable_reservations: Optional[bool] = None
    is_paused: Optional[bool] = None
    pause_reason: Optional[str] = None
    pause_duration_minutes: Optional[int] = None
    pause_until: Optional[str] = None
    no_more_orders_today: Optional[bool] = None
    pin_orders_mode: Optional[str] = None
    pin_delivery_mode: Optional[str] = None
    pin_reservation_mode: Optional[str] = None
    loyalty_percentage: Optional[float] = None
    stripe_key: Optional[str] = None
    service_links: Optional[Dict] = None
    social_media: Optional[Dict] = None

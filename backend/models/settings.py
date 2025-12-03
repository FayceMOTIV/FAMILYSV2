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
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = "France"
    latitude: Optional[float] = None  # Pour GPS
    longitude: Optional[float] = None  # Pour GPS
    logo_url: Optional[str] = None
    primary_color: str = "#C62828"
    secondary_color: str = "#FFD54F"
    opening_hours: Dict[str, Dict] = Field(default_factory=dict)
    order_hours: Dict[str, Dict] = Field(default_factory=dict)
    order_cutoff_minutes: int = 20
    preparation_time_minutes: int = 15
    time_slot_interval: int = 15  # Intervalle entre créneaux en minutes
    enable_delivery: bool = True
    enable_takeaway: bool = True
    enable_onsite: bool = True
    enable_reservations: bool = True
    is_paused: bool = False
    pause_reason: Optional[str] = None
    pause_duration_minutes: Optional[int] = None
    pause_until: Optional[str] = None
    no_more_orders_today: bool = False
    pin_orders_mode: Optional[str] = None
    pin_delivery_mode: Optional[str] = None
    pin_reservation_mode: Optional[str] = None
    loyalty_percentage: float = 5.0
    loyalty_exclude_promos_from_calculation: bool = False
    auto_badges_enabled: bool = False
    stripe_key: Optional[str] = None
    service_links: Dict[str, str] = Field(default_factory=dict)
    social_media: Dict[str, str] = Field(default_factory=dict)  # facebook, instagram, twitter, tiktok
    
    # Mentions légales obligatoires
    legal_entity_name: Optional[str] = None  # Raison sociale
    siret: Optional[str] = None  # N° SIRET
    vat_number: Optional[str] = None  # N° TVA
    legal_form: Optional[str] = None  # Forme juridique (SARL, SAS, etc.)
    share_capital: Optional[str] = None  # Capital social
    registration_city: Optional[str] = None  # Ville d'immatriculation
    director_name: Optional[str] = None  # Nom du directeur de publication
    host_name: Optional[str] = None  # Nom de l'hébergeur
    host_address: Optional[str] = None  # Adresse de l'hébergeur
    
    terms_url: Optional[str] = None
    privacy_url: Optional[str] = None
    cgv_url: Optional[str] = None  # Conditions générales de vente
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    opening_hours: Optional[Dict] = None
    order_hours: Optional[Dict] = None
    order_cutoff_minutes: Optional[int] = None
    preparation_time_minutes: Optional[int] = None
    time_slot_interval: Optional[int] = None
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
    loyalty_exclude_promos_from_calculation: Optional[bool] = None
    auto_badges_enabled: Optional[bool] = None
    stripe_key: Optional[str] = None
    service_links: Optional[Dict] = None
    social_media: Optional[Dict] = None
    legal_entity_name: Optional[str] = None
    siret: Optional[str] = None
    vat_number: Optional[str] = None
    legal_form: Optional[str] = None
    share_capital: Optional[str] = None
    registration_city: Optional[str] = None
    director_name: Optional[str] = None
    host_name: Optional[str] = None
    host_address: Optional[str] = None
    terms_url: Optional[str] = None
    privacy_url: Optional[str] = None
    cgv_url: Optional[str] = None

class PublicRestaurantInfo(BaseModel):
    """Informations publiques du restaurant pour l'app mobile"""
    name: str
    phone: str
    email: str
    address: str
    city: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_hours: Dict[str, Dict] = Field(default_factory=dict)
    social_media: Dict[str, str] = Field(default_factory=dict)
    legal_entity_name: Optional[str] = None
    siret: Optional[str] = None
    vat_number: Optional[str] = None
    legal_form: Optional[str] = None
    share_capital: Optional[str] = None
    registration_city: Optional[str] = None
    director_name: Optional[str] = None
    host_name: Optional[str] = None
    host_address: Optional[str] = None
    terms_url: Optional[str] = None
    privacy_url: Optional[str] = None
    cgv_url: Optional[str] = None

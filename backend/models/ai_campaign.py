from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class AICampaignSuggestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    name: str
    type: str  # produit, fidelite, happy_hour, reactivation, panier_moyen
    product_ids: Optional[List[str]] = []
    category_ids: Optional[List[str]] = []
    message: str  # Message motivant de l'IA
    start_date: str
    end_date: str
    discount_type: str  # percentage, fixed, bogo, fidelity_multiplier
    discount_value: float
    target_hours: Optional[str] = None  # Ex: "14h-18h"
    impact_estimate: dict  # {ca_increase: "+18%", difficulty: "facile", duration: "3 jours"}
    status: str = "pending"  # pending, accepted, refused
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    validated_at: Optional[str] = None
    validated_by: Optional[str] = None

class AICampaignResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_id: str
    restaurant_id: str
    accepted: bool
    real_ca: Optional[float] = 0.0
    estimated_gain_percent: Optional[float] = 0.0
    fidelity_points_gained: Optional[int] = 0
    orders_count: Optional[int] = 0
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AICampaignValidation(BaseModel):
    accepted: bool
    notes: Optional[str] = None

class AIMarketingSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    analysis_frequency: str = "daily"  # daily, weekly
    max_suggestions_per_week: int = 5
    max_promo_budget_percent: float = 15.0
    excluded_product_ids: List[str] = []
    excluded_category_ids: List[str] = []
    priority_objectives: List[str] = ["boost_ca", "fideliser", "reactiver", "augmenter_panier"]
    allowed_offer_types: List[str] = ["bogo", "percentage", "fidelity", "happy_hour", "reactivation"]
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

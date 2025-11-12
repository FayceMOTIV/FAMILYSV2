from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class OptionChoice(BaseModel):
    """Un choix dans une option."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float = 0.0  # Prix additionnel pour ce choix

class ProductOption(BaseModel):
    """Option pour un produit (ex: Taille, Sauce, etc.)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    name: str  # Ex: "Taille", "Sauce", "Accompagnement"
    description: Optional[str] = None
    type: str  # "single" (choix unique) ou "multiple" (choix multiples)
    is_required: bool = False  # Option obligatoire ou non
    max_choices: Optional[int] = None  # Pour type="multiple", nombre max de choix
    price: float = 0.0  # Prix de base de l'option (optionnel)
    choices: List[OptionChoice] = []  # Liste des choix possibles
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OptionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: str = "single"
    is_required: bool = False
    max_choices: Optional[int] = None
    price: float = 0.0
    choices: List[OptionChoice] = []

class OptionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    is_required: Optional[bool] = None
    max_choices: Optional[int] = None
    price: Optional[float] = None
    choices: Optional[List[OptionChoice]] = None

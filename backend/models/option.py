from pydantic import BaseModel, Field
from typing import Optional, List, ForwardRef, TYPE_CHECKING
from datetime import datetime, timezone
import uuid

# Forward reference pour la récursivité
SubOptionRef = ForwardRef('SubOption')

class SubOptionChoice(BaseModel):
    """Un choix dans une sous-option - peut avoir ses propres sous-options (récursif)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float = 0.0
    image_url: Optional[str] = None  # Image du choix
    internal_comment: Optional[str] = None
    sub_options: List['SubOption'] = []  # Sous-options récursives (ex: MENU XL → Boissons XL)

class SubOption(BaseModel):
    """Sous-option qui apparaît si un choix spécifique est sélectionné."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # Ex: "Accompagnement", "Boisson"
    type: str = "single"  # "single" ou "multiple"
    is_required: bool = False
    choices: List[SubOptionChoice] = []

# Résoudre les références forward
SubOptionChoice.model_rebuild()
SubOption.model_rebuild()

class OptionChoice(BaseModel):
    """Un choix dans une option."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float = 0.0  # Prix additionnel pour ce choix
    image_url: Optional[str] = None
    internal_comment: Optional[str] = None
    sub_options: List[SubOption] = []  # Sous-options qui apparaissent SI ce choix est sélectionné

class ProductOption(BaseModel):
    """Option pour un produit (ex: Formule, Taille, etc.)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    name: str  # Ex: "Formule", "Taille"
    description: Optional[str] = None
    internal_comment: Optional[str] = None
    type: str = "single"  # "single" ou "multiple"
    is_required: bool = False
    max_choices: Optional[int] = None
    allow_repeat: bool = False
    price: float = 0.0
    choices: List[OptionChoice] = []
    display_order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class OptionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    internal_comment: Optional[str] = None
    type: str = "single"
    is_required: bool = False
    max_choices: Optional[int] = None
    allow_repeat: bool = False
    price: float = 0.0
    choices: List[OptionChoice] = []
    display_order: int = 0

class OptionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    internal_comment: Optional[str] = None
    type: Optional[str] = None
    is_required: Optional[bool] = None
    max_choices: Optional[int] = None
    allow_repeat: Optional[bool] = None
    price: Optional[float] = None
    choices: Optional[List[OptionChoice]] = None
    display_order: Optional[int] = None

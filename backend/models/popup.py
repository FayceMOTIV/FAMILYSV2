from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import uuid

class Popup(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str = "default"
    title: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None  # URL vers laquelle rediriger au clic
    link_type: Optional[str] = None  # internal, external, none
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    display_frequency: str = "once"  # once, every_session, every_day
    priority: int = 0  # Plus haut = affiche en premier
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PopupCreate(BaseModel):
    title: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    link_type: Optional[str] = "none"
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    display_frequency: str = "once"
    priority: int = 0

class PopupUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    link_type: Optional[str] = None
    is_active: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    display_frequency: Optional[str] = None
    priority: Optional[int] = None

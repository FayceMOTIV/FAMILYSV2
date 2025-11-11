from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    restaurant_id: str
    title: str
    message: str
    notification_type: str  # push, email, sms
    target_segment: Optional[str] = None  # all, loyal, inactive
    target_customers: Optional[List[str]] = Field(default_factory=list)
    scheduled_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    status: str = "draft"  # draft, scheduled, sent, failed
    sent_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str
    target_segment: Optional[str] = None
    scheduled_at: Optional[datetime] = None

class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None

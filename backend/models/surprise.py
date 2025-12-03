from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class SurpriseReward(BaseModel):
    id: str
    user_id: str
    user_email: str
    user_name: Optional[str] = None
    reward_type: Literal["product", "discount_percent", "discount_amount", "cashback"]
    reward_value: float
    reward_label: str
    product_id: Optional[str] = None
    claimed: bool = False
    claimed_at: Optional[datetime] = None
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SurpriseStatus(BaseModel):
    can_play: bool
    next_play_time: Optional[datetime] = None
    plays_today: int = 0
    message: str

class SurprisePlayResult(BaseModel):
    success: bool
    reward: Optional[SurpriseReward] = None
    message: str

class RecentWinner(BaseModel):
    name: str
    reward: str
    time: str

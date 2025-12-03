from fastapi import APIRouter, HTTPException
from database import db
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/notifications", tags=["notifications"])

class PushTokenRequest(BaseModel):
    email: str
    push_token: str

@router.get("/customer/{email}")
async def get_customer_notifications(email: str):
    """Get notifications for a customer by email."""
    notifications = await db.notifications.find({
        "customer_email": email,
        "restaurant_id": "default"
    }).sort("created_at", -1).to_list(length=50)
    
    for notif in notifications:
        notif.pop("_id", None)
    
    return {"notifications": notifications}

@router.patch("/{notif_id}/read")
async def mark_notification_read(notif_id: str):
    """Mark a notification as read."""
    result = await db.notifications.update_one(
        {"id": notif_id},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}

@router.post("/customer/push-token")
async def save_customer_push_token(request: PushTokenRequest):
    """Save push token for a customer."""
    await db.customers.update_one(
        {"email": request.email},
        {"$set": {
            "push_token": request.push_token,
            "push_token_updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"success": True}

from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
from database import db
from services.notification_service import send_marketing_push

router = APIRouter(prefix="/notifications", tags=["admin-notifications"])

class NotificationCreate(BaseModel):
    title: str
    message: str
    notification_type: str = "push"  # push, email, sms
    target_segment: Optional[str] = None  # all, loyal, inactive
    target_emails: Optional[List[str]] = None
    scheduled_at: Optional[datetime] = None

class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None

@router.get("")
async def get_notifications():
    """Get all notifications."""
    restaurant_id = "default"
    notifications = await db.notifications.find({
        "restaurant_id": restaurant_id,
        "type": {"$nin": ["order_preparing", "order_ready", "order_delivering", "order_completed"]}
    }).sort("created_at", -1).to_list(length=100)
    
    for notif in notifications:
        notif.pop("_id", None)
    
    return {"notifications": notifications}

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_notification(notif_create: NotificationCreate):
    """Create a new notification (draft or scheduled)."""
    restaurant_id = "default"
    
    notif = {
        "id": str(__import__('uuid').uuid4()),
        "restaurant_id": restaurant_id,
        "title": notif_create.title,
        "message": notif_create.message,
        "notification_type": notif_create.notification_type,
        "target_segment": notif_create.target_segment,
        "target_emails": notif_create.target_emails or [],
        "scheduled_at": notif_create.scheduled_at.isoformat() if notif_create.scheduled_at else None,
        "sent_at": None,
        "status": "scheduled" if notif_create.scheduled_at else "draft",
        "sent_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notifications.insert_one(notif)
    notif.pop("_id", None)
    
    return {"success": True, "notification": notif}

@router.post("/{notif_id}/send")
async def send_notification_now(notif_id: str):
    """Send a notification immediately."""
    restaurant_id = "default"
    
    notif = await db.notifications.find_one({"id": notif_id, "restaurant_id": restaurant_id})
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Envoyer les push
    target_emails = notif.get("target_emails") if notif.get("target_emails") else None
    sent_count = await send_marketing_push(
        title=notif["title"],
        message=notif["message"],
        target_emails=target_emails,
        restaurant_id=restaurant_id
    )
    
    # Mettre a jour le statut
    await db.notifications.update_one(
        {"id": notif_id},
        {"$set": {
            "status": "sent",
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "sent_count": sent_count,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": f"Notification envoyee a {sent_count} clients", "sent_count": sent_count}

@router.post("/send-instant")
async def send_instant_notification(notif_create: NotificationCreate):
    """Create and send a notification instantly."""
    restaurant_id = "default"
    
    # Envoyer immediatement
    target_emails = notif_create.target_emails if notif_create.target_emails else None
    sent_count = await send_marketing_push(
        title=notif_create.title,
        message=notif_create.message,
        target_emails=target_emails,
        restaurant_id=restaurant_id
    )
    
    # Sauvegarder dans l historique
    notif = {
        "id": str(__import__('uuid').uuid4()),
        "restaurant_id": restaurant_id,
        "title": notif_create.title,
        "message": notif_create.message,
        "notification_type": notif_create.notification_type,
        "target_segment": notif_create.target_segment,
        "target_emails": notif_create.target_emails or [],
        "scheduled_at": None,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "status": "sent",
        "sent_count": sent_count,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notifications.insert_one(notif)
    
    return {"success": True, "message": f"Notification envoyee a {sent_count} clients", "sent_count": sent_count}

@router.put("/{notif_id}")
async def update_notification(notif_id: str, notif_update: NotificationUpdate):
    """Update a notification."""
    restaurant_id = "default"
    
    existing = await db.notifications.find_one({"id": notif_id, "restaurant_id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    update_data = notif_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.notifications.update_one({"id": notif_id}, {"$set": update_data})
    
    updated = await db.notifications.find_one({"id": notif_id}, {"_id": 0})
    return {"success": True, "notification": updated}

@router.delete("/{notif_id}")
async def delete_notification(notif_id: str):
    """Delete a notification."""
    restaurant_id = "default"
    result = await db.notifications.delete_one({"id": notif_id, "restaurant_id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True, "message": "Notification supprimee"}

from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field

router = APIRouter()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['familys_restaurant']

# Public notification models (different from admin models)
class PublicNotification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PublicNotificationCreate(BaseModel):
    user_id: str
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None

@router.post("/notifications")
async def create_notification(notification: NotificationCreate):
    """
    Créer une notification pour un utilisateur
    """
    try:
        notif = Notification(
            user_id=notification.user_id,
            type=notification.type,
            title=notification.title,
            message=notification.message,
            data=notification.data
        )
        
        result = await db.notifications.insert_one(notif.dict())
        
        return {
            "success": True,
            "notification_id": notif.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notifications/{user_id}")
async def get_user_notifications(user_id: str, unread_only: bool = False):
    """
    Récupérer les notifications d'un utilisateur
    """
    try:
        query = {"user_id": user_id}
        if unread_only:
            query["is_read"] = False
        
        notifications = await db.notifications.find(query).sort("created_at", -1).to_list(length=50)
        
        return {
            "notifications": notifications,
            "count": len(notifications)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/notifications/{notification_id}/read")
async def mark_as_read(notification_id: str):
    """
    Marquer une notification comme lue
    """
    try:
        result = await db.notifications.update_one(
            {"id": notification_id},
            {"$set": {"is_read": True}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/notifications/{user_id}/mark-all-read")
async def mark_all_as_read(user_id: str):
    """
    Marquer toutes les notifications d'un utilisateur comme lues
    """
    try:
        result = await db.notifications.update_many(
            {"user_id": user_id, "is_read": False},
            {"$set": {"is_read": True}}
        )
        
        return {
            "success": True,
            "marked_count": result.modified_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def send_loyalty_credited_notification(user_id: str, order_id: str, amount_credited: float, total_points: float):
    """
    Envoyer une notification de crédit de fidélité
    """
    try:
        notification = NotificationCreate(
            user_id=user_id,
            type="loyalty_credited",
            title="🎉 Points de fidélité crédités !",
            message=f"Merci pour ta commande ! Ta carte de fidélité a été créditée de {amount_credited:.2f}€. Solde actuel : {total_points:.2f}€",
            data={
                "order_id": order_id,
                "amount_credited": amount_credited,
                "total_points": total_points
            }
        )
        
        await create_notification(notification)
        
    except Exception as e:
        print(f"Error sending loyalty notification: {e}")

from fastapi import APIRouter, HTTPException, Security, status
from typing import List
from models.notification import Notification, NotificationCreate, NotificationUpdate
from middleware.auth import require_manager_or_admin
from datetime import datetime, timezone
from database import db

router = APIRouter(prefix="/notifications", tags=["admin-notifications"])

@router.get("")  # response_model=List[Notification]
async def get_notifications():  # current_user: dict = Security(require_manager_or_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    notifications = await db.notifications.find({"restaurant_id": restaurant_id}).sort("created_at", -1).to_list(length=None)
    
    # Remove _id
    for notif in notifications:
        notif.pop("_id", None)
    
    return {"notifications": notifications}

@router.post("", status_code=status.HTTP_201_CREATED)  # response_model=Notification
async def create_notification(notif_create: NotificationCreate):  # current_user: dict = Security(require_manager_or_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    notif = Notification(restaurant_id=restaurant_id, **notif_create.model_dump())
    notif_dict = notif.model_dump()
    # Convert datetime to ISO string
    if isinstance(notif_dict.get('created_at'), datetime):
        notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    notif_dict.pop("_id", None)
    return {"success": True, "notification": notif_dict}

@router.post("/{notif_id}/send")
async def send_notification(notif_id: str):  # current_user: dict = Security(require_manager_or_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    notif = await db.notifications.find_one({"id": notif_id, "restaurant_id": restaurant_id})
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Simulate sending (real implementation would use FCM, SendGrid, etc.)
    await db.notifications.update_one(
        {"id": notif_id},
        {"$set": {
            "status": "sent",
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "sent_count": 1  # Mock
        }}
    )
    
    return {"message": "Notification sent", "sent_count": 1}

@router.delete("/{notif_id}")
async def delete_notification(notif_id: str):  # current_user: dict = Security(require_manager_or_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    result = await db.notifications.delete_one({"id": notif_id, "restaurant_id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

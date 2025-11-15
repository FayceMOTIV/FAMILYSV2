from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['familys_restaurant']

class PauseRequest(BaseModel):
    is_paused: bool
    pause_reason: Optional[str] = None
    pause_duration_minutes: Optional[int] = None  # 30, 60, 120, ou None pour indéfini

class NoMoreOrdersRequest(BaseModel):
    no_more_orders_today: bool

@router.post("/pause")
async def toggle_pause(request: PauseRequest):
    """
    Active ou désactive la pause du restaurant avec durée optionnelle
    """
    try:
        settings = await db.settings.find_one()
        
        if not settings:
            raise HTTPException(status_code=404, detail="Settings not found")
        
        # Calculer pause_until si durée spécifiée
        pause_until = None
        if request.is_paused and request.pause_duration_minutes:
            from datetime import timedelta
            pause_until = (datetime.now(timezone.utc) + timedelta(minutes=request.pause_duration_minutes)).isoformat()
        
        # Update pause status
        update_data = {
            "is_paused": request.is_paused,
            "pause_reason": request.pause_reason if request.is_paused else None,
            "pause_duration_minutes": request.pause_duration_minutes if request.is_paused else None,
            "pause_until": pause_until,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = await db.settings.update_one(
            {"_id": settings["_id"]},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update pause status")
        
        return {
            "success": True,
            "is_paused": request.is_paused,
            "pause_reason": request.pause_reason,
            "pause_until": pause_until,
            "message": "Restaurant en pause" if request.is_paused else "Restaurant réouvert"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/no-more-orders-today")
async def toggle_no_more_orders(request: NoMoreOrdersRequest):
    """
    Active/désactive le mode "Plus de commandes pour aujourd'hui"
    """
    try:
        settings = await db.settings.find_one()
        
        if not settings:
            raise HTTPException(status_code=404, detail="Settings not found")
        
        update_data = {
            "no_more_orders_today": request.no_more_orders_today,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = await db.settings.update_one(
            {"_id": settings["_id"]},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=500, detail="Failed to update")
        
        return {
            "success": True,
            "no_more_orders_today": request.no_more_orders_today,
            "message": "Plus de commandes pour aujourd'hui" if request.no_more_orders_today else "Commandes réouvertes"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pause/status")
async def get_pause_status():
    """
    Récupère le statut de pause du restaurant
    """
    try:
        settings = await db.settings.find_one()
        
        if not settings:
            return {
                "is_paused": False,
                "pause_reason": None
            }
        
        return {
            "is_paused": settings.get("is_paused", False),
            "pause_reason": settings.get("pause_reason", None)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

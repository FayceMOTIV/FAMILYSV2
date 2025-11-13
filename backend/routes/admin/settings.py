from fastapi import APIRouter, HTTPException, Security, status
from models.settings import RestaurantSettings, SettingsUpdate
from middleware.auth import require_admin
from datetime import datetime, timezone
from database import db

router = APIRouter(prefix="/settings", tags=["admin-settings"])

@router.get("", response_model=RestaurantSettings)
async def get_settings():  # current_user: dict = Security(require_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    settings = await db.settings.find_one({"restaurant_id": restaurant_id})
    
    if not settings:
        # Create default settings
        default_settings = RestaurantSettings(
            restaurant_id=restaurant_id,
            name="Family's Bourg-en-Bresse",
            email="contact@familys.app",
            phone="04 74 XX XX XX",
            address="123 Avenue de la Gare, 01000 Bourg-en-Bresse"
        )
        await db.settings.insert_one(default_settings.model_dump())
        return default_settings
    
    return RestaurantSettings(**settings)

@router.put("", response_model=RestaurantSettings)
async def update_settings(settings_update: SettingsUpdate):  # current_user: dict = Security(require_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    
    update_data = settings_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.settings.update_one(
        {"restaurant_id": restaurant_id},
        {"$set": update_data},
        upsert=True
    )
    
    updated = await db.settings.find_one({"restaurant_id": restaurant_id})
    return RestaurantSettings(**updated)

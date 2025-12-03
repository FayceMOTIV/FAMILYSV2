from fastapi import APIRouter, HTTPException, status
from typing import Optional
from datetime import datetime, timezone
from database import db
from models.popup import Popup, PopupCreate, PopupUpdate

router = APIRouter(prefix="/popups", tags=["admin-popups"])

@router.get("")
async def get_popups():
    """Get all popups."""
    restaurant_id = "default"
    popups = await db.popups.find({"restaurant_id": restaurant_id}).sort("priority", -1).to_list(length=100)
    
    for popup in popups:
        popup.pop("_id", None)
    
    return {"popups": popups}

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_popup(popup_create: PopupCreate):
    """Create a new popup."""
    restaurant_id = "default"
    
    popup = Popup(restaurant_id=restaurant_id, **popup_create.model_dump())
    popup_dict = popup.model_dump()
    
    # Convert datetime to ISO string
    for key in ["created_at", "updated_at", "start_date", "end_date"]:
        if popup_dict.get(key) and isinstance(popup_dict[key], datetime):
            popup_dict[key] = popup_dict[key].isoformat()
    
    await db.popups.insert_one(popup_dict)
    popup_dict.pop("_id", None)
    
    return {"success": True, "popup": popup_dict}

@router.put("/{popup_id}")
async def update_popup(popup_id: str, popup_update: PopupUpdate):
    """Update a popup."""
    restaurant_id = "default"
    
    existing = await db.popups.find_one({"id": popup_id, "restaurant_id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Popup not found")
    
    update_data = popup_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Convert datetime to ISO string
    for key in ["start_date", "end_date"]:
        if update_data.get(key) and isinstance(update_data[key], datetime):
            update_data[key] = update_data[key].isoformat()
    
    await db.popups.update_one({"id": popup_id}, {"$set": update_data})
    
    updated = await db.popups.find_one({"id": popup_id}, {"_id": 0})
    return {"success": True, "popup": updated}

@router.delete("/{popup_id}")
async def delete_popup(popup_id: str):
    """Delete a popup."""
    restaurant_id = "default"
    result = await db.popups.delete_one({"id": popup_id, "restaurant_id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Popup not found")
    return {"success": True, "message": "Popup supprime"}

@router.patch("/{popup_id}/toggle")
async def toggle_popup(popup_id: str):
    """Toggle popup active status."""
    restaurant_id = "default"
    
    existing = await db.popups.find_one({"id": popup_id, "restaurant_id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Popup not found")
    
    new_status = not existing.get("is_active", True)
    
    await db.popups.update_one(
        {"id": popup_id},
        {"$set": {"is_active": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "is_active": new_status}

from fastapi import APIRouter
from datetime import datetime, timezone
from database import db

router = APIRouter(prefix="/popups", tags=["popups"])

@router.get("/active")
async def get_active_popups():
    """Get active popups for the app."""
    restaurant_id = "default"
    now = datetime.now(timezone.utc)
    
    # Trouver les popups actifs
    query = {
        "restaurant_id": restaurant_id,
        "is_active": True
    }
    
    popups = await db.popups.find(query).sort("priority", -1).to_list(length=10)
    
    # Filtrer par date si defini
    active_popups = []
    for popup in popups:
        popup.pop("_id", None)
        
        start_date = popup.get("start_date")
        end_date = popup.get("end_date")
        
        # Verifier les dates
        if start_date:
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            if now < start_date:
                continue
        
        if end_date:
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            if now > end_date:
                continue
        
        active_popups.append(popup)
    
    return {"popups": active_popups}

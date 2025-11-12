from fastapi import APIRouter, HTTPException, Security, status
from typing import List
from models.promo import Promo, PromoCreate, PromoUpdate
from middleware.auth import require_manager_or_admin
from datetime import datetime, timezone
from database import db

router = APIRouter(prefix="/promos", tags=["admin-promos"])

@router.get("")  # response_model=List[Promo]
async def get_promos():  # current_user: dict = Security(require_manager_or_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    promos = await db.promos.find({"restaurant_id": restaurant_id}).to_list(length=None)
    for p in promos:
        p.pop("_id", None)
    return {"promos": promos}

@router.post("", status_code=status.HTTP_201_CREATED)  # response_model=Promo
async def create_promo(promo_create: PromoCreate):  # current_user: dict = Security(require_manager_or_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    promo = Promo(restaurant_id=restaurant_id, **promo_create.model_dump())
    promo_dict = promo.model_dump()
    # Convert datetime
    if isinstance(promo_dict.get('created_at'), datetime):
        promo_dict['created_at'] = promo_dict['created_at'].isoformat()
    if isinstance(promo_dict.get('updated_at'), datetime):
        promo_dict['updated_at'] = promo_dict['updated_at'].isoformat()
    await db.promos.insert_one(promo_dict)
    promo_dict.pop("_id", None)
    return {"success": True, "promo": promo_dict}

@router.put("/{promo_id}")  # response_model=Promo
async def update_promo(promo_id: str, promo_update: PromoUpdate):  # current_user: dict = Security(require_manager_or_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    existing = await db.promos.find_one({"id": promo_id, "restaurant_id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Promo not found")
    
    update_data = promo_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.promos.update_one({"id": promo_id}, {"$set": update_data})
    
    updated = await db.promos.find_one({"id": promo_id}, {"_id": 0})
    return {"success": True, "promo": updated}

@router.delete("/{promo_id}")
async def delete_promo(promo_id: str):  # current_user: dict = Security(require_manager_or_admin)
    restaurant_id = "default"  # current_user.get("restaurant_id")
    result = await db.promos.delete_one({"id": promo_id, "restaurant_id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promo not found")
    return {"success": True, "message": "Promo deleted"}

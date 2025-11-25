from fastapi import APIRouter, HTTPException, status
from typing import List
from models.option import ProductOption, OptionCreate, OptionUpdate
from datetime import datetime, timezone

from database import db

router = APIRouter(prefix="/options", tags=["admin-options"])

@router.get("")
async def get_options():
    """Get all product options."""
    restaurant_id = "default"
    
    options = await db.options.find(
        {"restaurant_id": restaurant_id}
    ).sort("name", 1).to_list(length=None)
    
    # Remove _id from results
    for option in options:
        option.pop("_id", None)
    
    return {"options": options}

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_option(option_create: OptionCreate):
    """Create new product option."""
    restaurant_id = "default"
    
    option = ProductOption(
        restaurant_id=restaurant_id,
        **option_create.model_dump()
    )
    
    await db.options.insert_one(option.model_dump())
    
    return {"success": True, "option": option.model_dump()}

@router.put("/{option_id}")
async def update_option(
    option_id: str,
    option_update: OptionUpdate
):
    """Update product option."""
    restaurant_id = "default"
    
    existing = await db.options.find_one({
        "id": option_id,
        "restaurant_id": restaurant_id
    })
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Option not found"
        )
    
    update_data = option_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.options.update_one(
        {"id": option_id},
        {"$set": update_data}
    )
    
    updated_option = await db.options.find_one({"id": option_id}, {"_id": 0})
    
    return {"success": True, "option": updated_option}

@router.delete("/{option_id}")
async def delete_option(option_id: str):
    """Delete product option."""
    restaurant_id = "default"
    
    result = await db.options.delete_one({
        "id": option_id,
        "restaurant_id": restaurant_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Option not found"
        )
    
    return {"success": True, "message": "Option deleted"}

@router.get("/{option_id}")
async def get_option(option_id: str):
    """Get single option."""
    restaurant_id = "default"
    
    option = await db.options.find_one({
        "id": option_id,
        "restaurant_id": restaurant_id
    }, {"_id": 0})
    
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Option not found"
        )
    
    return {"option": option}

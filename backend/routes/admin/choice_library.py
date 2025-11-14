from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import db
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/choice-library", tags=["admin-choice-library"])

class Choice(BaseModel):
    name: str
    default_price: float = 0.0
    image_url: Optional[str] = None
    description: Optional[str] = None

class ChoiceUpdate(BaseModel):
    name: Optional[str] = None
    default_price: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None

@router.get("")
async def get_all_choices():
    """Get all choices from library."""
    restaurant_id = "family-s-restaurant"
    
    choices = await db.choice_library.find(
        {"restaurant_id": restaurant_id},
        {"_id": 0}
    ).to_list(length=None)
    
    return {"choices": choices}

@router.post("")
async def create_choice(choice: Choice):
    """Create a new choice in library."""
    restaurant_id = "family-s-restaurant"
    
    choice_data = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": choice.name,
        "default_price": choice.default_price,
        "image_url": choice.image_url,
        "description": choice.description,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.choice_library.insert_one(choice_data)
    
    # Return only the data we created (without MongoDB ObjectId)
    return {
        "success": True, 
        "id": choice_data["id"],
        "message": "Choice created successfully"
    }

@router.put("/{choice_id}")
async def update_choice(choice_id: str, choice: ChoiceUpdate):
    """Update a choice in library."""
    restaurant_id = "family-s-restaurant"
    
    existing = await db.choice_library.find_one({
        "id": choice_id,
        "restaurant_id": restaurant_id
    })
    
    if not existing:
        raise HTTPException(status_code=404, detail="Choice not found")
    
    update_data = {
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if choice.name is not None:
        update_data["name"] = choice.name
    if choice.default_price is not None:
        update_data["default_price"] = choice.default_price
    if choice.image_url is not None:
        update_data["image_url"] = choice.image_url
    if choice.description is not None:
        update_data["description"] = choice.description
    
    await db.choice_library.update_one(
        {"id": choice_id},
        {"$set": update_data}
    )
    
    updated = await db.choice_library.find_one({"id": choice_id}, {"_id": 0})
    
    return {"success": True, "choice": updated}

@router.delete("/{choice_id}")
async def delete_choice(choice_id: str):
    """Delete a choice from library."""
    restaurant_id = "family-s-restaurant"
    
    existing = await db.choice_library.find_one({
        "id": choice_id,
        "restaurant_id": restaurant_id
    })
    
    if not existing:
        raise HTTPException(status_code=404, detail="Choice not found")
    
    await db.choice_library.delete_one({"id": choice_id})
    
    return {"success": True, "message": "Choice deleted"}

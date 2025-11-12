from fastapi import APIRouter, HTTPException, Security, status
from typing import List
from models.category import Category, CategoryCreate, CategoryUpdate
from middleware.auth import require_manager_or_admin
from datetime import datetime, timezone

from database import db

router = APIRouter(prefix="/categories", tags=["admin-categories"])


@router.get("")  # response_model=List[Category]
async def get_categories():  # current_user: dict = Security(require_manager_or_admin)
    """Get all categories for restaurant."""
    restaurant_id = "default"  # current_user.get("restaurant_id")
    
    categories = await db.categories.find(
        {"restaurant_id": restaurant_id}, {"_id": 0}
    ).sort("order", 1).to_list(length=None)
    
    return {"categories": categories}

@router.post("", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_create: CategoryCreate,
    current_user: dict = Security(require_manager_or_admin)
):
    """Create new category."""
    restaurant_id = current_user.get("restaurant_id")
    
    category = Category(
        restaurant_id=restaurant_id,
        **category_create.model_dump()
    )
    
    await db.categories.insert_one(category.model_dump())
    return category

@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_update: CategoryUpdate,
    current_user: dict = Security(require_manager_or_admin)
):
    """Update category."""
    restaurant_id = current_user.get("restaurant_id")
    
    existing = await db.categories.find_one({
        "id": category_id,
        "restaurant_id": restaurant_id
    })
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    update_data = category_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.categories.update_one(
        {"id": category_id},
        {"$set": update_data}
    )
    
    updated_category = await db.categories.find_one({"id": category_id})
    return Category(**updated_category)

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_user: dict = Security(require_manager_or_admin)
):
    """Delete category."""
    restaurant_id = current_user.get("restaurant_id")
    
    result = await db.categories.delete_one({
        "id": category_id,
        "restaurant_id": restaurant_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

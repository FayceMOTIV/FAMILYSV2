"""
Routes publiques pour les catégories
"""
from fastapi import APIRouter, HTTPException
from database import db
from typing import List

router = APIRouter()

@router.get("/categories")
async def get_categories():
    """
    Récupérer toutes les catégories actives
    """
    try:
        categories = await db.categories.find(
            {"is_active": True},
            {"_id": 0}
        ).sort("order", 1).to_list(length=100)
        
        return {"categories": categories}
    except Exception as e:
        print(f"Error getting categories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories/{category_id}")
async def get_category(category_id: str):
    """
    Récupérer une catégorie par ID
    """
    try:
        category = await db.categories.find_one(
            {"id": category_id, "is_active": True},
            {"_id": 0}
        )
        
        if not category:
            raise HTTPException(status_code=404, detail="Catégorie non trouvée")
        
        return category
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting category: {e}")
        raise HTTPException(status_code=500, detail=str(e))

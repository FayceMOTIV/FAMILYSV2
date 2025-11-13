from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from database import db

router = APIRouter(prefix="/products", tags=["admin-stock"])

class StockStatusUpdate(BaseModel):
    status: str  # '2h', 'today', 'indefinite', 'available'

@router.post("/{product_id}/stock-status")
async def update_stock_status(product_id: str, status_update: StockStatusUpdate):
    """
    Mettre à jour le statut de stock d'un produit avec réactivation automatique
    """
    try:
        product = await db.products.find_one({"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        status = status_update.status
        stock_resume_at = None
        is_out_of_stock = True
        
        now = datetime.now(timezone.utc)
        
        if status == '2h':
            # Rupture pour 2 heures
            stock_resume_at = (now + timedelta(hours=2)).isoformat()
            is_out_of_stock = True
        elif status == 'today':
            # Rupture jusqu'à minuit
            end_of_day = now.replace(hour=23, minute=59, second=59)
            stock_resume_at = end_of_day.isoformat()
            is_out_of_stock = True
        elif status == 'indefinite':
            # Rupture indéfinie
            stock_resume_at = None
            is_out_of_stock = True
        elif status == 'available':
            # Remettre en stock
            stock_resume_at = None
            is_out_of_stock = False
        
        # Mettre à jour le produit
        await db.products.update_one(
            {"id": product_id},
            {
                "$set": {
                    "stock_status": status if status != 'available' else None,
                    "stock_resume_at": stock_resume_at,
                    "is_out_of_stock": is_out_of_stock,
                    "updated_at": now.isoformat()
                }
            }
        )
        
        return {
            "success": True,
            "product_id": product_id,
            "status": status,
            "resume_at": stock_resume_at,
            "message": f"Statut de stock mis à jour : {status}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/check-stock-resume")
async def check_and_resume_stock():
    """
    Vérifier et réactiver les produits dont la période de rupture est terminée
    (À appeler périodiquement via un cron job)
    """
    try:
        now = datetime.now(timezone.utc).isoformat()
        
        # Trouver les produits à réactiver
        products_to_resume = await db.products.find({
            "stock_resume_at": {"$ne": None, "$lte": now},
            "is_out_of_stock": True
        }).to_list(length=None)
        
        resumed_count = 0
        for product in products_to_resume:
            await db.products.update_one(
                {"id": product["id"]},
                {
                    "$set": {
                        "stock_status": None,
                        "stock_resume_at": None,
                        "is_out_of_stock": False,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            resumed_count += 1
        
        return {
            "success": True,
            "resumed_count": resumed_count,
            "products_resumed": [p["id"] for p in products_to_resume]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
Routes publiques pour le système de cashback
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services.cashback_service import get_cashback_preview, get_settings

router = APIRouter()


class CashbackPreviewRequest(BaseModel):
    customer_id: Optional[str] = None
    subtotal: float
    total_after_promos: float
    promo_discount: float = 0.0
    use_cashback: bool = False


@router.post("/cashback/preview")
async def preview_cashback(request: CashbackPreviewRequest):
    """
    Prévisualiser le cashback pour une commande
    Utilisé dans le panier pour afficher les infos en temps réel
    """
    try:
        preview = await get_cashback_preview(
            customer_id=request.customer_id,
            subtotal=request.subtotal,
            total_after_promos=request.total_after_promos,
            promo_discount=request.promo_discount,
            use_cashback=request.use_cashback
        )
        
        return {
            "success": True,
            **preview
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cashback/settings")
async def get_cashback_settings():
    """
    Récupérer les paramètres du cashback (% et options)
    """
    try:
        settings = await get_settings()
        
        return {
            "loyalty_percentage": settings.get("loyalty_percentage", 5.0),
            "loyalty_exclude_promos_from_calculation": settings.get("loyalty_exclude_promos_from_calculation", False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cashback/balance/{customer_id}")
async def get_customer_balance(customer_id: str):
    """
    Récupérer le solde cashback d'un client
    """
    try:
        import os
        from motor.motor_asyncio import AsyncIOMotorClient
        
        MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[os.environ.get('DB_NAME', 'test_database')]
        
        customer = await db.customers.find_one({"id": customer_id})
        
        if not customer:
            raise HTTPException(status_code=404, detail="Client non trouvé")
        
        balance = customer.get("loyalty_points", 0.0)
        
        return {
            "customer_id": customer_id,
            "balance": round(balance, 2),
            "currency": "EUR"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

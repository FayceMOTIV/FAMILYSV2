from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['familys_restaurant']

@router.get("/dashboard/simple")
async def get_simple_dashboard():
    """
    Récupère les stats simples pour le Mode Commande :
    - Nombre de commandes traitées aujourd'hui
    - CA du jour
    """
    try:
        # Date du jour (début et fin)
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.now(timezone.utc).replace(hour=23, minute=59, second=59, microsecond=999999)
        
        today_start_str = today_start.isoformat()
        today_end_str = today_end.isoformat()
        
        # Récupérer toutes les commandes du jour
        orders = await db.orders.find({
            "created_at": {
                "$gte": today_start_str,
                "$lte": today_end_str
            }
        }).to_list(length=None)
        
        # Compter les commandes traitées (completed)
        completed_orders = [o for o in orders if o.get("status") == "completed"]
        total_completed = len(completed_orders)
        
        # Calculer le CA du jour (commandes completed uniquement)
        total_revenue = sum(o.get("total", 0) for o in completed_orders)
        
        # Stats supplémentaires
        pending_orders = len([o for o in orders if o.get("status") in ["new", "in_preparation"]])
        
        return {
            "date": datetime.now(timezone.utc).date().isoformat(),
            "orders_completed_today": total_completed,
            "revenue_today": round(total_revenue, 2),
            "pending_orders": pending_orders,
            "total_orders_today": len(orders)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

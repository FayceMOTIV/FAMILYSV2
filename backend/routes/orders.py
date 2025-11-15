"""
Routes publiques pour les commandes
"""
from fastapi import APIRouter, HTTPException
from models.order import Order, OrderCreate
from services.cashback_service import (
    calculate_cashback_earned,
    calculate_cashback_to_use,
    deduct_cashback_from_customer,
    add_cashback_to_customer
)
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['familys_restaurant']


async def generate_order_number():
    """Générer un numéro de commande unique"""
    # Format: FD-XXXX
    count = await db.orders.count_documents({})
    return f"FD-{count + 2000:04d}"


@router.post("/orders")
async def create_order(order_data: OrderCreate):
    """
    Créer une nouvelle commande avec gestion du cashback
    """
    try:
        # Générer le numéro de commande
        order_number = await generate_order_number()
        
        # Calculer le cashback gagné sur cette commande
        cashback_earned = await calculate_cashback_earned(
            subtotal=order_data.subtotal,
            total_after_promos=order_data.total
        )
        
        # Gérer l'utilisation du cashback
        cashback_used = 0.0
        final_total = order_data.total
        
        if order_data.use_cashback and order_data.customer_email:
            # Trouver le client
            customer = await db.customers.find_one({"email": order_data.customer_email})
            
            if customer:
                customer_id = customer.get("id")
                
                # Calculer combien de cashback utiliser
                cashback_calc = await calculate_cashback_to_use(
                    customer_id,
                    order_data.total
                )
                
                cashback_used = cashback_calc["cashback_to_use"]
                final_total = cashback_calc["remaining_to_pay"]
                
                # Déduire le cashback du compte client
                if cashback_used > 0:
                    await deduct_cashback_from_customer(customer_id, cashback_used)
        
        # Créer la commande
        order = Order(
            restaurant_id="family_restaurant_01",
            order_number=order_number,
            customer_email=order_data.customer_email,
            customer_name=order_data.customer_name,
            customer_phone=order_data.customer_phone,
            items=order_data.items,
            subtotal=order_data.subtotal,
            vat_amount=order_data.vat_amount,
            total=final_total,  # Total après utilisation du cashback
            cashback_used=cashback_used,
            cashback_earned=cashback_earned,
            payment_method=order_data.payment_method,
            payment_status="pending",
            consumption_mode=order_data.consumption_mode,
            pickup_date=order_data.pickup_date,
            pickup_time=order_data.pickup_time,
            notes=order_data.notes,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        # Sauvegarder dans la base
        result = await db.orders.insert_one(order.dict())
        
        return {
            "success": True,
            "order_id": order.id,
            "order_number": order_number,
            "total": final_total,
            "cashback_used": cashback_used,
            "cashback_earned": cashback_earned,
            "message": "Commande créée avec succès"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/{order_id}")
async def get_order(order_id: str):
    """
    Récupérer une commande par son ID
    """
    try:
        order = await db.orders.find_one({"id": order_id}, {"_id": 0})
        
        if not order:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/customer/{customer_email}")
async def get_customer_orders(customer_email: str):
    """
    Récupérer toutes les commandes d'un client
    """
    try:
        orders = await db.orders.find(
            {"customer_email": customer_email},
            {"_id": 0}
        ).sort("created_at", -1).to_list(length=50)
        
        return {
            "orders": orders,
            "count": len(orders)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

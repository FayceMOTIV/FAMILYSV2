"""
Routes publiques pour les commandes
"""
from fastapi import APIRouter, HTTPException
from models.order import Order, OrderCreate, AppliedPromotion
from services.cashback_service import (
    calculate_cashback_earned,
    calculate_cashback_to_use,
    deduct_cashback_from_customer,
    add_cashback_to_customer
)
from services.promotion_engine import PromotionEngine
from datetime import datetime, timezone
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get('DB_NAME', 'test_database')]


async def generate_order_number():
    """Générer un numéro de commande unique"""
    # Format: FD-XXXX
    count = await db.orders.count_documents({})
    return f"FD-{count + 2000:04d}"


@router.post("/orders")
async def create_order(order_data: OrderCreate):
    """
    Créer une nouvelle commande avec gestion des promos et du cashback
    """
    try:
        # Générer le numéro de commande
        order_number = await generate_order_number()
        
        # Récupérer les infos client si connecté
        customer = None
        if order_data.customer_email:
            customer = await db.customers.find_one({"email": order_data.customer_email})
        
        # RECALCULER LES PROMOS CÔTÉ BACKEND (sécurité)
        items_for_engine = []
        for item in order_data.items:
            items_for_engine.append({
                "product_id": item.product_id,
                "id": item.product_id,
                "name": item.name,
                "price": item.base_price,
                "quantity": item.quantity,
                "category": None  # TODO: récupérer la catégorie du produit
            })
        
        cart = {
            "items": items_for_engine,
            "total": order_data.subtotal,
            "delivery_fee": 0
        }
        
        engine = PromotionEngine(db)
        promo_result = await engine.apply_promotions(cart, customer, order_data.promo_code)
        
        # Extraire les promos appliquées
        promotions_applied = []
        for promo in promo_result.get("applied_promotions", []):
            promotions_applied.append(AppliedPromotion(
                promo_id=promo.get("id", ""),
                promo_name=promo.get("name", ""),
                promo_type=promo.get("type", ""),
                discount_amount=promo.get("discount", 0),
                badge_text=promo.get("badge"),
                details=promo.get("details")
            ))
        
        promotions_discount = promo_result.get("total_discount", 0)
        loyalty_multiplier = promo_result.get("loyalty_multiplier", 1.0)
        
        # Total après promos
        total_after_promos = max(0, order_data.subtotal - promotions_discount)
        
        # Calculer le cashback gagné sur cette commande
        cashback_earned = await calculate_cashback_earned(
            subtotal=order_data.subtotal,
            total_after_promos=total_after_promos
        )
        
        # Appliquer le multiplicateur de fidélité si présent
        loyalty_points_earned = int(cashback_earned * 100 * loyalty_multiplier)  # 1€ = 100 points
        
        # Gérer l'utilisation du cashback
        cashback_used = 0.0
        final_total = total_after_promos
        
        if order_data.use_cashback and customer:
            customer_id = customer.get("id")
            
            # Calculer combien de cashback utiliser
            cashback_calc = await calculate_cashback_to_use(
                customer_id,
                total_after_promos
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
            promotions_applied=promotions_applied,
            promotions_discount=promotions_discount,
            vat_amount=order_data.vat_amount,
            total=final_total,
            cashback_used=cashback_used,
            cashback_earned=cashback_earned,
            loyalty_points_earned=loyalty_points_earned,
            loyalty_multiplier=loyalty_multiplier,
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
        result = await db.orders.insert_one(order.model_dump())
        
        # Incrémenter le compteur d'utilisation des promos
        for promo in promo_result.get("applied_promotions", []):
            promo_id = promo.get("id")
            if promo_id:
                await db.promotions.update_one(
                    {"id": promo_id},
                    {"$inc": {"usage_count": 1}}
                )
        
        return {
            "success": True,
            "order_id": order.id,
            "order_number": order_number,
            "subtotal": order_data.subtotal,
            "promotions_discount": promotions_discount,
            "promotions_applied": [p.model_dump() for p in promotions_applied],
            "total_after_promos": total_after_promos,
            "cashback_used": cashback_used,
            "total": final_total,
            "cashback_earned": cashback_earned,
            "loyalty_points_earned": loyalty_points_earned,
            "loyalty_multiplier": loyalty_multiplier,
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

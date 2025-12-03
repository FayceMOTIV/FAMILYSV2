from fastapi import APIRouter, HTTPException, Body
from typing import Optional, List, Dict, Any
from services.promotion_engine import PromotionEngine
from database import db
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/cart", tags=["app-cart"])

RESTAURANT_ID = "family-s-restaurant"


@router.post("/calculate")
async def calculate_cart_promotions(
    items: List[Dict[str, Any]] = Body(...),
    customer_email: Optional[str] = Body(None),
    promo_code: Optional[str] = Body(None)
):
    """
    Calcule toutes les promotions applicables au panier
    Retourne le détail des réductions et le total final
    """
    try:
        # Calculer le total du panier
        cart_total = sum(
            (item.get("price") or item.get("base_price") or 0) * (item.get("quantity") or 1)
            for item in items
        )
        
        # Récupérer les infos client si connecté
        customer = None
        if customer_email:
            customer = await db.customers.find_one({"email": customer_email})
        
        # Construire l'objet cart pour le moteur
        cart = {
            "items": items,
            "total": cart_total,
            "delivery_fee": 0
        }
        
        # Utiliser le moteur de promotions
        engine = PromotionEngine(db)
        result = await engine.apply_promotions(cart, customer, promo_code)
        
        # Ajouter des suggestions de promos supplémentaires
        suggestions = await get_promo_suggestions(cart_total, items)
        
        return {
            "success": True,
            "cart_total": cart_total,
            "promotions_applied": result.get("applied_promotions", []),
            "total_discount": result.get("total_discount", 0),
            "final_total": result.get("final_total", cart_total),
            "loyalty_multiplier": result.get("loyalty_multiplier", 1.0),
            "suggestions": suggestions
        }
    except Exception as e:
        logger.error(f"Error calculating cart promotions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_promo_suggestions(cart_total: float, items: List[Dict]) -> List[Dict]:
    """
    Génère des suggestions de promos que le client pourrait débloquer
    """
    suggestions = []
    today = date.today().isoformat()
    
    # Chercher les promos threshold pas encore atteintes
    threshold_promos = await db.promotions.find({
        "restaurant_id": RESTAURANT_ID,
        "status": "active",
        "type": "threshold",
        "start_date": {"$lte": today},
        "end_date": {"$gte": today},
        "min_cart_amount": {"$gt": cart_total}
    }).to_list(length=5)
    
    for promo in threshold_promos:
        min_amount = promo.get("min_cart_amount", 0)
        diff = min_amount - cart_total
        if diff > 0 and diff < 20:  # Suggérer si proche (moins de 20€)
            suggestions.append({
                "type": "threshold",
                "message": f"Plus que {diff:.2f}€ pour débloquer {promo.get('name')}!",
                "amount_needed": diff,
                "promo_name": promo.get("name"),
                "discount_value": promo.get("discount_value"),
                "discount_type": promo.get("discount_type")
            })
    
    # Chercher les promos BOGO possibles
    bogo_promos = await db.promotions.find({
        "restaurant_id": RESTAURANT_ID,
        "status": "active",
        "type": "bogo",
        "start_date": {"$lte": today},
        "end_date": {"$gte": today}
    }).to_list(length=5)
    
    for promo in bogo_promos:
        eligible_cats = promo.get("eligible_categories", [])
        eligible_prods = promo.get("eligible_products", [])
        buy_qty = promo.get("bogo_buy_quantity", 1)
        
        # Vérifier si le client a des produits éligibles mais pas assez
        for item in items:
            item_cat = item.get("category") or item.get("category_id")
            item_id = item.get("id") or item.get("product_id")
            item_qty = item.get("quantity", 1)
            
            if (item_cat in eligible_cats or item_id in eligible_prods):
                if item_qty < buy_qty:
                    suggestions.append({
                        "type": "bogo",
                        "message": f"Ajoutez {buy_qty - item_qty} {item.get('name')} pour en avoir 1 OFFERT!",
                        "product_name": item.get("name"),
                        "promo_name": promo.get("name")
                    })
    
    # Chercher les promos conditionnelles (2e à -50%)
    conditional_promos = await db.promotions.find({
        "restaurant_id": RESTAURANT_ID,
        "status": "active",
        "type": "conditional_discount",
        "start_date": {"$lte": today},
        "end_date": {"$gte": today}
    }).to_list(length=5)
    
    for promo in conditional_promos:
        eligible_cats = promo.get("eligible_categories", [])
        cond_qty = promo.get("conditional_quantity", 2)
        cond_discount = promo.get("conditional_discount_percent", 50)
        
        for item in items:
            item_cat = item.get("category") or item.get("category_id")
            item_qty = item.get("quantity", 1)
            
            if item_cat in eligible_cats and item_qty < cond_qty:
                suggestions.append({
                    "type": "conditional",
                    "message": f"Le {cond_qty}ème {item.get('name')} est à -{cond_discount}%!",
                    "product_name": item.get("name"),
                    "promo_name": promo.get("name")
                })
    
    return suggestions[:3]  # Max 3 suggestions


@router.get("/active-promos")
async def get_active_cart_promos():
    """
    Récupère toutes les promos actives qui peuvent s'appliquer au panier
    (pour affichage dans l'app)
    """
    try:
        today = date.today().isoformat()
        now = datetime.now()
        current_time = now.strftime("%H:%M")
        current_day = now.strftime("%a").lower()[:3]
        
        promos = await db.promotions.find({
            "restaurant_id": RESTAURANT_ID,
            "status": "active",
            "start_date": {"$lte": today},
            "end_date": {"$gte": today}
        }).to_list(length=None)
        
        active_promos = []
        for promo in promos:
            promo.pop("_id", None)
            
            # Vérifier jours actifs
            days_active = promo.get("days_active", [])
            if days_active and current_day not in days_active:
                continue
            
            # Vérifier horaires (Happy Hour)
            start_time = promo.get("start_time")
            end_time = promo.get("end_time")
            if start_time and end_time:
                if not (start_time <= current_time <= end_time):
                    continue
            
            # Ne pas afficher les promos qui nécessitent un code
            if promo.get("code_required") and not promo.get("banner_text"):
                continue
            
            active_promos.append({
                "id": promo.get("id"),
                "name": promo.get("name"),
                "description": promo.get("description"),
                "type": promo.get("type"),
                "badge_text": promo.get("badge_text"),
                "badge_color": promo.get("badge_color"),
                "discount_type": promo.get("discount_type"),
                "discount_value": promo.get("discount_value"),
                "min_cart_amount": promo.get("min_cart_amount"),
                "eligible_categories": promo.get("eligible_categories", []),
                "eligible_products": promo.get("eligible_products", []),
                "promo_code": promo.get("promo_code") if not promo.get("code_required") else None,
                "bogo_buy_quantity": promo.get("bogo_buy_quantity"),
                "bogo_get_quantity": promo.get("bogo_get_quantity"),
                "conditional_quantity": promo.get("conditional_quantity"),
                "conditional_discount_percent": promo.get("conditional_discount_percent"),
                "start_time": promo.get("start_time"),
                "end_time": promo.get("end_time"),
                "banner_text": promo.get("banner_text")
            })
        
        return {"promotions": active_promos, "count": len(active_promos)}
    except Exception as e:
        logger.error(f"Error getting active cart promos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

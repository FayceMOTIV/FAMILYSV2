from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from database import db
from datetime import datetime, date, timezone
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/promotions", tags=["app-promotions"])

RESTAURANT_ID = "family-s-restaurant"


@router.get("/active")
async def get_active_promotions():
    """Récupère toutes les promotions actives pour l'app"""
    try:
        today = date.today().isoformat()
        
        promos = await db.promotions.find({
            "restaurant_id": RESTAURANT_ID,
            "status": "active",
            "start_date": {"$lte": today},
            "end_date": {"$gte": today}
        }).to_list(length=None)
        
        for p in promos:
            p.pop("_id", None)
        
        return {"promotions": promos, "count": len(promos)}
    except Exception as e:
        logger.error(f"Error getting active promotions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/product/{product_id}")
async def get_promotions_for_product(product_id: str):
    """Récupère les promotions applicables à un produit spécifique"""
    try:
        today = date.today().isoformat()
        
        product = await db.products.find_one({"id": product_id})
        product_category = product.get("category") if product else None
        
        query = {
            "restaurant_id": RESTAURANT_ID,
            "status": "active",
            "start_date": {"$lte": today},
            "end_date": {"$gte": today},
            "$or": [
                {"eligible_products": product_id},
                {"eligible_categories": product_category} if product_category else {"_id": None},
                {"eligible_products": [], "eligible_categories": []}
            ]
        }
        
        promos = await db.promotions.find(query).to_list(length=None)
        
        filtered_promos = []
        for p in promos:
            p.pop("_id", None)
            if product_id in p.get("excluded_products", []):
                continue
            if product_category and product_category in p.get("excluded_categories", []):
                continue
            filtered_promos.append(p)
        
        return {"promotions": filtered_promos, "count": len(filtered_promos)}
    except Exception as e:
        logger.error(f"Error getting promotions for product {product_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/category/{category_id}")
async def get_promotions_for_category(category_id: str):
    """Récupère les promotions applicables à une catégorie"""
    try:
        today = date.today().isoformat()
        
        promos = await db.promotions.find({
            "restaurant_id": RESTAURANT_ID,
            "status": "active",
            "start_date": {"$lte": today},
            "end_date": {"$gte": today},
            "$or": [
                {"eligible_categories": category_id},
                {"eligible_products": [], "eligible_categories": []}
            ],
            "excluded_categories": {"$ne": category_id}
        }).to_list(length=None)
        
        for p in promos:
            p.pop("_id", None)
        
        return {"promotions": promos, "count": len(promos)}
    except Exception as e:
        logger.error(f"Error getting promotions for category {category_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate")
async def validate_promo_code(code: str, cart_total: float):
    """Valide un code promo et retourne la réduction applicable"""
    try:
        today = date.today().isoformat()
        
        promo = await db.promotions.find_one({
            "restaurant_id": RESTAURANT_ID,
            "promo_code": code.upper(),
            "status": "active",
            "start_date": {"$lte": today},
            "end_date": {"$gte": today}
        })
        
        if not promo:
            return {"valid": False, "error": "Code promo invalide ou expiré"}
        
        # Vérifier minimum d'achat (gérer None)
        min_cart = promo.get("min_cart_amount") or 0
        if cart_total < min_cart:
            return {
                "valid": False, 
                "error": f"Minimum d'achat requis : {min_cart}€"
            }
        
        # Vérifier limite d'utilisation
        limit_total = promo.get("limit_total")
        usage_count = promo.get("usage_count") or 0
        if limit_total and usage_count >= limit_total:
            return {"valid": False, "error": "Ce code promo a atteint sa limite d'utilisation"}
        
        # Calculer la réduction
        discount_type = promo.get("discount_type", "percentage")
        discount_value = promo.get("discount_value") or 0
        
        if discount_type == "percentage":
            discount_amount = cart_total * (discount_value / 100)
        elif discount_type == "fixed":
            discount_amount = min(discount_value, cart_total)
        else:
            discount_amount = 0
        
        promo.pop("_id", None)
        
        return {
            "valid": True,
            "promo": promo,
            "discount_amount": round(discount_amount, 2),
            "final_total": round(cart_total - discount_amount, 2)
        }
    except Exception as e:
        logger.error(f"Error validating promo code: {e}")
        return {"valid": False, "error": "Erreur lors de la validation"}


@router.get("/banners")
async def get_promo_banners():
    """Récupère les bannières promotionnelles pour l'app"""
    try:
        today = date.today().isoformat()
        
        promos = await db.promotions.find({
            "restaurant_id": RESTAURANT_ID,
            "status": "active",
            "start_date": {"$lte": today},
            "end_date": {"$gte": today}
        }).to_list(length=None)
        
        banners = []
        for p in promos:
            if p.get("banner_image") or p.get("banner_text"):
                banners.append({
                    "id": p.get("id"),
                    "title": p.get("name"),
                    "text": p.get("banner_text"),
                    "image": p.get("banner_image"),
                    "badge_text": p.get("badge_text"),
                    "badge_color": p.get("badge_color"),
                    "type": p.get("type"),
                    "promo_code": p.get("promo_code") if not p.get("code_required") else None
                })
        
        return {"banners": banners}
    except Exception as e:
        logger.error(f"Error getting promo banners: {e}")
        return {"banners": []}

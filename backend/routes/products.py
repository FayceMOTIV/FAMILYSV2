"""
Routes publiques pour les produits - avec enrichissement promos
"""
from fastapi import APIRouter, HTTPException, Query
from database import db
from typing import Optional, List
from datetime import date

router = APIRouter()


async def get_active_promotions_for_product(product):
    """Récupère les promotions actives applicables à un produit"""
    today = date.today().isoformat()
    product_id = product.get("id")
    product_category = product.get("category")
    
    # Chercher les promos applicables
    query = {
        "status": "active",
        "start_date": {"$lte": today},
        "end_date": {"$gte": today},
        "$or": [
            {"eligible_products": product_id},
            {"eligible_categories": product_category},
            {"eligible_products": [], "eligible_categories": []}  # Promos globales
        ]
    }
    
    promos = await db.promotions.find(query).to_list(length=10)
    
    # Filtrer les exclusions
    applicable_promos = []
    for p in promos:
        if product_id in p.get("excluded_products", []):
            continue
        if product_category in p.get("excluded_categories", []):
            continue
        
        applicable_promos.append({
            "id": p.get("id"),
            "name": p.get("name"),
            "type": p.get("type"),
            "discount_type": p.get("discount_type"),
            "discount_value": p.get("discount_value"),
            "badge_text": p.get("badge_text"),
            "badge_color": p.get("badge_color"),
            "promo_code": p.get("promo_code") if not p.get("code_required") else None
        })
    
    return applicable_promos


def calculate_promo_price(base_price, promos):
    """Calcule le prix après la meilleure promo applicable (sans code)"""
    best_price = base_price
    best_promo = None
    
    for promo in promos:
        # Ignorer les promos qui nécessitent un code
        if promo.get("promo_code"):
            continue
            
        discount_type = promo.get("discount_type")
        discount_value = promo.get("discount_value", 0)
        
        if discount_type == "percentage":
            new_price = base_price * (1 - discount_value / 100)
        elif discount_type == "fixed":
            new_price = max(0, base_price - discount_value)
        else:
            continue
        
        if new_price < best_price:
            best_price = new_price
            best_promo = promo
    
    return round(best_price, 2), best_promo


@router.get("/products")
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    include_promos: bool = Query(True, description="Inclure les promos actives")
):
    """
    Récupérer les produits avec filtres optionnels et promos actives
    """
    try:
        query = {"is_available": True}
        
        # Filtre par catégorie
        if category:
            query["category"] = category
        
        # Recherche par nom ou description
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        products = await db.products.find(
            query,
            {"_id": 0}
        ).skip(skip).limit(limit).to_list(length=limit)
        
        # Enrichir avec les promos si demandé
        if include_promos:
            for product in products:
                promos = await get_active_promotions_for_product(product)
                product["active_promotions"] = promos
                
                # Calculer le prix promo si applicable
                if promos:
                    base_price = product.get("base_price", 0)
                    promo_price, best_promo = calculate_promo_price(base_price, promos)
                    
                    if promo_price < base_price:
                        product["promo_price"] = promo_price
                        product["promo_badge"] = best_promo.get("badge_text") if best_promo else None
                        product["promo_badge_color"] = best_promo.get("badge_color") if best_promo else None
        
        return {"products": products}
    except Exception as e:
        print(f"Error getting products: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/{product_id}")
async def get_product(product_id: str, include_promos: bool = Query(True)):
    """
    Récupérer un produit par ID avec ses promos actives
    """
    try:
        product = await db.products.find_one(
            {"id": product_id},
            {"_id": 0}
        )
        
        if not product:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        # Enrichir avec les promos
        if include_promos:
            promos = await get_active_promotions_for_product(product)
            product["active_promotions"] = promos
            
            if promos:
                base_price = product.get("base_price", 0)
                promo_price, best_promo = calculate_promo_price(base_price, promos)
                
                if promo_price < base_price:
                    product["promo_price"] = promo_price
                    product["promo_badge"] = best_promo.get("badge_text") if best_promo else None
                    product["promo_badge_color"] = best_promo.get("badge_color") if best_promo else None
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting product: {e}")
        raise HTTPException(status_code=500, detail=str(e))

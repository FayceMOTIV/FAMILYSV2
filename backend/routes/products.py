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


def calculate_promo_price(base_price, promos, product=None):
    """
    Calcule le prix après la meilleure promo applicable (sans code)
    
    Types qui affichent un prix réduit sur la fiche produit:
    - percent_item, percent_category, fixed_item, fixed_category (ciblés)
    - happy_hour, flash, seasonal, new_customer, inactive_customer (généraux)
    
    Types qui N'affichent PAS de prix réduit (remise calculée au panier):
    - bogo (1 acheté = 1 offert, dépend de la quantité)
    - conditional_discount (2e à -50%, dépend de la quantité)
    - threshold (basé sur total panier minimum)
    - shipping_free (pas de changement de prix produit)
    - loyalty_multiplier (multiplicateur de points, pas de remise €)
    - promo_code (nécessite un code manuel)
    """
    best_price = base_price
    best_promo = None
    
    # Types qui ne modifient PAS le prix unitaire (remise au panier)
    no_unit_price_change = [
        "bogo",                 # Dépend de la quantité
        "conditional_discount", # Dépend de la quantité  
        "threshold",            # Dépend du total panier
        "shipping_free",        # Frais de livraison, pas prix produit
        "loyalty_multiplier",   # Points fidélité, pas de remise €
        "promo_code"            # Nécessite un code
    ]
    
    for promo in promos:
        # Ignorer les promos qui nécessitent un code
        if promo.get("promo_code") or promo.get("code_required"):
            continue
        
        promo_type = promo.get("type", "").lower()
        
        # Les promos qui ne changent pas le prix unitaire
        if promo_type in no_unit_price_change:
            # Garder la promo pour afficher le badge mais pas de changement de prix
            if best_promo is None:
                best_promo = promo
            continue
        
        discount_type = promo.get("discount_type")
        discount_value = promo.get("discount_value", 0)
        
        # Vérifier si le produit est éligible (pour percent_item, fixed_item)
        if promo_type in ["percent_item", "fixed_item"]:
            eligible_products = promo.get("eligible_products", [])
            if product and eligible_products:
                product_id = product.get("id", "")
                if product_id not in eligible_products:
                    continue
        
        # Vérifier si la catégorie est éligible (pour percent_category, fixed_category)
        if promo_type in ["percent_category", "fixed_category"]:
            eligible_categories = promo.get("eligible_categories", [])
            excluded_categories = promo.get("excluded_categories", [])
            if product:
                product_category = product.get("category", "")
                # Si des catégories sont spécifiées, vérifier
                if eligible_categories and product_category not in eligible_categories:
                    continue
                if product_category in excluded_categories:
                    continue
        
        # Pour les promos générales (happy_hour, flash, etc.), vérifier les exclusions
        if promo_type in ["happy_hour", "flash", "seasonal", "new_customer", "inactive_customer"]:
            if product:
                product_id = product.get("id", "")
                product_category = product.get("category", "")
                
                # Vérifier les exclusions
                if product_id in promo.get("excluded_products", []):
                    continue
                if product_category in promo.get("excluded_categories", []):
                    continue
                
                # Vérifier les inclusions si spécifiées
                eligible_products = promo.get("eligible_products", [])
                eligible_categories = promo.get("eligible_categories", [])
                
                # Si des produits/catégories sont spécifiés, le produit doit être dedans
                if eligible_products or eligible_categories:
                    if product_id not in eligible_products and product_category not in eligible_categories:
                        continue
        
        # Calculer le nouveau prix
        if discount_type == "percentage":
            new_price = base_price * (1 - discount_value / 100)
        elif discount_type == "fixed":
            new_price = max(0, base_price - discount_value)
        else:
            # Si pas de discount_type valide, juste garder pour le badge
            if best_promo is None:
                best_promo = promo
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
        
        # Enrichir chaque produit
        for product in products:
            # Enrichir les options dynamiquement (pour avoir les derniers prix/images/sous-options)
            if product.get("option_ids"):
                option_groups = []
                for option_id in product["option_ids"]:
                    option = await db.options.find_one({"id": option_id}, {"_id": 0})
                    if option:
                        option_group = {
                            "id": option["id"],
                            "name": option["name"],
                            "type": option.get("type", "single"),
                            "required": option.get("is_required", False),
                            "options": [
                                {
                                    "id": choice.get("id", str(i)),
                                    "name": choice["name"],
                                    "delta_price": choice.get("price", 0),
                                    "image_url": choice.get("image_url"),
                                    "sub_options": choice.get("sub_options", [])
                                }
                                for i, choice in enumerate(option.get("choices", []))
                            ]
                        }
                        option_groups.append(option_group)
                product["option_groups"] = option_groups
            
            # Enrichir avec les promos si demandé
            if include_promos:
                promos = await get_active_promotions_for_product(product)
                product["active_promotions"] = promos
                
                # Calculer le prix promo si applicable
                if promos:
                    base_price = product.get("base_price", 0)
                    promo_price, best_promo = calculate_promo_price(base_price, promos, product)
                    
                    if promo_price < base_price:
                        # Promo avec réduction de prix
                        product["promo_price"] = promo_price
                        badge = best_promo.get("badge_text") if best_promo else None
                        if not badge and best_promo:
                            badge = best_promo.get("name")
                        product["promo_badge"] = badge
                        product["promo_badge_color"] = best_promo.get("badge_color") if best_promo else None
                    elif best_promo:
                        # Promo sans réduction de prix (BOGO, etc.) - afficher juste le badge
                        badge = best_promo.get("badge_text") if best_promo else None
                        if not badge:
                            badge = best_promo.get("name")
                        product["promo_badge"] = badge
                        product["promo_badge_color"] = best_promo.get("badge_color") if best_promo else None
        
        return {"products": products}
    except Exception as e:
        print(f"Error getting products: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/{product_id}")
async def get_product(product_id: str, include_promos: bool = Query(True)):
    """
    Récupérer un produit par ID avec ses promos actives et options à jour
    """
    try:
        product = await db.products.find_one(
            {"id": product_id},
            {"_id": 0}
        )
        
        if not product:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        # TOUJOURS enrichir les options depuis la base (pour avoir les dernières sous-options)
        if product.get("option_ids"):
            option_groups = []
            for option_id in product["option_ids"]:
                option = await db.options.find_one({"id": option_id}, {"_id": 0})
                if option:
                    option_group = {
                        "id": option["id"],
                        "name": option["name"],
                        "type": option.get("type", "single"),
                        "required": option.get("is_required", False),
                        "options": [
                            {
                                "id": choice.get("id", str(i)),
                                "name": choice["name"],
                                "delta_price": choice.get("price", 0),
                                "image_url": choice.get("image_url"),
                                "sub_options": choice.get("sub_options", [])
                            }
                            for i, choice in enumerate(option.get("choices", []))
                        ]
                    }
                    option_groups.append(option_group)
            product["option_groups"] = option_groups
        
        # Enrichir avec les promos
        if include_promos:
            promos = await get_active_promotions_for_product(product)
            product["active_promotions"] = promos
            
            if promos:
                base_price = product.get("base_price", 0)
                promo_price, best_promo = calculate_promo_price(base_price, promos, product)
                
                if promo_price < base_price:
                    # Promo avec réduction de prix
                    product["promo_price"] = promo_price
                    badge = best_promo.get("badge_text") if best_promo else None
                    if not badge and best_promo:
                        badge = best_promo.get("name")
                    product["promo_badge"] = badge
                    product["promo_badge_color"] = best_promo.get("badge_color") if best_promo else None
                elif best_promo:
                    # Promo sans réduction de prix (BOGO, etc.) - afficher juste le badge
                    badge = best_promo.get("badge_text") if best_promo else None
                    if not badge:
                        badge = best_promo.get("name")
                    product["promo_badge"] = badge
                    product["promo_badge_color"] = best_promo.get("badge_color") if best_promo else None
        
        return product
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting product: {e}")
        raise HTTPException(status_code=500, detail=str(e))

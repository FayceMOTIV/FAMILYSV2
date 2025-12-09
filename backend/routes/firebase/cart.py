"""
Routes Cart - Firebase/Firestore
Calcul des promotions panier

NOTE: Les promos individuelles produits sont déjà appliquées via promo_price dans products.py
Ce module gère uniquement les promos PANIER globales:
- Codes promo
- Seuils de commande (ex: -5€ si commande > 30€)  
- BOGO cross-produits
- Happy hour global

Les promos de type "percentage" ou "conditional_discount" sur produits individuels
NE SONT PAS réappliquées ici car déjà dans promo_price.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, timezone

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/cart", tags=["firebase-cart"])


class CartItem(BaseModel):
    id: str
    name: Optional[str] = None
    price: float  # Prix effectif (déjà avec promo si applicable)
    base_price: Optional[float] = None  # Prix original
    original_price: Optional[float] = None
    quantity: int = 1
    category: Optional[str] = None
    has_promo: Optional[bool] = False  # Indique si promo déjà appliquée
    promo_badge: Optional[str] = None


class CartCalculateRequest(BaseModel):
    items: List[CartItem]
    customer_email: Optional[str] = None
    promo_code: Optional[str] = None


def get_active_cart_promotions():
    """Récupère les promotions PANIER actives (codes, seuils, etc.)"""
    try:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        promos_ref = db.collection("promotions")
        all_promos = promos_ref.where("is_active", "==", True).stream()
        
        cart_promos = []
        for doc in all_promos:
            promo = doc.to_dict()
            promo['id'] = doc.id
            
            # Vérifier les dates
            start_date = promo.get('start_date', '')
            end_date = promo.get('end_date', '')
            
            if start_date and start_date > today:
                continue
            if end_date and end_date < today:
                continue
            
            # Filtrer: garder seulement les promos PANIER
            # (code promo, seuil min_order_amount, BOGO)
            promo_type = promo.get('type', '')
            requires_code = promo.get('requires_code', False)
            min_order = promo.get('min_order_amount')
            
            # Promo panier = code requis OU seuil minimum OU BOGO
            is_cart_promo = (
                requires_code or 
                (min_order and min_order > 0) or
                promo_type == 'bogo'
            )
            
            if is_cart_promo:
                cart_promos.append(promo)
        
        return cart_promos
    except Exception as e:
        print(f"Erreur récupération promos panier: {e}")
        return []


@router.post("/calculate")
def calculate_cart(request: CartCalculateRequest):
    """
    Calcule les promotions PANIER (pas les promos produits individuels).
    Les promos produits sont déjà dans item.price via products.py enrichissement.
    """
    try:
        items = request.items
        promo_code = request.promo_code
        
        if not items:
            return {
                "success": True,
                "cart_total": 0,
                "promotions_applied": [],
                "total_discount": 0,
                "final_total": 0,
                "suggestions": []
            }
        
        # Calculer le sous-total (prix déjà avec promos produits)
        cart_total = sum(
            (item.price or item.base_price or 0) * (item.quantity or 1) 
            for item in items
        )
        
        # Prix original total (pour afficher économies)
        original_total = sum(
            (item.original_price or item.base_price or item.price or 0) * (item.quantity or 1)
            for item in items
        )
        
        # Économies déjà réalisées via promos produits
        product_savings = max(0, original_total - cart_total)
        
        # Récupérer les promos PANIER actives
        cart_promos = get_active_cart_promotions()
        
        applied_promos = []
        cart_discount = 0
        suggestions = []
        
        for promo in cart_promos:
            promo_type = promo.get('type', '')
            discount_value = float(promo.get('discount_value', 0))
            requires_code = promo.get('requires_code', False)
            code = promo.get('code', '')
            min_order = promo.get('min_order_amount')
            
            # Vérifier code promo
            if requires_code:
                if not promo_code or promo_code.upper() != (code or '').upper():
                    continue
            
            # Vérifier seuil minimum
            if min_order and cart_total < min_order:
                # Suggestion si proche du seuil
                if cart_total >= min_order * 0.7:
                    remaining = min_order - cart_total
                    suggestions.append({
                        'type': 'threshold',
                        'message': f"Plus que {remaining:.2f}€ pour bénéficier de -{discount_value}{'%' if promo_type == 'percentage' else '€'}!",
                        'promo_name': promo.get('name', '')
                    })
                continue
            
            # Calculer la réduction PANIER
            discount = 0
            if promo_type == 'percentage':
                discount = cart_total * (discount_value / 100)
                max_discount = promo.get('max_discount')
                if max_discount:
                    discount = min(discount, max_discount)
            elif promo_type == 'fixed_amount':
                discount = discount_value
            elif promo_type == 'bogo':
                # BOGO complexe - à implémenter selon les règles
                pass
            
            if discount > 0:
                cart_discount += discount
                applied_promos.append({
                    'id': promo.get('id'),
                    'name': promo.get('name', ''),
                    'type': promo_type,
                    'discount_amount': round(discount, 2),
                    'badge_text': promo.get('badge_text', f'-{discount_value}%'),
                    'is_cart_promo': True
                })
        
        final_total = max(0, cart_total - cart_discount)
        
        return {
            "success": True,
            "cart_total": round(cart_total, 2),
            "original_total": round(original_total, 2),
            "product_savings": round(product_savings, 2),
            "promotions_applied": applied_promos,
            "total_discount": round(cart_discount, 2),  # Seulement les promos PANIER
            "final_total": round(final_total, 2),
            "suggestions": suggestions,
            "loyalty_multiplier": 1.0
        }
        
    except Exception as e:
        print(f"Erreur calcul panier: {e}")
        return {
            "success": False,
            "error": str(e),
            "cart_total": 0,
            "promotions_applied": [],
            "total_discount": 0,
            "final_total": 0,
            "suggestions": []
        }


@router.get("/active-promos")
def get_active_promos():
    """Liste les promotions panier actuellement actives"""
    try:
        promos = get_active_cart_promotions()
        return {
            "success": True,
            "promotions": promos,
            "count": len(promos)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
Moteur de promotions - Calcule et applique les promotions sur un panier
"""
from datetime import datetime, timezone
from typing import List, Dict, Optional
import re


class PromotionEngine:
    """
    Moteur de calcul des promotions pour le panier
    """
    
    def __init__(self, db):
        self.db = db
    
    async def apply_promotions(self, cart: dict, customer: dict = None, promo_code: str = None) -> dict:
        """
        Applique les promotions sur un panier
        
        Args:
            cart: {"items": [...], "total": float, "delivery_fee": float}
            customer: Données client (optionnel)
            promo_code: Code promo saisi (optionnel)
        
        Returns:
            {
                "items": [...],  # Items avec promos appliquées
                "applied_promotions": [...],
                "total_discount": float,
                "suggestions": [...],
                "loyalty_multiplier": float
            }
        """
        result = {
            "items": cart.get("items", []),
            "applied_promotions": [],
            "total_discount": 0.0,
            "suggestions": [],
            "loyalty_multiplier": 1.0
        }
        
        try:
            # Récupérer les promos actives
            active_promos = await self._get_active_promotions()
            
            cart_total = cart.get("total", 0)
            cart_items = cart.get("items", [])
            
            # Appliquer les promos automatiques
            for promo in active_promos:
                if promo.get("auto_apply", True):
                    promo_result = await self._apply_single_promo(promo, cart_items, cart_total, customer)
                    
                    if promo_result["applied"]:
                        result["applied_promotions"].append({
                            "id": promo.get("id"),
                            "name": promo.get("name"),
                            "type": promo.get("promo_type"),
                            "discount": promo_result["discount"],
                            "badge": promo.get("badge_text", "🏷️ PROMO"),
                            "details": promo_result.get("details")
                        })
                        result["total_discount"] += promo_result["discount"]
                        
                        # Appliquer le multiplicateur de fidélité si présent
                        if promo.get("loyalty_multiplier"):
                            result["loyalty_multiplier"] = max(
                                result["loyalty_multiplier"],
                                promo.get("loyalty_multiplier", 1.0)
                            )
            
            # Appliquer le code promo si fourni
            if promo_code:
                code_result = await self._apply_promo_code(promo_code, cart_items, cart_total, customer)
                
                if code_result["applied"]:
                    result["applied_promotions"].append({
                        "id": code_result.get("promo_id"),
                        "name": code_result.get("name"),
                        "type": "promo_code",
                        "discount": code_result["discount"],
                        "badge": "🏷️ CODE",
                        "details": code_result.get("details")
                    })
                    result["total_discount"] += code_result["discount"]
            
            # Générer des suggestions
            result["suggestions"] = await self._generate_suggestions(cart_items, cart_total, active_promos)
            
        except Exception as e:
            print(f"Error applying promotions: {e}")
        
        return result
    
    async def _get_active_promotions(self) -> List[dict]:
        """
        Récupère les promotions actives
        """
        now = datetime.now(timezone.utc).isoformat()
        
        promos = await self.db.promotions.find({
            "is_active": True,
            "$or": [
                {"start_date": {"$exists": False}},
                {"start_date": {"$lte": now}}
            ],
            "$or": [
                {"end_date": {"$exists": False}},
                {"end_date": {"$gte": now}}
            ]
        }).to_list(length=100)
        
        return promos
    
    async def _apply_single_promo(self, promo: dict, items: List[dict], cart_total: float, customer: dict = None) -> dict:
        """
        Applique une seule promo et retourne le résultat
        """
        result = {"applied": False, "discount": 0.0, "details": None}
        
        promo_type = promo.get("promo_type")
        conditions = promo.get("conditions", {})
        
        # Vérifier les conditions
        if not self._check_conditions(conditions, items, cart_total, customer):
            return result
        
        # Appliquer selon le type
        if promo_type == "percentage":
            discount_percent = promo.get("discount_value", 0)
            result["discount"] = round(cart_total * (discount_percent / 100), 2)
            result["applied"] = True
            
        elif promo_type == "fixed_amount":
            result["discount"] = min(promo.get("discount_value", 0), cart_total)
            result["applied"] = True
            
        elif promo_type == "bogo":
            # Buy One Get One
            bogo_result = self._calculate_bogo(promo, items)
            result["discount"] = bogo_result["discount"]
            result["details"] = bogo_result.get("details")
            result["applied"] = bogo_result["discount"] > 0
            
        elif promo_type == "free_product":
            # Produit gratuit
            result["details"] = {"free_product": promo.get("free_product_id")}
            result["applied"] = True
            
        elif promo_type == "free_delivery":
            delivery_fee = promo.get("delivery_fee", 0)
            result["discount"] = delivery_fee
            result["applied"] = True
        
        # Vérifier la limite d'utilisation
        if result["applied"] and promo.get("max_uses"):
            usage_count = promo.get("usage_count", 0)
            if usage_count >= promo.get("max_uses"):
                result["applied"] = False
                result["discount"] = 0
        
        return result
    
    def _check_conditions(self, conditions: dict, items: List[dict], cart_total: float, customer: dict = None) -> bool:
        """
        Vérifie si les conditions de la promo sont remplies
        """
        # Montant minimum
        min_order = conditions.get("min_order_amount", 0)
        if cart_total < min_order:
            return False
        
        # Catégories requises
        required_categories = conditions.get("required_categories", [])
        if required_categories:
            item_categories = [item.get("category") for item in items]
            if not any(cat in item_categories for cat in required_categories):
                return False
        
        # Produits requis
        required_products = conditions.get("required_products", [])
        if required_products:
            item_ids = [item.get("product_id") or item.get("id") for item in items]
            if not any(pid in item_ids for pid in required_products):
                return False
        
        # Nouveaux clients uniquement
        if conditions.get("new_customers_only") and customer:
            order_count = customer.get("order_count", 0)
            if order_count > 0:
                return False
        
        # Jours de la semaine
        valid_days = conditions.get("valid_days", [])
        if valid_days:
            today = datetime.now().strftime("%A").lower()
            day_mapping = {
                "monday": "lundi", "tuesday": "mardi", "wednesday": "mercredi",
                "thursday": "jeudi", "friday": "vendredi", "saturday": "samedi", "sunday": "dimanche"
            }
            if today not in valid_days and day_mapping.get(today) not in valid_days:
                return False
        
        return True
    
    def _calculate_bogo(self, promo: dict, items: List[dict]) -> dict:
        """
        Calcule la réduction BOGO (Buy One Get One)
        """
        result = {"discount": 0.0, "details": {"free_items": []}}
        
        bogo_config = promo.get("bogo_config", {})
        buy_quantity = bogo_config.get("buy_quantity", 1)
        get_quantity = bogo_config.get("get_quantity", 1)
        get_discount_percent = bogo_config.get("get_discount_percent", 100)  # 100 = gratuit
        target_categories = bogo_config.get("target_categories", [])
        target_products = bogo_config.get("target_products", [])
        
        # Filtrer les items éligibles
        eligible_items = []
        for item in items:
            if target_products and item.get("product_id") in target_products:
                eligible_items.append(item)
            elif target_categories and item.get("category") in target_categories:
                eligible_items.append(item)
            elif not target_products and not target_categories:
                eligible_items.append(item)
        
        # Trier par prix croissant (le moins cher sera gratuit)
        eligible_items.sort(key=lambda x: x.get("price", 0))
        
        # Calculer combien d'items gratuits
        total_eligible = sum(item.get("quantity", 1) for item in eligible_items)
        sets = total_eligible // (buy_quantity + get_quantity)
        
        if sets > 0:
            free_count = sets * get_quantity
            
            # Calculer la réduction sur les items les moins chers
            discount = 0.0
            remaining_free = free_count
            
            for item in eligible_items:
                if remaining_free <= 0:
                    break
                
                qty = min(item.get("quantity", 1), remaining_free)
                item_discount = item.get("price", 0) * qty * (get_discount_percent / 100)
                discount += item_discount
                remaining_free -= qty
                
                result["details"]["free_items"].append({
                    "name": item.get("name"),
                    "quantity": qty,
                    "discount": item_discount
                })
            
            result["discount"] = round(discount, 2)
        
        return result
    
    async def _apply_promo_code(self, code: str, items: List[dict], cart_total: float, customer: dict = None) -> dict:
        """
        Applique un code promo
        """
        result = {"applied": False, "discount": 0.0, "name": None, "promo_id": None}
        
        # Rechercher le code promo
        promo = await self.db.promo_codes.find_one({
            "code": code.upper(),
            "is_active": True
        })
        
        if not promo:
            return result
        
        # Vérifier les dates de validité
        now = datetime.now(timezone.utc)
        
        if promo.get("start_date"):
            start = datetime.fromisoformat(promo["start_date"].replace("Z", "+00:00"))
            if now < start:
                return result
        
        if promo.get("end_date"):
            end = datetime.fromisoformat(promo["end_date"].replace("Z", "+00:00"))
            if now > end:
                return result
        
        # Vérifier le nombre d'utilisations
        if promo.get("max_uses"):
            if promo.get("usage_count", 0) >= promo["max_uses"]:
                return result
        
        # Vérifier le montant minimum
        min_order = promo.get("min_order_amount", 0)
        if cart_total < min_order:
            return result
        
        # Calculer la réduction
        if promo.get("discount_type") == "percentage":
            discount = cart_total * (promo.get("discount_value", 0) / 100)
            # Appliquer le maximum si défini
            if promo.get("max_discount"):
                discount = min(discount, promo["max_discount"])
        else:
            discount = min(promo.get("discount_value", 0), cart_total)
        
        result["applied"] = True
        result["discount"] = round(discount, 2)
        result["name"] = promo.get("name", code)
        result["promo_id"] = promo.get("id")
        
        return result
    
    async def _generate_suggestions(self, items: List[dict], cart_total: float, active_promos: List[dict]) -> List[dict]:
        """
        Génère des suggestions pour bénéficier de promos
        """
        suggestions = []
        
        for promo in active_promos:
            conditions = promo.get("conditions", {})
            min_order = conditions.get("min_order_amount", 0)
            
            # Suggérer si proche du minimum
            if min_order > 0 and cart_total < min_order:
                diff = min_order - cart_total
                if diff <= 10:  # Suggérer si moins de 10€ manquants
                    suggestions.append({
                        "type": "add_amount",
                        "message": f"Ajoute {diff:.2f}€ pour bénéficier de {promo.get('name')}",
                        "promo_name": promo.get("name"),
                        "amount_needed": diff
                    })
        
        return suggestions[:3]  # Maximum 3 suggestions
    
    async def validate_promo_code(self, code: str, cart_total: float = 0) -> dict:
        """
        Valide un code promo sans l'appliquer
        """
        promo = await self.db.promo_codes.find_one({
            "code": code.upper(),
            "is_active": True
        })
        
        if not promo:
            return {"valid": False, "error": "Code promo invalide"}
        
        # Vérifier les dates
        now = datetime.now(timezone.utc)
        
        if promo.get("end_date"):
            end = datetime.fromisoformat(promo["end_date"].replace("Z", "+00:00"))
            if now > end:
                return {"valid": False, "error": "Ce code promo a expiré"}
        
        # Vérifier le minimum
        min_order = promo.get("min_order_amount", 0)
        if cart_total > 0 and cart_total < min_order:
            return {
                "valid": False,
                "error": f"Minimum de commande: {min_order}€"
            }
        
        return {
            "valid": True,
            "promo": {
                "id": promo.get("id"),
                "name": promo.get("name"),
                "code": promo.get("code"),
                "discount_type": promo.get("discount_type"),
                "discount_value": promo.get("discount_value"),
                "min_order_amount": min_order
            }
        }

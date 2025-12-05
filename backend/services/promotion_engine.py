from typing import List, Dict, Any, Optional
from datetime import datetime, date, time
from models.promotion import Promotion, PromotionType, DiscountValueType
import logging

logger = logging.getLogger(__name__)

class PromotionEngine:
    """
    Moteur de calcul et d'application des promotions Family's
    """
    
    def __init__(self, db):
        self.db = db
    
    async def get_applicable_promotions(
        self,
        cart: Dict[str, Any],
        customer: Optional[Dict[str, Any]] = None,
        promo_code: Optional[str] = None
    ) -> List[Dict]:
        """
        Récupère toutes les promotions applicables au panier
        """
        now = datetime.now()
        today = now.date()
        current_time = now.time()
        current_day = now.strftime("%a").lower()[:3]
        
        query = {
            "status": "active",
            "start_date": {"$lte": today.isoformat()},
            "end_date": {"$gte": today.isoformat()}
        }
        
        promos_raw = await self.db.promotions.find(query).to_list(length=None)
        applicable_promos = []
        
        for promo_dict in promos_raw:
            promo_dict.pop("_id", None)
            
            if not self._check_conditions(promo_dict, cart, customer, promo_code, current_day, current_time):
                continue
            
            applicable_promos.append(promo_dict)
        
        applicable_promos.sort(key=lambda p: p.get("priority", 0), reverse=True)
        
        return applicable_promos
    
    def _check_conditions(
        self,
        promo: Dict,
        cart: Dict[str, Any],
        customer: Optional[Dict[str, Any]],
        promo_code: Optional[str],
        current_day: str,
        current_time: time
    ) -> bool:
        """
        Vérifie toutes les conditions d'applicabilité
        """
        # Code promo requis
        if promo.get("code_required"):
            promo_code_upper = promo_code.upper() if promo_code else None
            if promo.get("promo_code") != promo_code_upper:
                return False
        
        # Jours actifs
        days_active = promo.get("days_active", [])
        if days_active and current_day not in days_active:
            return False
        
        # Horaires
        start_time_str = promo.get("start_time")
        end_time_str = promo.get("end_time")
        if start_time_str and end_time_str:
            try:
                start_t = time.fromisoformat(start_time_str) if isinstance(start_time_str, str) else start_time_str
                end_t = time.fromisoformat(end_time_str) if isinstance(end_time_str, str) else end_time_str
                if not (start_t <= current_time <= end_t):
                    return False
            except:
                pass
        
        # Montant panier
        cart_total = cart.get("total", 0)
        min_cart = promo.get("min_cart_amount")
        max_cart = promo.get("max_cart_amount")
        
        if min_cart and cart_total < min_cart:
            return False
        if max_cart and cart_total > max_cart:
            return False
        
        # Limite d'utilisation totale
        limit_total = promo.get("limit_total")
        usage_count = promo.get("usage_count", 0)
        if limit_total and usage_count >= limit_total:
            return False
        
        # Nouveau client
        if promo.get("target_new_customers") and customer:
            if customer.get("orders_count", 0) > 0:
                return False
        
        # Client inactif
        target_inactive = promo.get("target_inactive_days")
        if target_inactive and customer:
            last_order_date = customer.get("last_order_date")
            if last_order_date:
                try:
                    days_inactive = (datetime.now() - datetime.fromisoformat(last_order_date)).days
                    if days_inactive < target_inactive:
                        return False
                except:
                    pass
        
        return True
    
    def _get_item_category(self, item: Dict) -> str:
        """Helper pour récupérer la catégorie d'un item"""
        return item.get("category") or item.get("category_id") or ""
    
    def _get_item_id(self, item: Dict) -> str:
        """Helper pour récupérer l'ID d'un item"""
        return item.get("product_id") or item.get("id") or ""
    
    def calculate_discount(
        self,
        promo: Dict,
        cart: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calcule la remise pour une promotion donnée
        """
        items = cart.get("items", [])
        cart_total = cart.get("total", 0)
        promo_type = promo.get("type")
        
        if promo_type == "bogo":
            return self._calculate_bogo(promo, items)
        
        elif promo_type == "percent_item":
            return self._calculate_percent_item(promo, items)
        
        elif promo_type == "percent_category":
            return self._calculate_percent_category(promo, items)
        
        elif promo_type == "fixed_item":
            return self._calculate_fixed_item(promo, items)
        
        elif promo_type == "fixed_category":
            return self._calculate_fixed_category(promo, items)
        
        elif promo_type == "conditional_discount":
            return self._calculate_conditional(promo, items)
        
        elif promo_type == "threshold":
            return self._calculate_threshold(promo, cart_total)
        
        elif promo_type == "shipping_free":
            return {"discount": cart.get("delivery_fee", 0), "type": "shipping"}
        
        elif promo_type in ["happy_hour", "flash", "new_customer", "inactive_customer", "seasonal", "promo_code"]:
            return self._calculate_percent_cart(promo, cart_total)
        
        return {"discount": 0, "type": "unknown"}
    
    def _calculate_bogo(self, promo: Dict, items: List[Dict]) -> Dict[str, Any]:
        """BOGO: Achetez X obtenez Y gratuit"""
        eligible_cats = promo.get("eligible_categories", [])
        eligible_prods = promo.get("eligible_products", [])
        
        eligible_items = []
        for item in items:
            cat = self._get_item_category(item)
            prod_id = self._get_item_id(item)
            
            if prod_id in eligible_prods or cat in eligible_cats or (not eligible_cats and not eligible_prods):
                eligible_items.append(item)
        
        if not eligible_items:
            return {"discount": 0, "type": "bogo", "items_free": []}
        
        cheapest_free = promo.get("bogo_cheapest_free", False)
        eligible_items.sort(key=lambda x: x.get("price", 0), reverse=not cheapest_free)
        
        buy_qty = promo.get("bogo_buy_quantity", 1)
        get_qty = promo.get("bogo_get_quantity", 1)
        limit_per_customer = promo.get("limit_per_customer")  # Limite d'utilisation
        
        total_discount = 0
        free_items = []
        total_free_count = 0  # Compteur total d'items gratuits
        
        for item in eligible_items:
            qty = item.get("quantity", 1)
            sets = qty // (buy_qty + get_qty)
            
            if sets > 0:
                free_qty = sets * get_qty
                
                # Appliquer la limite par client si définie
                if limit_per_customer:
                    remaining_limit = limit_per_customer - total_free_count
                    if remaining_limit <= 0:
                        break
                    free_qty = min(free_qty, remaining_limit)
                
                total_free_count += free_qty
                item_price = item.get("price", 0)
                discount = free_qty * item_price
                total_discount += discount
                free_items.append({"name": item.get("name"), "qty": free_qty, "savings": discount})
        
        return {"discount": total_discount, "type": "bogo", "items_free": free_items}
    
    def _calculate_percent_item(self, promo: Dict, items: List[Dict]) -> Dict[str, Any]:
        """Remise % sur produit(s) spécifique(s)"""
        eligible_prods = promo.get("eligible_products", [])
        discount_value = promo.get("discount_value", 0)
        total_discount = 0
        
        for item in items:
            prod_id = self._get_item_id(item)
            if prod_id in eligible_prods:
                item_total = item.get("price", 0) * item.get("quantity", 1)
                discount = item_total * (discount_value / 100)
                total_discount += discount
        
        return {"discount": total_discount, "type": "percent_item"}
    
    def _calculate_percent_category(self, promo: Dict, items: List[Dict]) -> Dict[str, Any]:
        """Remise % sur catégorie"""
        eligible_cats = promo.get("eligible_categories", [])
        excluded_cats = promo.get("excluded_categories", [])
        discount_value = promo.get("discount_value", 0)
        total_discount = 0
        
        for item in items:
            cat = self._get_item_category(item)
            if cat in eligible_cats and cat not in excluded_cats:
                item_total = item.get("price", 0) * item.get("quantity", 1)
                discount = item_total * (discount_value / 100)
                total_discount += discount
        
        return {"discount": total_discount, "type": "percent_category"}
    
    def _calculate_fixed_item(self, promo: Dict, items: List[Dict]) -> Dict[str, Any]:
        """Remise fixe sur produit(s)"""
        eligible_prods = promo.get("eligible_products", [])
        discount_value = promo.get("discount_value", 0)
        total_discount = 0
        
        for item in items:
            prod_id = self._get_item_id(item)
            if prod_id in eligible_prods:
                qty = item.get("quantity", 1)
                item_total = item.get("price", 0) * qty
                discount = min(discount_value * qty, item_total)
                total_discount += discount
        
        return {"discount": total_discount, "type": "fixed_item"}
    
    def _calculate_fixed_category(self, promo: Dict, items: List[Dict]) -> Dict[str, Any]:
        """Remise fixe sur catégorie"""
        eligible_cats = promo.get("eligible_categories", [])
        discount_value = promo.get("discount_value", 0)
        total_discount = 0
        
        for item in items:
            cat = self._get_item_category(item)
            if cat in eligible_cats:
                qty = item.get("quantity", 1)
                item_total = item.get("price", 0) * qty
                discount = min(discount_value * qty, item_total)
                total_discount += discount
        
        return {"discount": total_discount, "type": "fixed_category"}
    
    def _calculate_conditional(self, promo: Dict, items: List[Dict]) -> Dict[str, Any]:
        """Remise conditionnelle: 2e à -50%, 3 pour 2, etc."""
        eligible_cats = promo.get("eligible_categories", [])
        eligible_prods = promo.get("eligible_products", [])
        cond_qty = promo.get("conditional_quantity", 2)
        cond_discount = promo.get("conditional_discount_percent", 50)
        
        eligible_items = []
        for item in items:
            cat = self._get_item_category(item)
            prod_id = self._get_item_id(item)
            
            if prod_id in eligible_prods or cat in eligible_cats or (not eligible_cats and not eligible_prods):
                eligible_items.append(item)
        
        if not eligible_items:
            return {"discount": 0, "type": "conditional"}
        
        total_discount = 0
        details = []
        
        for item in eligible_items:
            qty = item.get("quantity", 1)
            price = item.get("price", 0)
            
            if qty >= cond_qty:
                discounted_items = qty // cond_qty
                discount_per_item = price * (cond_discount / 100)
                discount = discounted_items * discount_per_item
                total_discount += discount
                details.append({
                    "name": item.get("name"),
                    "discounted_qty": discounted_items,
                    "savings": discount
                })
        
        return {"discount": total_discount, "type": "conditional", "details": details}
    
    def _calculate_threshold(self, promo: Dict, cart_total: float) -> Dict[str, Any]:
        """Seuil de panier atteint"""
        min_cart = promo.get("min_cart_amount", 0)
        
        if cart_total >= min_cart:
            discount_type = promo.get("discount_type", "percentage")
            discount_value = promo.get("discount_value", 0)
            
            if discount_type == "percentage":
                discount = cart_total * (discount_value / 100)
            else:
                discount = min(discount_value, cart_total)
            
            return {"discount": discount, "type": "threshold"}
        
        return {"discount": 0, "type": "threshold", "amount_needed": min_cart - cart_total}
    
    def _calculate_percent_cart(self, promo: Dict, cart_total: float) -> Dict[str, Any]:
        """Remise % sur panier total"""
        discount_type = promo.get("discount_type", "percentage")
        discount_value = promo.get("discount_value", 0)
        
        if discount_type == "percentage":
            discount = cart_total * (discount_value / 100)
        else:
            discount = min(discount_value, cart_total)
        
        return {"discount": discount, "type": "cart_percent"}
    
    async def apply_promotions(
        self,
        cart: Dict[str, Any],
        customer: Optional[Dict[str, Any]] = None,
        promo_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Applique toutes les promotions applicables au panier
        """
        applicable_promos = await self.get_applicable_promotions(cart, customer, promo_code)
        
        applied_promos = []
        total_discount = 0
        loyalty_multiplier = 1.0
        
        for promo in applicable_promos:
            promo_type = promo.get("type")
            
            # Loyalty multiplier
            if promo_type == "loyalty_multiplier":
                mult_value = promo.get("multiplier_value", 1.0)
                loyalty_multiplier = max(loyalty_multiplier, mult_value)
                applied_promos.append({
                    "id": promo.get("id"),
                    "name": promo.get("name"),
                    "type": "loyalty_multiplier",
                    "multiplier": mult_value,
                    "badge": promo.get("badge_text")
                })
                continue
            
            # Calculer remise
            result = self.calculate_discount(promo, cart)
            discount = result.get("discount", 0)
            
            if discount > 0:
                # Vérifier cumul
                if not promo.get("stackable", False) and applied_promos:
                    existing_discount_promos = [p for p in applied_promos if p.get("discount", 0) > 0]
                    if existing_discount_promos:
                        continue
                
                total_discount += discount
                applied_promos.append({
                    "id": promo.get("id"),
                    "name": promo.get("name"),
                    "type": promo_type,
                    "discount": round(discount, 2),
                    "badge": promo.get("badge_text"),
                    "ticket_text": promo.get("ticket_text"),
                    "details": result.get("details") or result.get("items_free")
                })
        
        return {
            "original_total": cart.get("total", 0),
            "total_discount": round(total_discount, 2),
            "final_total": round(max(0, cart.get("total", 0) - total_discount), 2),
            "applied_promotions": applied_promos,
            "loyalty_multiplier": loyalty_multiplier
        }

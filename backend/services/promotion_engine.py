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
    ) -> List[Promotion]:
        """
        Récupère toutes les promotions applicables au panier
        """
        now = datetime.now()
        today = now.date()
        current_time = now.time()
        current_day = now.strftime("%a").lower()[:3]  # mon, tue, wed...
        
        # Requête MongoDB pour promos actives
        query = {
            "is_active": True,
            "status": "active",
            "start_date": {"$lte": today.isoformat()},
            "end_date": {"$gte": today.isoformat()}
        }
        
        promos_raw = await self.db.promotions.find(query).to_list(length=None)
        applicable_promos = []
        
        for promo_dict in promos_raw:
            # Reconstruire le modèle Promotion
            promo = Promotion(**promo_dict)
            
            # Vérifier conditions
            if not self._check_conditions(promo, cart, customer, promo_code, current_day, current_time):
                continue
            
            applicable_promos.append(promo)
        
        # Trier par priorité (plus haute en premier)
        applicable_promos.sort(key=lambda p: p.priority, reverse=True)
        
        return applicable_promos
    
    def _check_conditions(
        self,
        promo: Promotion,
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
        if promo.code_required and promo.promo_code != promo_code:
            return False
        
        # Jours actifs
        if promo.days_active and current_day not in promo.days_active:
            return False
        
        # Horaires
        if promo.start_time and promo.end_time:
            if not (promo.start_time <= current_time <= promo.end_time):
                return False
        
        # Montant panier
        cart_total = cart.get("total", 0)
        if promo.min_cart_amount and cart_total < promo.min_cart_amount:
            return False
        if promo.max_cart_amount and cart_total > promo.max_cart_amount:
            return False
        
        # Limite d'utilisation totale
        if promo.limit_total and promo.usage_count >= promo.limit_total:
            return False
        
        # Nouveau client
        if promo.target_new_customers and customer:
            if customer.get("orders_count", 0) > 0:
                return False
        
        # Client inactif
        if promo.target_inactive_days and customer:
            last_order_date = customer.get("last_order_date")
            if last_order_date:
                days_inactive = (datetime.now() - datetime.fromisoformat(last_order_date)).days
                if days_inactive < promo.target_inactive_days:
                    return False
        
        return True
    
    def calculate_discount(
        self,
        promo: Promotion,
        cart: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calcule la remise pour une promotion donnée
        """
        items = cart.get("items", [])
        cart_total = cart.get("total", 0)
        
        if promo.type == PromotionType.BOGO:
            return self._calculate_bogo(promo, items)
        
        elif promo.type == PromotionType.PERCENT_ITEM:
            return self._calculate_percent_item(promo, items)
        
        elif promo.type == PromotionType.PERCENT_CATEGORY:
            return self._calculate_percent_category(promo, items)
        
        elif promo.type == PromotionType.FIXED_ITEM:
            return self._calculate_fixed_item(promo, items)
        
        elif promo.type == PromotionType.FIXED_CATEGORY:
            return self._calculate_fixed_category(promo, items)
        
        elif promo.type == PromotionType.CONDITIONAL_DISCOUNT:
            return self._calculate_conditional(promo, items)
        
        elif promo.type == PromotionType.THRESHOLD:
            return self._calculate_threshold(promo, cart_total)
        
        elif promo.type == PromotionType.SHIPPING_FREE:
            return {"discount": cart.get("delivery_fee", 0), "type": "shipping"}
        
        elif promo.type == PromotionType.HAPPY_HOUR:
            return self._calculate_percent_cart(promo, cart_total)
        
        elif promo.type == PromotionType.FLASH:
            return self._calculate_percent_cart(promo, cart_total)
        
        elif promo.type == PromotionType.NEW_CUSTOMER:
            return self._calculate_percent_cart(promo, cart_total)
        
        elif promo.type == PromotionType.INACTIVE_CUSTOMER:
            return self._calculate_percent_cart(promo, cart_total)
        
        elif promo.type == PromotionType.SEASONAL:
            return self._calculate_percent_cart(promo, cart_total)
        
        elif promo.type == PromotionType.PROMO_CODE:
            return self._calculate_percent_cart(promo, cart_total)
        
        return {"discount": 0, "type": "unknown"}
    
    def _calculate_bogo(self, promo: Promotion, items: List[Dict]) -> Dict[str, Any]:
        """BOGO: Achetez X obtenez Y gratuit"""
        eligible_items = [
            item for item in items
            if item.get("product_id") in promo.eligible_products or
               item.get("category_id") in promo.eligible_categories
        ]
        
        if not eligible_items:
            return {"discount": 0, "type": "bogo", "items_free": []}
        
        # Trier par prix (décroissant si cheapest_free = False)
        eligible_items.sort(key=lambda x: x.get("price", 0), reverse=not promo.bogo_cheapest_free)
        
        total_discount = 0
        free_items = []
        
        for i, item in enumerate(eligible_items):
            qty = item.get("quantity", 1)
            sets = qty // (promo.bogo_buy_quantity + promo.bogo_get_quantity)
            
            if sets > 0:
                free_qty = sets * promo.bogo_get_quantity
                item_price = item.get("price", 0)
                discount = free_qty * item_price
                total_discount += discount
                free_items.append({"name": item.get("name"), "qty": free_qty})
        
        return {"discount": total_discount, "type": "bogo", "items_free": free_items}
    
    def _calculate_percent_item(self, promo: Promotion, items: List[Dict]) -> Dict[str, Any]:
        """Remise % sur produit(s) spécifique(s)"""
        total_discount = 0
        
        for item in items:
            if item.get("product_id") in promo.eligible_products:
                item_total = item.get("price", 0) * item.get("quantity", 1)
                discount = item_total * (promo.discount_value / 100)
                total_discount += discount
        
        return {"discount": total_discount, "type": "percent_item"}
    
    def _calculate_percent_category(self, promo: Promotion, items: List[Dict]) -> Dict[str, Any]:
        """Remise % sur catégorie"""
        total_discount = 0
        
        for item in items:
            if item.get("category_id") in promo.eligible_categories:
                item_total = item.get("price", 0) * item.get("quantity", 1)
                discount = item_total * (promo.discount_value / 100)
                total_discount += discount
        
        return {"discount": total_discount, "type": "percent_category"}
    
    def _calculate_fixed_item(self, promo: Promotion, items: List[Dict]) -> Dict[str, Any]:
        """Remise fixe sur produit(s)"""
        total_discount = 0
        
        for item in items:
            if item.get("product_id") in promo.eligible_products:
                qty = item.get("quantity", 1)
                discount = min(promo.discount_value * qty, item.get("price", 0) * qty)
                total_discount += discount
        
        return {"discount": total_discount, "type": "fixed_item"}
    
    def _calculate_fixed_category(self, promo: Promotion, items: List[Dict]) -> Dict[str, Any]:
        """Remise fixe sur catégorie"""
        total_discount = 0
        
        for item in items:
            if item.get("category_id") in promo.eligible_categories:
                qty = item.get("quantity", 1)
                discount = min(promo.discount_value * qty, item.get("price", 0) * qty)
                total_discount += discount
        
        return {"discount": total_discount, "type": "fixed_category"}
    
    def _calculate_conditional(self, promo: Promotion, items: List[Dict]) -> Dict[str, Any]:
        """Remise conditionnelle: 2e à -50%, 3 pour 2, etc."""
        eligible_items = [
            item for item in items
            if item.get("product_id") in promo.eligible_products or
               item.get("category_id") in promo.eligible_categories
        ]
        
        if not eligible_items:
            return {"discount": 0, "type": "conditional"}
        
        total_discount = 0
        
        for item in eligible_items:
            qty = item.get("quantity", 1)
            price = item.get("price", 0)
            
            # Exemple: 2e à -50% (conditional_quantity = 2, conditional_discount_percent = 50)
            if qty >= promo.conditional_quantity:
                discounted_items = qty // promo.conditional_quantity
                discount_per_item = price * (promo.conditional_discount_percent / 100)
                total_discount += discounted_items * discount_per_item
        
        return {"discount": total_discount, "type": "conditional"}
    
    def _calculate_threshold(self, promo: Promotion, cart_total: float) -> Dict[str, Any]:
        """Seuil de panier atteint"""
        if cart_total >= promo.min_cart_amount:
            if promo.discount_type == DiscountValueType.PERCENTAGE:
                discount = cart_total * (promo.discount_value / 100)
            else:
                discount = promo.discount_value
            
            return {"discount": discount, "type": "threshold"}
        
        return {"discount": 0, "type": "threshold"}
    
    def _calculate_percent_cart(self, promo: Promotion, cart_total: float) -> Dict[str, Any]:
        """Remise % sur panier total"""
        discount = cart_total * (promo.discount_value / 100)
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
            # Loyalty multiplier
            if promo.type == PromotionType.LOYALTY_MULTIPLIER:
                loyalty_multiplier = max(loyalty_multiplier, promo.multiplier_value or 1.0)
                applied_promos.append({
                    "id": promo.id,
                    "name": promo.name,
                    "type": "loyalty_multiplier",
                    "multiplier": promo.multiplier_value
                })
                continue
            
            # Calculer remise
            result = self.calculate_discount(promo, cart)
            discount = result.get("discount", 0)
            
            if discount > 0:
                # Vérifier cumul
                if not promo.stackable and applied_promos:
                    # Ne pas cumuler avec d'autres promos
                    continue
                
                total_discount += discount
                applied_promos.append({
                    "id": promo.id,
                    "name": promo.name,
                    "type": promo.type,
                    "discount": discount,
                    "badge": promo.badge_text,
                    "ticket_text": promo.ticket_text
                })
        
        return {
            "original_total": cart.get("total", 0),
            "total_discount": total_discount,
            "final_total": max(0, cart.get("total", 0) - total_discount),
            "applied_promotions": applied_promos,
            "loyalty_multiplier": loyalty_multiplier
        }

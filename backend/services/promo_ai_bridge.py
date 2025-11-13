"""
Service de passerelle entre IA Marketing et Moteur de Promotions V2
Convertit une campagne IA validée en promotion V2 (brouillon)
"""

from datetime import datetime, timezone, date, time
from typing import Dict, Any
from models.promotion import Promotion, PromotionType, DiscountValueType
from database import db
import uuid

RESTAURANT_ID = "family-s-restaurant"

async def convert_ai_campaign_to_promotion_v2(campaign: Dict[str, Any]) -> Promotion:
    """
    Convertit une campagne IA en promotion V2 complète
    """
    
    # Mapper le type de promo
    promo_type_map = {
        "bogo": PromotionType.BOGO,
        "percent_item": PromotionType.PERCENT_ITEM,
        "percent_category": PromotionType.PERCENT_CATEGORY,
        "fixed_item": PromotionType.FIXED_ITEM,
        "conditional_discount": PromotionType.CONDITIONAL_DISCOUNT,
        "threshold": PromotionType.THRESHOLD,
        "shipping_free": PromotionType.SHIPPING_FREE,
        "new_customer": PromotionType.NEW_CUSTOMER,
        "inactive_customer": PromotionType.INACTIVE_CUSTOMER,
        "loyalty_multiplier": PromotionType.LOYALTY_MULTIPLIER,
        "happy_hour": PromotionType.HAPPY_HOUR,
        "flash": PromotionType.FLASH,
        "promo_code": PromotionType.PROMO_CODE
    }
    
    # Mapper le discount type
    discount_type_map = {
        "percentage": DiscountValueType.PERCENTAGE,
        "fixed": DiscountValueType.FIXED,
        "free_item": DiscountValueType.FREE_ITEM,
        "bogo": DiscountValueType.FREE_ITEM,
        "fidelity_multiplier": DiscountValueType.MULTIPLIER,
        "multiplier": DiscountValueType.MULTIPLIER
    }
    
    promo_type = promo_type_map.get(campaign.get("promo_type_v2", "percent_item"), PromotionType.PERCENT_ITEM)
    discount_type = discount_type_map.get(campaign.get("discount_type", "percentage"), DiscountValueType.PERCENTAGE)
    
    # Parser les dates
    start_date = date.fromisoformat(campaign["start_date"])
    end_date = date.fromisoformat(campaign["end_date"])
    
    # Parser les heures si présentes
    start_time_obj = None
    end_time_obj = None
    if campaign.get("start_time"):
        try:
            hours, minutes = campaign["start_time"].split(":")
            start_time_obj = time(int(hours), int(minutes))
        except:
            pass
    if campaign.get("end_time"):
        try:
            hours, minutes = campaign["end_time"].split(":")
            end_time_obj = time(int(hours), int(minutes))
        except:
            pass
    
    # Créer la promotion V2
    promotion = Promotion(
        id=str(uuid.uuid4()),  # Nouvel ID unique
        restaurant_id=RESTAURANT_ID,
        name=campaign["name"],
        description=campaign.get("message", campaign["name"]),
        type=promo_type,
        eligible_products=campaign.get("product_ids", []),
        eligible_categories=campaign.get("category_ids", []),
        excluded_products=[],
        excluded_categories=[],
        discount_type=discount_type,
        discount_value=float(campaign.get("discount_value", 0)),
        
        # BOGO specifics
        bogo_buy_quantity=1,
        bogo_get_quantity=1 if promo_type == PromotionType.BOGO else None,
        bogo_cheapest_free=False,
        
        # Conditional specifics
        conditional_quantity=2 if promo_type == PromotionType.CONDITIONAL_DISCOUNT else None,
        conditional_discount_percent=float(campaign.get("discount_value", 50)) if promo_type == PromotionType.CONDITIONAL_DISCOUNT else None,
        
        # Threshold
        min_cart_amount=30.0 if promo_type == PromotionType.THRESHOLD else None,
        
        # Dates & Horaires
        start_date=start_date,
        end_date=end_date,
        start_time=start_time_obj,
        end_time=end_time_obj,
        days_active=campaign.get("days_active", []),
        
        # Affichage
        badge_text=campaign.get("badge_text", f"-{campaign.get('discount_value', 0)}%"),
        badge_color=campaign.get("badge_color", "#FF6B35"),
        banner_text=campaign.get("message", ""),
        ticket_text=f"Promo appliquée : {campaign.get('badge_text', '')} {campaign['name']}",
        
        # Limites
        limit_per_customer=None,
        limit_total=None,
        usage_count=0,
        
        # Priorités
        priority=5,  # Priorité moyenne
        stackable=False,  # Par défaut non cumulable
        
        # Multiplicateur fidélité
        multiplier_value=float(campaign.get("discount_value", 2)) if promo_type == PromotionType.LOYALTY_MULTIPLIER else None,
        
        # État : BROUILLON (draft)
        is_active=False,  # Pas active automatiquement
        status="draft",  # Brouillon à valider manuellement
        
        # Métadonnées
        created_by=f"IA Marketing (Campaign ID: {campaign.get('id', 'unknown')})",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        
        # Analytics tracking
        analytics={
            "created_by_ai": True,
            "ai_campaign_id": campaign.get("id"),
            "ai_source_analysis": campaign.get("source_promo_analysis", ""),
            "ai_impact_estimate": campaign.get("impact_estimate", {})
        }
    )
    
    return promotion


async def create_promotion_draft_from_ai(campaign_id: str) -> Dict[str, Any]:
    """
    Crée un brouillon de promotion V2 à partir d'une campagne IA validée
    Retourne l'ID de la promotion créée
    """
    
    # Récupérer la campagne IA
    campaign = await db.ai_campaign_suggestions.find_one({"id": campaign_id})
    
    if not campaign:
        raise ValueError(f"Campagne AI {campaign_id} introuvable")
    
    if campaign.get("status") != "accepted":
        raise ValueError(f"Campagne {campaign_id} n'est pas acceptée")
    
    # Vérifier si une promo existe déjà pour cette campagne
    existing_promo = await db.promotions.find_one({
        "analytics.ai_campaign_id": campaign_id
    })
    
    if existing_promo:
        return {
            "success": True,
            "promotion_id": existing_promo["id"],
            "already_exists": True,
            "message": "Promotion déjà créée pour cette campagne"
        }
    
    # Convertir en Promotion V2
    promotion = await convert_ai_campaign_to_promotion_v2(campaign)
    
    # Sauvegarder dans la DB
    promo_dict = promotion.model_dump()
    
    # Sérialiser les dates/times
    if isinstance(promo_dict.get('created_at'), datetime):
        promo_dict['created_at'] = promo_dict['created_at'].isoformat()
    if isinstance(promo_dict.get('updated_at'), datetime):
        promo_dict['updated_at'] = promo_dict['updated_at'].isoformat()
    if isinstance(promo_dict.get('start_date'), date):
        promo_dict['start_date'] = promo_dict['start_date'].isoformat()
    if isinstance(promo_dict.get('end_date'), date):
        promo_dict['end_date'] = promo_dict['end_date'].isoformat()
    if isinstance(promo_dict.get('start_time'), time):
        promo_dict['start_time'] = promo_dict['start_time'].isoformat()
    if isinstance(promo_dict.get('end_time'), time):
        promo_dict['end_time'] = promo_dict['end_time'].isoformat()
    
    await db.promotions.insert_one(promo_dict)
    
    return {
        "success": True,
        "promotion_id": promotion.id,
        "already_exists": False,
        "message": f"Promotion V2 créée en brouillon : {promotion.name}"
    }

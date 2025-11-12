from fastapi import APIRouter, Security, HTTPException
from middleware.auth import require_manager_or_admin
from models.ai_campaign import AICampaignSuggestion, AICampaignResult, AICampaignValidation, AIMarketingSettings
from services.ai_marketing_service import (
    analyze_and_generate_campaigns,
    calculate_campaign_results,
    generate_weekly_summary
)
from database import db
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/ai-marketing", tags=["admin-ai-marketing"])

class GenerateCampaignsRequest(BaseModel):
    force_regenerate: bool = False

@router.post("/campaigns/generate")
async def generate_campaigns(
    request: GenerateCampaignsRequest
    # current_user: dict = Security(require_manager_or_admin)  # TEMPORAIREMENT DESACTIVE
):
    """Génère de nouvelles campagnes IA."""
    restaurant_id = "default"  # current_user.get("restaurant_id", "default")
    
    # Récupérer les paramètres
    settings_doc = await db.ai_marketing_settings.find_one({"restaurant_id": restaurant_id})
    settings = settings_doc if settings_doc else {}
    
    # Générer les campagnes
    campaigns = await analyze_and_generate_campaigns(restaurant_id, settings)
    
    # Sauvegarder dans la DB
    saved_campaigns = []
    for campaign_data in campaigns:
        campaign = AICampaignSuggestion(**campaign_data)
        campaign_dict = campaign.model_dump()
        await db.ai_campaign_suggestions.insert_one(campaign_dict)
        saved_campaigns.append(campaign_dict)
    
    return {
        "success": True,
        "campaigns_generated": len(saved_campaigns),
        "campaigns": saved_campaigns
    }

@router.get("/campaigns/pending")
async def get_pending_campaigns(current_user: dict = Security(require_manager_or_admin)):
    """Récupère les campagnes en attente de validation."""
    restaurant_id = current_user.get("restaurant_id", "default")
    
    campaigns = await db.ai_campaign_suggestions.find({
        "restaurant_id": restaurant_id,
        "status": "pending"
    }, {"_id": 0}).to_list(length=None)
    
    return {"campaigns": campaigns}

@router.get("/campaigns/all")
async def get_all_campaigns(
    status: Optional[str] = None
    # current_user: dict = Security(require_manager_or_admin)  # TEMPORAIREMENT DESACTIVE
):
    """Récupère toutes les campagnes avec filtre optionnel."""
    restaurant_id = "default"  # current_user.get("restaurant_id", "default")
    
    query = {"restaurant_id": restaurant_id}
    if status:
        query["status"] = status
    
    campaigns = await db.ai_campaign_suggestions.find(query, {"_id": 0}).to_list(length=None)
    
    return {"campaigns": campaigns}

@router.post("/campaigns/{campaign_id}/validate")
async def validate_campaign(
    campaign_id: str,
    validation: AICampaignValidation,
    current_user: dict = Security(require_manager_or_admin)
):
    """Valide ou refuse une campagne."""
    restaurant_id = current_user.get("restaurant_id", "default")
    
    # Récupérer la campagne
    campaign = await db.ai_campaign_suggestions.find_one({
        "id": campaign_id,
        "restaurant_id": restaurant_id
    })
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    # Mettre à jour le statut
    new_status = "accepted" if validation.accepted else "refused"
    await db.ai_campaign_suggestions.update_one(
        {"id": campaign_id},
        {"$set": {
            "status": new_status,
            "validated_at": datetime.now(timezone.utc).isoformat(),
            "validated_by": current_user.get("email")
        }}
    )
    
    # Si acceptée, créer la promo en brouillon
    if validation.accepted:
        promo_data = {
            "id": campaign_id,  # Même ID pour lier campagne et promo
            "restaurant_id": restaurant_id,
            "title": campaign["name"],
            "description": campaign["message"],
            "discount_type": campaign["discount_type"],
            "discount_value": campaign["discount_value"],
            "start_date": campaign["start_date"],
            "end_date": campaign["end_date"],
            "is_active": False,  # Brouillon
            "target_hours": campaign.get("target_hours"),
            "created_by_ai": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.promos.insert_one(promo_data)
    
    # Créer un résultat
    result = AICampaignResult(
        campaign_id=campaign_id,
        restaurant_id=restaurant_id,
        accepted=validation.accepted,
        notes=validation.notes
    )
    await db.ai_campaign_results.insert_one(result.model_dump())
    
    return {
        "success": True,
        "campaign_id": campaign_id,
        "status": new_status,
        "promo_created": validation.accepted
    }

@router.get("/campaigns/{campaign_id}/results")
async def get_campaign_results(
    campaign_id: str,
    current_user: dict = Security(require_manager_or_admin)
):
    """Récupère les résultats d'une campagne."""
    restaurant_id = current_user.get("restaurant_id", "default")
    
    # Résultats stockés
    result = await db.ai_campaign_results.find_one({
        "campaign_id": campaign_id,
        "restaurant_id": restaurant_id
    }, {"_id": 0})
    
    # Si acceptée, calculer les résultats réels
    if result and result.get("accepted"):
        real_results = await calculate_campaign_results(campaign_id, restaurant_id)
        result.update(real_results)
    
    return result or {}

@router.get("/stats")
async def get_marketing_stats(current_user: dict = Security(require_manager_or_admin)):
    """Récupère les stats globales des campagnes IA."""
    restaurant_id = current_user.get("restaurant_id", "default")
    
    # Toutes les campagnes
    all_campaigns = await db.ai_campaign_suggestions.find({
        "restaurant_id": restaurant_id
    }).to_list(length=None)
    
    accepted = [c for c in all_campaigns if c.get("status") == "accepted"]
    refused = [c for c in all_campaigns if c.get("status") == "refused"]
    pending = [c for c in all_campaigns if c.get("status") == "pending"]
    
    # Résultats
    results = await db.ai_campaign_results.find({
        "restaurant_id": restaurant_id,
        "accepted": True
    }).to_list(length=None)
    
    total_ca_gain = sum(r.get("real_ca", 0) for r in results)
    total_fidelity = sum(r.get("fidelity_points_gained", 0) for r in results)
    
    # Résumé hebdo
    weekly_summary = await generate_weekly_summary(restaurant_id)
    
    return {
        "total_campaigns": len(all_campaigns),
        "accepted": len(accepted),
        "refused": len(refused),
        "pending": len(pending),
        "total_ca_generated": round(total_ca_gain, 2),
        "total_fidelity_points": total_fidelity,
        "acceptance_rate": round(len(accepted) / len(all_campaigns) * 100, 1) if all_campaigns else 0,
        "weekly_summary": weekly_summary
    }

@router.get("/settings")
async def get_settings(current_user: dict = Security(require_manager_or_admin)):
    """Récupère les paramètres IA."""
    restaurant_id = current_user.get("restaurant_id", "default")
    
    settings = await db.ai_marketing_settings.find_one({
        "restaurant_id": restaurant_id
    }, {"_id": 0})
    
    # Si pas de settings, retourner les defaults
    if not settings:
        default_settings = AIMarketingSettings(restaurant_id=restaurant_id)
        return default_settings.model_dump()
    
    return settings

@router.put("/settings")
async def update_settings(
    settings_update: dict,
    current_user: dict = Security(require_manager_or_admin)
):
    """Met à jour les paramètres IA."""
    restaurant_id = current_user.get("restaurant_id", "default")
    
    settings_update["restaurant_id"] = restaurant_id
    settings_update["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Upsert
    await db.ai_marketing_settings.update_one(
        {"restaurant_id": restaurant_id},
        {"$set": settings_update},
        upsert=True
    )
    
    return {"success": True, "settings": settings_update}

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: str,
    current_user: dict = Security(require_manager_or_admin)
):
    """Supprime une campagne."""
    restaurant_id = current_user.get("restaurant_id", "default")
    
    result = await db.ai_campaign_suggestions.delete_one({
        "id": campaign_id,
        "restaurant_id": restaurant_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    return {"success": True, "deleted": campaign_id}

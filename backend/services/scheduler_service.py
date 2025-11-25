"""
Service de planification automatique pour l'IA Marketing
Job nocturne à 2h du matin pour générer de nouvelles campagnes
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timezone
from services.ai_marketing_service import analyze_and_generate_campaigns
from models.ai_campaign import AICampaignSuggestion
from database import db
import logging

logger = logging.getLogger(__name__)

RESTAURANT_ID = "family-s-restaurant"

scheduler = AsyncIOScheduler()

async def generate_nightly_campaigns_job():
    """
    Job qui tourne chaque nuit à 2h pour générer de nouvelles campagnes IA
    """
    try:
        logger.info("🌙 Début du job nocturne IA Marketing à 2h")
        
        # Récupérer les paramètres
        settings_doc = await db.ai_marketing_settings.find_one({"restaurant_id": RESTAURANT_ID})
        settings = settings_doc if settings_doc else {}
        
        # Vérifier le nombre de campagnes en attente
        pending_campaigns = await db.ai_campaign_suggestions.find({
            "restaurant_id": RESTAURANT_ID,
            "status": "pending"
        }).to_list(length=None)
        
        max_suggestions = settings.get("max_suggestions_per_week", 5)
        
        # Si déjà trop de campagnes en attente, skip
        if len(pending_campaigns) >= max_suggestions:
            logger.info(f"⏭️ Skip génération : {len(pending_campaigns)} campagnes déjà en attente (max: {max_suggestions})")
            return
        
        # Générer les campagnes
        campaigns = await analyze_and_generate_campaigns(RESTAURANT_ID, settings)
        
        # Sauvegarder dans la DB
        saved_count = 0
        for campaign_data in campaigns:
            campaign = AICampaignSuggestion(**campaign_data)
            campaign_dict = campaign.model_dump()
            await db.ai_campaign_suggestions.insert_one(campaign_dict)
            saved_count += 1
        
        logger.info(f"✅ Job nocturne terminé : {saved_count} nouvelles campagnes générées")
        
        # Log dans une collection de suivi
        await db.ai_marketing_jobs_log.insert_one({
            "job_type": "nightly_campaign_generation",
            "executed_at": datetime.now(timezone.utc).isoformat(),
            "campaigns_generated": saved_count,
            "pending_before": len(pending_campaigns),
            "status": "success"
        })
        
    except Exception as e:
        logger.error(f"❌ Erreur job nocturne IA Marketing: {str(e)}")
        # Log l'erreur
        await db.ai_marketing_jobs_log.insert_one({
            "job_type": "nightly_campaign_generation",
            "executed_at": datetime.now(timezone.utc).isoformat(),
            "campaigns_generated": 0,
            "status": "error",
            "error": str(e)
        })


def start_scheduler():
    """
    Démarre le scheduler avec le job nocturne à 2h
    """
    if not scheduler.running:
        # Job à 2h du matin chaque jour
        scheduler.add_job(
            generate_nightly_campaigns_job,
            trigger=CronTrigger(hour=2, minute=0),
            id="nightly_ai_campaigns",
            name="Génération nocturne campagnes IA Marketing",
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("⏰ Scheduler IA Marketing démarré - Job nocturne programmé à 2h")


def stop_scheduler():
    """
    Arrête le scheduler
    """
    if scheduler.running:
        scheduler.shutdown()
        logger.info("🛑 Scheduler IA Marketing arrêté")


async def trigger_manual_generation():
    """
    Permet de déclencher manuellement une génération
    (utile pour tester sans attendre 2h du matin)
    """
    logger.info("🔧 Génération manuelle déclenchée")
    await generate_nightly_campaigns_job()

from fastapi import APIRouter, HTTPException, status, Body
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, date, time
from models.promotion import (
    Promotion, PromotionCreate, PromotionUpdate,
    PromotionUsageLog, PromotionType
)
from services.promotion_engine import PromotionEngine
from database import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/promotions", tags=["admin-promotions"])

RESTAURANT_ID = "family-s-restaurant"

@router.get("")
async def get_promotions(
    status_filter: Optional[str] = None,
    type_filter: Optional[str] = None
):
    """Récupère toutes les promotions"""
    try:
        query = {"restaurant_id": RESTAURANT_ID}
        
        if status_filter:
            query["status"] = status_filter
        if type_filter:
            query["type"] = type_filter
        
        promos = await db.promotions.find(query).to_list(length=None)
        
        # Nettoyer les _id MongoDB
        for promo in promos:
            promo.pop("_id", None)
        
        return {"promotions": promos, "count": len(promos)}
    except Exception as e:
        logger.error(f"Error getting promotions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{promotion_id}")
async def get_promotion(promotion_id: str):
    """Récupère une promotion par ID"""
    try:
        promo = await db.promotions.find_one({"id": promotion_id, "restaurant_id": RESTAURANT_ID})
        
        if not promo:
            raise HTTPException(status_code=404, detail="Promotion not found")
        
        promo.pop("_id", None)
        return {"promotion": promo}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting promotion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_promotion(promo_create: PromotionCreate):
    """Crée une nouvelle promotion"""
    try:
        promo = Promotion(restaurant_id=RESTAURANT_ID, **promo_create.model_dump())
        promo_dict = promo.model_dump()
        
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
        promo_dict.pop("_id", None)
        
        return {"success": True, "promotion": promo_dict}
    except Exception as e:
        logger.error(f"Error creating promotion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{promotion_id}")
async def update_promotion(promotion_id: str, promo_update: PromotionUpdate):
    """Met à jour une promotion"""
    try:
        existing = await db.promotions.find_one({"id": promotion_id, "restaurant_id": RESTAURANT_ID})
        
        if not existing:
            raise HTTPException(status_code=404, detail="Promotion not found")
        
        update_data = promo_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Sérialiser dates/times si présentes
        if "start_date" in update_data and isinstance(update_data["start_date"], date):
            update_data["start_date"] = update_data["start_date"].isoformat()
        if "end_date" in update_data and isinstance(update_data["end_date"], date):
            update_data["end_date"] = update_data["end_date"].isoformat()
        if "start_time" in update_data and isinstance(update_data["start_time"], time):
            update_data["start_time"] = update_data["start_time"].isoformat()
        if "end_time" in update_data and isinstance(update_data["end_time"], time):
            update_data["end_time"] = update_data["end_time"].isoformat()
        
        await db.promotions.update_one(
            {"id": promotion_id, "restaurant_id": RESTAURANT_ID},
            {"$set": update_data}
        )
        
        updated_promo = await db.promotions.find_one({"id": promotion_id, "restaurant_id": RESTAURANT_ID})
        updated_promo.pop("_id", None)
        
        return {"success": True, "promotion": updated_promo}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating promotion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{promotion_id}")
async def delete_promotion(promotion_id: str):
    """Supprime une promotion"""
    try:
        result = await db.promotions.delete_one({"id": promotion_id, "restaurant_id": RESTAURANT_ID})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Promotion not found")
        
        return {"success": True, "message": "Promotion deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting promotion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate")
async def simulate_promotions(
    cart: Dict[str, Any] = Body(...),
    customer: Optional[Dict[str, Any]] = Body(None),
    promo_code: Optional[str] = Body(None)
):
    """Simule l'application des promotions sur un panier"""
    try:
        engine = PromotionEngine(db)
        result = await engine.apply_promotions(cart, customer, promo_code)
        
        return {
            "success": True,
            "simulation": result
        }
    except Exception as e:
        logger.error(f"Error simulating promotions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/overview")
async def get_analytics_overview():
    """Récupère les analytics globales des promotions"""
    try:
        # Total promotions actives
        active_count = await db.promotions.count_documents({
            "restaurant_id": RESTAURANT_ID,
            "status": "active"
        })
        
        # Total utilisation
        usage_logs = await db.promotion_usage_log.find({}).to_list(length=None)
        total_usage = len(usage_logs)
        
        # CA généré
        total_revenue = sum(log.get("original_amount", 0) for log in usage_logs)
        
        # Remise totale
        total_discount = sum(log.get("discount_amount", 0) for log in usage_logs)
        
        # Panier moyen
        avg_cart = total_revenue / total_usage if total_usage > 0 else 0
        
        # Top 5 promos
        promo_usage = {}
        for log in usage_logs:
            promo_id = log.get("promotion_id")
            if promo_id:
                promo_usage[promo_id] = promo_usage.get(promo_id, 0) + 1
        
        top_promos = sorted(promo_usage.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "active_promotions": active_count,
            "total_usage": total_usage,
            "total_revenue": total_revenue,
            "total_discount": total_discount,
            "average_cart": avg_cart,
            "top_promotions": [{"promo_id": pid, "usage_count": count} for pid, count in top_promos]
        }
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar")
async def get_promotions_calendar(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Récupère les promotions pour le calendrier"""
    try:
        query = {"restaurant_id": RESTAURANT_ID, "status": "active"}
        
        if start_date:
            query["end_date"] = {"$gte": start_date}
        if end_date:
            query["start_date"] = {"$lte": end_date}
        
        promos = await db.promotions.find(query).to_list(length=None)
        
        # Formater pour calendrier
        calendar_events = []
        for promo in promos:
            promo.pop("_id", None)
            calendar_events.append({
                "id": promo.get("id"),
                "title": promo.get("name"),
                "start": promo.get("start_date"),
                "end": promo.get("end_date"),
                "type": promo.get("type"),
                "badge": promo.get("badge_text"),
                "color": promo.get("badge_color", "#FF6B35")
            })
        
        return {"events": calendar_events}
    except Exception as e:
        logger.error(f"Error getting calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{promotion_id}/log-usage")
async def log_promotion_usage(
    promotion_id: str,
    order_id: str = Body(...),
    customer_id: str = Body(...),
    discount_amount: float = Body(...),
    original_amount: float = Body(...),
    final_amount: float = Body(...),
    promo_code_used: Optional[str] = Body(None)
):
    """Enregistre l'utilisation d'une promotion"""
    try:
        log = PromotionUsageLog(
            promotion_id=promotion_id,
            order_id=order_id,
            customer_id=customer_id,
            discount_amount=discount_amount,
            original_amount=original_amount,
            final_amount=final_amount,
            promo_code_used=promo_code_used
        )
        
        log_dict = log.model_dump()
        if isinstance(log_dict.get('created_at'), datetime):
            log_dict['created_at'] = log_dict['created_at'].isoformat()
        
        await db.promotion_usage_log.insert_one(log_dict)
        
        # Incrémenter usage_count
        await db.promotions.update_one(
            {"id": promotion_id},
            {"$inc": {"usage_count": 1}}
        )
        
        return {"success": True, "message": "Usage logged"}
    except Exception as e:
        logger.error(f"Error logging usage: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test/run-all")
async def run_automated_tests():
    """Lance tous les tests automatiques des promotions"""
    try:
        from tests.test_promotions import run_promotion_tests
        results = await run_promotion_tests(db)
        
        total = len(results)
        passed = sum(1 for r in results if r["passed"])
        
        return {
            "success": True,
            "total_tests": total,
            "passed": passed,
            "failed": total - passed,
            "success_rate": (passed / total * 100) if total > 0 else 0,
            "results": results
        }
    except Exception as e:
        logger.error(f"Error running tests: {e}")
        raise HTTPException(status_code=500, detail=str(e))

"""
Routes Promotions - Firebase/Firestore
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, timezone

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/promotions", tags=["firebase-promotions"])

class PromotionCreate(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_discount: Optional[float] = None
    buy_quantity: Optional[int] = None
    get_quantity: Optional[int] = None
    bogo_type: Optional[str] = None
    bogo_discount: Optional[float] = None
    applies_to: str = "all"
    product_ids: List[str] = []
    category_ids: List[str] = []
    usage_limit: Optional[int] = None
    per_customer_limit: Optional[int] = None
    happy_hour_start: Optional[str] = None
    happy_hour_end: Optional[str] = None
    happy_hour_days: List[int] = []
    start_date: str
    end_date: str
    code: Optional[str] = None
    requires_code: bool = False
    is_active: bool = True
    is_visible_in_app: bool = True
    badge_text: Optional[str] = None
    badge_color: Optional[str] = None

class PromotionUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_discount: Optional[float] = None
    buy_quantity: Optional[int] = None
    get_quantity: Optional[int] = None
    bogo_type: Optional[str] = None
    bogo_discount: Optional[float] = None
    applies_to: Optional[str] = None
    product_ids: Optional[List[str]] = None
    category_ids: Optional[List[str]] = None
    usage_limit: Optional[int] = None
    per_customer_limit: Optional[int] = None
    happy_hour_start: Optional[str] = None
    happy_hour_end: Optional[str] = None
    happy_hour_days: Optional[List[int]] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    code: Optional[str] = None
    requires_code: Optional[bool] = None
    is_active: Optional[bool] = None
    is_visible_in_app: Optional[bool] = None
    badge_text: Optional[str] = None
    badge_color: Optional[str] = None

@router.get("")
def get_promotions(active_only: bool = False):
    try:
        promos_ref = db.collection('promotions')
        if active_only:
            query = promos_ref.where('is_active', '==', True)
        else:
            query = promos_ref
        docs = query.stream()
        promotions = []
        for doc in docs:
            promo = doc.to_dict()
            promo['id'] = doc.id
            for field in ['created_at', 'updated_at']:
                if promo.get(field) and hasattr(promo[field], 'isoformat'):
                    promo[field] = promo[field].isoformat()
            promotions.append(promo)
        return {"promotions": promotions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active")
def get_active_promotions():
    try:
        promos_ref = db.collection('promotions')
        query = promos_ref.where('is_active', '==', True)
        docs = query.stream()
        promotions = []
        now = datetime.now(timezone.utc)
        for doc in docs:
            promo = doc.to_dict()
            promo['id'] = doc.id
            try:
                start = datetime.fromisoformat(promo.get('start_date', '').replace('Z', '+00:00'))
                end = datetime.fromisoformat(promo.get('end_date', '').replace('Z', '+00:00'))
                if start <= now <= end:
                    promotions.append(promo)
            except:
                promotions.append(promo)
        return {"promotions": promotions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{promotion_id}")
def get_promotion(promotion_id: str):
    try:
        doc_ref = db.collection('promotions').document(promotion_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Promotion non trouvée")
        promo = doc.to_dict()
        promo['id'] = doc.id
        return {"promotion": promo}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_promotion(promotion: PromotionCreate):
    try:
        now = datetime.now(timezone.utc)
        data = promotion.model_dump()
        data['usage_count'] = 0
        data['created_at'] = now
        data['updated_at'] = now
        doc_ref = db.collection('promotions').document()
        doc_ref.set(data)
        data['id'] = doc_ref.id
        data['created_at'] = now.isoformat()
        data['updated_at'] = now.isoformat()
        return {"success": True, "promotion": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{promotion_id}")
def update_promotion(promotion_id: str, promotion: PromotionUpdate):
    try:
        doc_ref = db.collection('promotions').document(promotion_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Promotion non trouvée")
        update_data = {k: v for k, v in promotion.model_dump().items() if v is not None}
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        promo = updated_doc.to_dict()
        promo['id'] = doc_ref.id
        return {"success": True, "promotion": promo}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{promotion_id}")
def delete_promotion(promotion_id: str):
    try:
        doc_ref = db.collection('promotions').document(promotion_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Promotion non trouvée")
        doc_ref.delete()
        return {"success": True, "message": "Promotion supprimée"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{promotion_id}/toggle")
def toggle_promotion(promotion_id: str, is_active: bool):
    try:
        doc_ref = db.collection('promotions').document(promotion_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Promotion non trouvée")
        doc_ref.update({
            'is_active': is_active,
            'updated_at': datetime.now(timezone.utc)
        })
        return {"success": True, "is_active": is_active}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

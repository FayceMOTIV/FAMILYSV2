"""
Routes Settings - Firebase/Firestore
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timezone

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/settings", tags=["firebase-settings"])

class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    hero_image_url: Optional[str] = None
    home_hero_image: Optional[str] = None
    home_tagline: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    opening_hours: Optional[Dict[str, Any]] = None
    order_hours: Optional[Dict[str, Any]] = None
    social_media: Optional[Dict[str, Any]] = None
    service_links: Optional[Dict[str, Any]] = None
    loyalty_percentage: Optional[float] = None
    loyalty_exclude_promos_from_calculation: Optional[bool] = None
    auto_badges_enabled: Optional[bool] = None
    enable_delivery: Optional[bool] = None
    enable_takeaway: Optional[bool] = None
    enable_onsite: Optional[bool] = None
    is_paused: Optional[bool] = None
    pause_message: Optional[str] = None
    preparation_time_minutes: Optional[int] = None
    order_cutoff_minutes: Optional[int] = None
    openai_api_key: Optional[str] = None
    admin_pin: Optional[str] = None
    pin_orders_mode: Optional[str] = None
    pin_delivery_mode: Optional[str] = None

@router.get("")
def get_settings():
    try:
        doc_ref = db.collection('settings').document('restaurant')
        doc = doc_ref.get()
        if not doc.exists:
            return {"settings": {}}
        settings = doc.to_dict()
        if settings.get('updated_at') and hasattr(settings['updated_at'], 'isoformat'):
            settings['updated_at'] = settings['updated_at'].isoformat()
        return {"settings": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("")
def update_settings(settings: SettingsUpdate):
    try:
        doc_ref = db.collection('settings').document('restaurant')
        update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        result = updated_doc.to_dict()
        return {"success": True, "settings": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hours")
def get_hours():
    try:
        doc_ref = db.collection('settings').document('restaurant')
        doc = doc_ref.get()
        if not doc.exists:
            return {"opening_hours": {}, "order_hours": {}}
        data = doc.to_dict()
        return {
            "opening_hours": data.get('opening_hours', {}),
            "order_hours": data.get('order_hours', {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/hours")
def update_hours(opening_hours: Dict[str, Any] = None, order_hours: Dict[str, Any] = None):
    try:
        doc_ref = db.collection('settings').document('restaurant')
        update_data = {'updated_at': datetime.now(timezone.utc)}
        if opening_hours:
            update_data['opening_hours'] = opening_hours
        if order_hours:
            update_data['order_hours'] = order_hours
        doc_ref.update(update_data)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/pause")
def toggle_pause(is_paused: bool, message: str = None):
    try:
        doc_ref = db.collection('settings').document('restaurant')
        update_data = {
            'is_paused': is_paused,
            'pause_message': message,
            'updated_at': datetime.now(timezone.utc)
        }
        doc_ref.update(update_data)
        return {"success": True, "is_paused": is_paused}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

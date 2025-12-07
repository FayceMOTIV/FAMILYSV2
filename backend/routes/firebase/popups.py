"""
Routes Popups - Firebase/Firestore
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/popups", tags=["firebase-popups"])

class PopupCreate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    image_url: Optional[str] = None
    link_type: str = "none"
    link_value: Optional[str] = None
    display_frequency: str = "once"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    priority: int = 0
    is_active: bool = True

class PopupUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    image_url: Optional[str] = None
    link_type: Optional[str] = None
    link_value: Optional[str] = None
    display_frequency: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    priority: Optional[int] = None
    is_active: Optional[bool] = None

@router.get("")
def get_popups():
    try:
        docs = db.collection('popups').stream()
        popups = []
        for doc in docs:
            popup = doc.to_dict()
            popup['id'] = doc.id
            for field in ['created_at', 'updated_at']:
                if popup.get(field) and hasattr(popup[field], 'isoformat'):
                    popup[field] = popup[field].isoformat()
            popups.append(popup)
        popups.sort(key=lambda x: x.get('priority', 0), reverse=True)
        return {"popups": popups}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active")
def get_active_popups():
    try:
        query = db.collection('popups').where('is_active', '==', True)
        docs = query.stream()
        popups = []
        now = datetime.now(timezone.utc)
        for doc in docs:
            popup = doc.to_dict()
            popup['id'] = doc.id
            try:
                if popup.get('start_date') and popup.get('end_date'):
                    start = datetime.fromisoformat(popup['start_date'].replace('Z', '+00:00'))
                    end = datetime.fromisoformat(popup['end_date'].replace('Z', '+00:00'))
                    if start <= now <= end:
                        popups.append(popup)
                else:
                    popups.append(popup)
            except:
                popups.append(popup)
        popups.sort(key=lambda x: x.get('priority', 0), reverse=True)
        return {"popups": popups}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_popup(popup: PopupCreate):
    try:
        now = datetime.now(timezone.utc)
        data = popup.model_dump()
        data['created_at'] = now
        data['updated_at'] = now
        doc_ref = db.collection('popups').document()
        doc_ref.set(data)
        data['id'] = doc_ref.id
        data['created_at'] = now.isoformat()
        data['updated_at'] = now.isoformat()
        return {"success": True, "popup": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{popup_id}")
def update_popup(popup_id: str, popup: PopupUpdate):
    try:
        doc_ref = db.collection('popups').document(popup_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Popup non trouvé")
        update_data = {k: v for k, v in popup.model_dump().items() if v is not None}
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        result = updated_doc.to_dict()
        result['id'] = doc_ref.id
        return {"success": True, "popup": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{popup_id}")
def delete_popup(popup_id: str):
    try:
        doc_ref = db.collection('popups').document(popup_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Popup non trouvé")
        doc_ref.delete()
        return {"success": True, "message": "Popup supprimé"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

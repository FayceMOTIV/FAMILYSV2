"""
Routes Choice Library - Firebase/Firestore
Bibliothèque de choix réutilisables pour les options
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/choice-library", tags=["firebase-choice-library"])

class ChoiceCreate(BaseModel):
    name: str
    default_price: float = 0.0
    image_url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None  # Pour grouper: "Boissons", "Sauces", etc.

class ChoiceUpdate(BaseModel):
    name: Optional[str] = None
    default_price: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None

def serialize_choice(doc) -> dict:
    """Convertir un document Firestore en dict serializable"""
    data = doc.to_dict()
    data['id'] = doc.id
    for field in ['created_at', 'updated_at']:
        if data.get(field) and hasattr(data[field], 'isoformat'):
            data[field] = data[field].isoformat()
    return data

@router.get("")
def get_all_choices(category: Optional[str] = None):
    """Récupérer tous les choix de la bibliothèque"""
    try:
        query = db.collection('choice_library')
        if category:
            query = query.where('category', '==', category)
        
        docs = query.stream()
        choices = [serialize_choice(doc) for doc in docs]
        choices.sort(key=lambda x: (x.get('category', ''), x.get('name', '')))
        return {"choices": choices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories")
def get_choice_categories():
    """Récupérer toutes les catégories de choix"""
    try:
        docs = db.collection('choice_library').stream()
        categories = set()
        for doc in docs:
            data = doc.to_dict()
            if data.get('category'):
                categories.add(data['category'])
        return {"categories": sorted(list(categories))}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{choice_id}")
def get_choice(choice_id: str):
    """Récupérer un choix par ID"""
    try:
        doc_ref = db.collection('choice_library').document(choice_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Choix non trouvé")
        return {"choice": serialize_choice(doc)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_choice(choice: ChoiceCreate):
    """Créer un nouveau choix dans la bibliothèque"""
    try:
        now = datetime.now(timezone.utc)
        
        data = {
            "name": choice.name,
            "default_price": choice.default_price,
            "image_url": choice.image_url,
            "description": choice.description,
            "category": choice.category,
            "created_at": now,
            "updated_at": now
        }
        
        doc_ref = db.collection('choice_library').document()
        doc_ref.set(data)
        
        data['id'] = doc_ref.id
        data['created_at'] = now.isoformat()
        data['updated_at'] = now.isoformat()
        
        return {"success": True, "choice": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{choice_id}")
def update_choice(choice_id: str, choice: ChoiceUpdate):
    """Mettre à jour un choix"""
    try:
        doc_ref = db.collection('choice_library').document(choice_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Choix non trouvé")
        
        update_data = {}
        for k, v in choice.model_dump().items():
            if v is not None:
                update_data[k] = v
        
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        
        updated_doc = doc_ref.get()
        return {"success": True, "choice": serialize_choice(updated_doc)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{choice_id}")
def delete_choice(choice_id: str):
    """Supprimer un choix de la bibliothèque"""
    try:
        doc_ref = db.collection('choice_library').document(choice_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Choix non trouvé")
        
        doc_ref.delete()
        return {"success": True, "message": "Choix supprimé"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk")
def create_bulk_choices(choices: List[ChoiceCreate]):
    """Créer plusieurs choix en une fois"""
    try:
        now = datetime.now(timezone.utc)
        created = []
        
        for choice in choices:
            data = {
                "name": choice.name,
                "default_price": choice.default_price,
                "image_url": choice.image_url,
                "description": choice.description,
                "category": choice.category,
                "created_at": now,
                "updated_at": now
            }
            
            doc_ref = db.collection('choice_library').document()
            doc_ref.set(data)
            data['id'] = doc_ref.id
            created.append(data)
        
        return {"success": True, "created": len(created), "choices": created}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

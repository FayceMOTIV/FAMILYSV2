"""
Routes Options - Firebase/Firestore
Options de produits avec sous-options récursives
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime, timezone
import uuid

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/options", tags=["firebase-options"])

# === MODELS ===

class SubOptionChoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float = 0.0
    image_url: Optional[str] = None
    internal_comment: Optional[str] = None
    sub_options: List[Any] = []

class SubOption(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str = "single"
    is_required: bool = False
    choices: List[SubOptionChoice] = []

class OptionChoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: float = 0.0
    image_url: Optional[str] = None
    internal_comment: Optional[str] = None
    sub_options: List[SubOption] = []

class OptionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    internal_comment: Optional[str] = None
    type: str = "single"
    is_required: bool = False
    max_choices: Optional[int] = None
    allow_repeat: bool = False
    price: float = 0.0
    choices: List[OptionChoice] = []
    display_order: int = 0

class OptionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    internal_comment: Optional[str] = None
    type: Optional[str] = None
    is_required: Optional[bool] = None
    max_choices: Optional[int] = None
    allow_repeat: Optional[bool] = None
    price: Optional[float] = None
    choices: Optional[List[OptionChoice]] = None
    display_order: Optional[int] = None

# === HELPERS ===

def serialize_option(doc) -> dict:
    """Convertir un document Firestore en dict serializable"""
    data = doc.to_dict()
    data['id'] = doc.id
    for field in ['created_at', 'updated_at']:
        if data.get(field) and hasattr(data[field], 'isoformat'):
            data[field] = data[field].isoformat()
    return data

# === ROUTES ===

@router.get("")
def get_options():
    """Récupérer toutes les options"""
    try:
        docs = db.collection('options').stream()
        options = [serialize_option(doc) for doc in docs]
        options.sort(key=lambda x: x.get('display_order', 0))
        return {"options": options}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{option_id}")
def get_option(option_id: str):
    """Récupérer une option par ID"""
    try:
        doc_ref = db.collection('options').document(option_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Option non trouvée")
        return {"option": serialize_option(doc)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_option(option: OptionCreate):
    """Créer une nouvelle option"""
    try:
        now = datetime.now(timezone.utc)
        
        # Convertir les choices en dicts
        choices_data = []
        for choice in option.choices:
            choice_dict = choice.model_dump()
            # S'assurer que chaque choice a un ID
            if not choice_dict.get('id'):
                choice_dict['id'] = str(uuid.uuid4())
            choices_data.append(choice_dict)
        
        data = {
            "name": option.name,
            "description": option.description,
            "internal_comment": option.internal_comment,
            "type": option.type,
            "is_required": option.is_required,
            "max_choices": option.max_choices,
            "allow_repeat": option.allow_repeat,
            "price": option.price,
            "choices": choices_data,
            "display_order": option.display_order,
            "created_at": now,
            "updated_at": now
        }
        
        doc_ref = db.collection('options').document()
        doc_ref.set(data)
        
        data['id'] = doc_ref.id
        data['created_at'] = now.isoformat()
        data['updated_at'] = now.isoformat()
        
        return {"success": True, "option": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{option_id}")
def update_option(option_id: str, option: OptionUpdate):
    """Mettre à jour une option"""
    try:
        doc_ref = db.collection('options').document(option_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Option non trouvée")
        
        update_data = {}
        option_dict = option.model_dump()
        
        for k, v in option_dict.items():
            if v is not None:
                if k == 'choices':
                    # Convertir les choices en dicts
                    choices_data = []
                    for choice in v:
                        if isinstance(choice, dict):
                            choice_dict = choice
                        else:
                            choice_dict = choice.model_dump()
                        if not choice_dict.get('id'):
                            choice_dict['id'] = str(uuid.uuid4())
                        choices_data.append(choice_dict)
                    update_data['choices'] = choices_data
                else:
                    update_data[k] = v
        
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        
        updated_doc = doc_ref.get()
        return {"success": True, "option": serialize_option(updated_doc)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{option_id}")
def delete_option(option_id: str):
    """Supprimer une option"""
    try:
        doc_ref = db.collection('options').document(option_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Option non trouvée")
        
        # Vérifier si l'option est utilisée par des produits
        products = db.collection('products').where('option_ids', 'array_contains', option_id).limit(1).stream()
        if len(list(products)) > 0:
            raise HTTPException(
                status_code=400,
                detail="Impossible de supprimer: cette option est utilisée par des produits"
            )
        
        doc_ref.delete()
        return {"success": True, "message": "Option supprimée"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reorder")
def reorder_options(orders: List[dict]):
    """Réordonner les options"""
    try:
        batch = db.batch()
        for item in orders:
            doc_ref = db.collection('options').document(item['id'])
            batch.update(doc_ref, {
                'display_order': item.get('display_order', item.get('order', 0)),
                'updated_at': datetime.now(timezone.utc)
            })
        batch.commit()
        return {"success": True, "message": f"{len(orders)} options réordonnées"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

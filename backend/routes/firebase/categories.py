"""
Routes Categories - Firebase/Firestore
Avec synchronisation automatique des produits lors du renommage
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/categories", tags=["firebase-categories"])

class CategoryCreate(BaseModel):
    name: str
    image: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = 0
    display_order: Optional[int] = 0
    is_active: bool = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

def sync_products_category(old_name: str, new_name: str):
    """Synchronise tous les produits quand une catégorie est renommée"""
    if old_name == new_name:
        return 0
    
    # Chercher tous les produits avec l'ancien nom de catégorie
    products_ref = db.collection('products')
    
    # Chercher par category
    query1 = products_ref.where('category', '==', old_name).stream()
    # Chercher par category_name
    query2 = products_ref.where('category_name', '==', old_name).stream()
    
    updated_ids = set()
    batch = db.batch()
    
    for doc in query1:
        if doc.id not in updated_ids:
            batch.update(doc.reference, {
                'category': new_name,
                'category_name': new_name,
                'updated_at': datetime.now(timezone.utc)
            })
            updated_ids.add(doc.id)
    
    for doc in query2:
        if doc.id not in updated_ids:
            batch.update(doc.reference, {
                'category': new_name,
                'category_name': new_name,
                'updated_at': datetime.now(timezone.utc)
            })
            updated_ids.add(doc.id)
    
    if updated_ids:
        batch.commit()
    
    return len(updated_ids)

@router.get("")
def get_categories():
    try:
        docs = db.collection('categories').stream()
        categories = []
        for doc in docs:
            cat = doc.to_dict()
            cat['id'] = doc.id
            # Normaliser image_url
            if cat.get('image') and not cat.get('image_url'):
                cat['image_url'] = cat['image']
            elif cat.get('image_url') and not cat.get('image'):
                cat['image'] = cat['image_url']
            for field in ['created_at', 'updated_at']:
                if cat.get(field) and hasattr(cat[field], 'isoformat'):
                    cat[field] = cat[field].isoformat()
            categories.append(cat)
        categories.sort(key=lambda x: x.get('display_order', x.get('order', 0)))
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{category_id}")
def get_category(category_id: str):
    try:
        doc_ref = db.collection('categories').document(category_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Catégorie non trouvée")
        cat = doc.to_dict()
        cat['id'] = doc.id
        return {"category": cat}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate):
    try:
        now = datetime.now(timezone.utc)
        
        # Normaliser image
        image = category.image or category.image_url or ""
        
        # Normaliser order
        display_order = category.display_order or category.order or 0
        
        data = {
            "name": category.name,
            "image": image,
            "image_url": image,
            "icon": category.icon or "",
            "display_order": display_order,
            "order": display_order,
            "is_active": category.is_active,
            "created_at": now,
            "updated_at": now
        }
        doc_ref = db.collection('categories').document()
        doc_ref.set(data)
        data['id'] = doc_ref.id
        data['created_at'] = now.isoformat()
        data['updated_at'] = now.isoformat()
        return {"success": True, "category": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{category_id}")
def update_category(category_id: str, category: CategoryUpdate):
    try:
        doc_ref = db.collection('categories').document(category_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Catégorie non trouvée")
        
        current_data = doc.to_dict()
        old_name = current_data.get('name')
        
        update_data = {}
        category_dict = category.model_dump()
        
        for k, v in category_dict.items():
            if v is not None:
                update_data[k] = v
        
        # Normaliser image
        if 'image' in update_data or 'image_url' in update_data:
            img = update_data.get('image') or update_data.get('image_url')
            update_data['image'] = img
            update_data['image_url'] = img
        
        # Normaliser order
        if 'order' in update_data or 'display_order' in update_data:
            order = update_data.get('display_order') or update_data.get('order')
            update_data['order'] = order
            update_data['display_order'] = order
            
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        
        # 🔄 SYNC: Si le nom a changé, mettre à jour tous les produits
        products_updated = 0
        new_name = update_data.get('name')
        if new_name and old_name and new_name != old_name:
            products_updated = sync_products_category(old_name, new_name)
        
        updated_doc = doc_ref.get()
        cat = updated_doc.to_dict()
        cat['id'] = doc_ref.id
        for field in ['created_at', 'updated_at']:
            if cat.get(field) and hasattr(cat[field], 'isoformat'):
                cat[field] = cat[field].isoformat()
        
        return {
            "success": True, 
            "category": cat,
            "products_updated": products_updated,
            "message": f"Catégorie mise à jour. {products_updated} produit(s) synchronisé(s)." if products_updated else "Catégorie mise à jour."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{category_id}")
def delete_category(category_id: str):
    try:
        doc_ref = db.collection('categories').document(category_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Catégorie non trouvée")
        
        # Vérifier s'il y a des produits dans cette catégorie
        cat_name = doc.to_dict().get('name')
        products = db.collection('products').where('category', '==', cat_name).limit(1).stream()
        product_count = len(list(products))
        
        if product_count > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Impossible de supprimer: {product_count}+ produit(s) dans cette catégorie"
            )
        
        doc_ref.delete()
        return {"success": True, "message": "Catégorie supprimée"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reorder")
def reorder_categories(orders: List[dict]):
    try:
        batch = db.batch()
        for item in orders:
            doc_ref = db.collection('categories').document(item['id'])
            batch.update(doc_ref, {
                'display_order': item.get('display_order', item.get('order', 0)),
                'order': item.get('display_order', item.get('order', 0)),
                'updated_at': datetime.now(timezone.utc)
            })
        batch.commit()
        return {"success": True, "message": f"{len(orders)} catégories réordonnées"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

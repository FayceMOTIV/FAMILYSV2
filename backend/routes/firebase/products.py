"""
Routes Products - Firebase/Firestore
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, timezone

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/products", tags=["firebase-products"])

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None  # Nom de la catégorie (depuis frontend)
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    base_price: float
    vat_rate: Optional[float] = 10.0
    image: Optional[str] = None
    image_url: Optional[str] = None  # Depuis frontend
    is_available: bool = True
    is_out_of_stock: bool = False
    out_of_stock_until: Optional[str] = None
    display_order: int = 0
    tags: List[str] = []
    badge: Optional[str] = None
    option_ids: List[str] = []  # IDs des options
    option_groups: List[Any] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    base_price: Optional[float] = None
    vat_rate: Optional[float] = None
    image: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_out_of_stock: Optional[bool] = None
    out_of_stock_until: Optional[str] = None
    display_order: Optional[int] = None
    tags: Optional[List[str]] = None
    badge: Optional[str] = None
    option_ids: Optional[List[str]] = None
    option_groups: Optional[List[Any]] = None

@router.get("")
def get_products(category_id: Optional[str] = None, category: Optional[str] = None):
    try:
        query = db.collection('products')
        if category_id:
            query = query.where('category_id', '==', category_id)
        elif category:
            query = query.where('category', '==', category)
        
        docs = query.stream()
        products = []
        for doc in docs:
            prod = doc.to_dict()
            prod['id'] = doc.id
            for field in ['created_at', 'updated_at']:
                if prod.get(field) and hasattr(prod[field], 'isoformat'):
                    prod[field] = prod[field].isoformat()
            products.append(prod)
        products.sort(key=lambda x: x.get('display_order', 0))
        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}")
def get_product(product_id: str):
    try:
        doc_ref = db.collection('products').document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        prod = doc.to_dict()
        prod['id'] = doc.id
        return {"product": prod}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate):
    try:
        now = datetime.now(timezone.utc)
        
        # Normaliser image (accepter image ou image_url)
        image = product.image_url or product.image
        
        # Normaliser category
        category = product.category or product.category_name
        
        data = {
            "name": product.name,
            "description": product.description,
            "category": category,
            "category_id": product.category_id,
            "category_name": category,
            "base_price": product.base_price,
            "vat_rate": product.vat_rate or 10.0,
            "image": image,
            "image_url": image,
            "is_available": product.is_available,
            "is_out_of_stock": product.is_out_of_stock,
            "out_of_stock_until": product.out_of_stock_until,
            "display_order": product.display_order,
            "tags": product.tags,
            "badge": product.badge,
            "option_ids": product.option_ids,
            "option_groups": product.option_groups,
            "created_at": now,
            "updated_at": now
        }
        doc_ref = db.collection('products').document()
        doc_ref.set(data)
        data['id'] = doc_ref.id
        data['created_at'] = now.isoformat()
        data['updated_at'] = now.isoformat()
        return {"success": True, "product": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{product_id}")
def update_product(product_id: str, product: ProductUpdate):
    try:
        doc_ref = db.collection('products').document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        update_data = {}
        product_dict = product.model_dump()
        
        for k, v in product_dict.items():
            if v is not None:
                update_data[k] = v
        
        # Normaliser image
        if 'image_url' in update_data:
            update_data['image'] = update_data['image_url']
        elif 'image' in update_data:
            update_data['image_url'] = update_data['image']
            
        # Normaliser category
        if 'category' in update_data:
            update_data['category_name'] = update_data['category']
        
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        
        updated_doc = doc_ref.get()
        prod = updated_doc.to_dict()
        prod['id'] = doc_ref.id
        for field in ['created_at', 'updated_at']:
            if prod.get(field) and hasattr(prod[field], 'isoformat'):
                prod[field] = prod[field].isoformat()
        return {"success": True, "product": prod}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{product_id}")
def delete_product(product_id: str):
    try:
        doc_ref = db.collection('products').document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        doc_ref.delete()
        return {"success": True, "message": "Produit supprimé"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{product_id}/stock")
def toggle_stock(product_id: str, is_out_of_stock: bool):
    try:
        doc_ref = db.collection('products').document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        doc_ref.update({
            'is_out_of_stock': is_out_of_stock,
            'updated_at': datetime.now(timezone.utc)
        })
        return {"success": True, "is_out_of_stock": is_out_of_stock}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{product_id}/availability")
def toggle_availability(product_id: str, is_available: bool):
    try:
        doc_ref = db.collection('products').document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        doc_ref.update({
            'is_available': is_available,
            'updated_at': datetime.now(timezone.utc)
        })
        return {"success": True, "is_available": is_available}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

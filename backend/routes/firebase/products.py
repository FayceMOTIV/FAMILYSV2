"""
Routes Products - Firebase/Firestore
Avec enrichissement des promotions actives
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
    category: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    base_price: float
    vat_rate: Optional[float] = 10.0
    image: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool = True
    is_out_of_stock: bool = False
    out_of_stock_until: Optional[str] = None
    display_order: int = 0
    tags: List[str] = []
    badge: Optional[str] = None
    option_ids: List[str] = []
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


def get_active_promotions():
    """Récupère toutes les promotions actives"""
    try:
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        promos_ref = db.collection("promotions")
        all_promos = promos_ref.where("is_active", "==", True).stream()
        
        active_promos = []
        for doc in all_promos:
            promo = doc.to_dict()
            promo['id'] = doc.id
            
            # Vérifier les dates
            start_date = promo.get('start_date', '')
            end_date = promo.get('end_date', '')
            
            if start_date and start_date > today:
                continue
            if end_date and end_date < today:
                continue
            
            active_promos.append(promo)
        
        return active_promos
    except Exception as e:
        print(f"Erreur récupération promos: {e}")
        return []


def enrich_product_with_promotions(product: dict, active_promos: list) -> dict:
    """Enrichit un produit avec ses promotions actives"""
    product_id = product.get('id', '')
    category = product.get('category', '') or product.get('category_name', '')
    category_id = product.get('category_id', '')
    base_price = float(product.get('base_price', 0))
    
    applicable_promos = []
    best_discount = 0
    promo_price = base_price
    
    for promo in active_promos:
        applies_to = promo.get('applies_to', 'all')
        product_ids = promo.get('product_ids', []) or []
        category_ids = promo.get('category_ids', []) or []
        promo_type = promo.get('type', '')
        discount_value = float(promo.get('discount_value', 0))
        
        # Vérifier si la promo s'applique à ce produit
        applies = False
        
        if applies_to == 'all':
            applies = True
        elif applies_to == 'specific_products' and product_id in product_ids:
            applies = True
        elif applies_to == 'specific_categories':
            if category_id in category_ids or category in category_ids:
                applies = True
        
        if applies:
            # Calculer la réduction
            discount = 0
            if promo_type in ['percentage', 'conditional_discount']:
                discount = base_price * (discount_value / 100)
            elif promo_type == 'fixed_amount':
                discount = discount_value
            
            if discount > 0:
                applicable_promos.append({
                    'id': promo.get('id'),
                    'name': promo.get('name', ''),
                    'type': promo_type,
                    'badge_text': promo.get('badge_text', f'-{int(discount_value)}%'),
                    'badge_color': promo.get('badge_color', '#FF6B35'),
                    'discount_value': discount_value,
                    'discount_amount': round(discount, 2)
                })
                
                if discount > best_discount:
                    best_discount = discount
    
    # Appliquer la meilleure réduction
    if best_discount > 0:
        promo_price = max(0, base_price - best_discount)
    
    # Enrichir le produit
    product['active_promotions'] = applicable_promos
    product['promo_price'] = round(promo_price, 2) if best_discount > 0 else None
    product['final_price'] = round(promo_price, 2)
    product['original_price'] = base_price
    product['has_promotion'] = len(applicable_promos) > 0
    
    return product


@router.get("")
def get_products(category_id: Optional[str] = None, category: Optional[str] = None):
    try:
        query = db.collection('products')
        if category_id:
            query = query.where('category_id', '==', category_id)
        elif category:
            query = query.where('category', '==', category)
        
        docs = query.stream()
        
        # Récupérer les promos actives une seule fois
        active_promos = get_active_promotions()
        
        products = []
        for doc in docs:
            prod = doc.to_dict()
            prod['id'] = doc.id
            for field in ['created_at', 'updated_at']:
                if prod.get(field) and hasattr(prod[field], 'isoformat'):
                    prod[field] = prod[field].isoformat()
            
            # Enrichir avec les promos
            prod = enrich_product_with_promotions(prod, active_promos)
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
        for field in ['created_at', 'updated_at']:
            if prod.get(field) and hasattr(prod[field], 'isoformat'):
                prod[field] = prod[field].isoformat()
        
        # Enrichir avec les promos
        active_promos = get_active_promotions()
        prod = enrich_product_with_promotions(prod, active_promos)
        
        return {"product": prod}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
def create_product(product: ProductCreate):
    try:
        data = product.model_dump()
        # Normaliser image
        if data.get('image_url') and not data.get('image'):
            data['image'] = data['image_url']
        if data.get('image') and not data.get('image_url'):
            data['image_url'] = data['image']
        # Normaliser category
        if data.get('category') and not data.get('category_name'):
            data['category_name'] = data['category']
        
        data['created_at'] = datetime.now(timezone.utc)
        data['updated_at'] = datetime.now(timezone.utc)
        
        doc_ref = db.collection('products').add(data)
        new_id = doc_ref[1].id
        
        return {"success": True, "id": new_id, "product": {**data, "id": new_id}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{product_id}")
def update_product(product_id: str, product: ProductUpdate):
    try:
        doc_ref = db.collection('products').document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Produit non trouvé")
        
        update_data = {k: v for k, v in product.model_dump().items() if v is not None}
        # Normaliser
        if update_data.get('image_url') and 'image' not in update_data:
            update_data['image'] = update_data['image_url']
        if update_data.get('image') and 'image_url' not in update_data:
            update_data['image_url'] = update_data['image']
        if update_data.get('category') and 'category_name' not in update_data:
            update_data['category_name'] = update_data['category']
        
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        
        updated = doc_ref.get().to_dict()
        updated['id'] = product_id
        return {"success": True, "product": updated}
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

"""
Routes Customers - Firebase/Firestore
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/customers", tags=["firebase-customers"])

class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    loyalty_balance: Optional[float] = None
    is_blocked: Optional[bool] = None
    notes: Optional[str] = None

@router.get("")
def get_customers(limit: int = 100):
    try:
        query = db.collection('customers').order_by('created_at', direction='DESCENDING').limit(limit)
        docs = query.stream()
        customers = []
        for doc in docs:
            customer = doc.to_dict()
            customer['id'] = doc.id
            customer['uid'] = doc.id
            for field in ['created_at', 'updated_at', 'last_order_at']:
                if customer.get(field) and hasattr(customer[field], 'isoformat'):
                    customer[field] = customer[field].isoformat()
            customers.append(customer)
        return {"customers": customers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{customer_id}")
def get_customer(customer_id: str):
    try:
        doc_ref = db.collection('customers').document(customer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Client non trouvé")
        customer = doc.to_dict()
        customer['id'] = doc.id
        customer['uid'] = doc.id
        return {"customer": customer}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{customer_id}")
def update_customer(customer_id: str, customer: CustomerUpdate):
    try:
        doc_ref = db.collection('customers').document(customer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Client non trouvé")
        update_data = {k: v for k, v in customer.model_dump().items() if v is not None}
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        updated_doc = doc_ref.get()
        result = updated_doc.to_dict()
        result['id'] = doc_ref.id
        return {"success": True, "customer": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{customer_id}/orders")
def get_customer_orders(customer_id: str, limit: int = 20):
    try:
        query = db.collection('orders').where('customer_uid', '==', customer_id).order_by('created_at', direction='DESCENDING').limit(limit)
        docs = query.stream()
        orders = []
        for doc in docs:
            order = doc.to_dict()
            order['id'] = doc.id
            for field in ['created_at', 'updated_at']:
                if order.get(field) and hasattr(order[field], 'isoformat'):
                    order[field] = order[field].isoformat()
            orders.append(order)
        return {"orders": orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{customer_id}/loyalty/add")
def add_loyalty(customer_id: str, amount: float, reason: str = "Manuel"):
    try:
        doc_ref = db.collection('customers').document(customer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Client non trouvé")
        current = doc.to_dict()
        new_balance = current.get('loyalty_balance', 0) + amount
        doc_ref.update({
            'loyalty_balance': new_balance,
            'updated_at': datetime.now(timezone.utc)
        })
        # Log transaction
        db.collection('loyalty_transactions').add({
            'customer_uid': customer_id,
            'amount': amount,
            'type': 'credit',
            'reason': reason,
            'balance_after': new_balance,
            'created_at': datetime.now(timezone.utc)
        })
        return {"success": True, "new_balance": new_balance}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{customer_id}/loyalty/deduct")
def deduct_loyalty(customer_id: str, amount: float, reason: str = "Utilisation"):
    try:
        doc_ref = db.collection('customers').document(customer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Client non trouvé")
        current = doc.to_dict()
        current_balance = current.get('loyalty_balance', 0)
        if amount > current_balance:
            raise HTTPException(status_code=400, detail="Solde insuffisant")
        new_balance = current_balance - amount
        doc_ref.update({
            'loyalty_balance': new_balance,
            'updated_at': datetime.now(timezone.utc)
        })
        # Log transaction
        db.collection('loyalty_transactions').add({
            'customer_uid': customer_id,
            'amount': -amount,
            'type': 'debit',
            'reason': reason,
            'balance_after': new_balance,
            'created_at': datetime.now(timezone.utc)
        })
        return {"success": True, "new_balance": new_balance}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{customer_id}/block")
def toggle_block(customer_id: str, is_blocked: bool):
    try:
        doc_ref = db.collection('customers').document(customer_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Client non trouvé")
        doc_ref.update({
            'is_blocked': is_blocked,
            'updated_at': datetime.now(timezone.utc)
        })
        return {"success": True, "is_blocked": is_blocked}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

"""
Routes Orders - Firebase/Firestore
Avec notifications automatiques selon le statut
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/orders", tags=["firebase-orders"])

# Messages de notification chaleureux
ORDER_STATUS_MESSAGES = {
    "new": ("Merci ! 🙏", "Votre commande #{order_number} est bien reçue ! Notre équipe s'en occupe avec plaisir."),
    "in_preparation": ("C'est parti ! 👨‍🍳", "Bonne nouvelle ! Votre commande #{order_number} est en cuisine. Ça sent déjà bon !"),
    "ready": ("C'est prêt ! 🎉", "Votre commande #{order_number} vous attend ! On a hâte de vous voir."),
    "delivering": ("En route ! 🛵", "Votre commande #{order_number} arrive bientôt chez vous. Bon appétit en avance !"),
    "delivered": ("Bon appétit ! 😋", "Votre commande #{order_number} est arrivée ! Régalez-vous bien."),
    "completed": ("À très vite ! 💚", "Merci pour votre commande #{order_number} ! On espère vous revoir bientôt chez Le Family's."),
    "cancelled": ("Commande annulée 😔", "Votre commande #{order_number} a été annulée. N'hésitez pas à nous contacter."),
}

DELIVERY_STATUSES = ["delivering", "delivered"]

def get_settings():
    try:
        doc = db.collection('settings').document('restaurant').get()
        return doc.to_dict() if doc.exists else {}
    except:
        return {}

def send_order_notification(order_id: str, new_status: str, customer_uid: str, order_number: str, order_type: str = "takeaway"):
    try:
        if new_status in DELIVERY_STATUSES:
            settings = get_settings()
            if not settings.get('enable_delivery', False):
                return False
        
        if new_status == "ready" and order_type == "delivery":
            title = "C'est prêt ! 🎉"
            body = f"Votre commande #{order_number} est prête et part bientôt en livraison !"
        elif new_status in ORDER_STATUS_MESSAGES:
            title, body_template = ORDER_STATUS_MESSAGES[new_status]
            body = body_template.format(order_number=order_number)
        else:
            return False
        
        now = datetime.now(timezone.utc)
        
        db.collection('customer_notifications').add({
            "customer_uid": customer_uid,
            "order_id": order_id,
            "order_number": order_number,
            "title": title,
            "body": body,
            "type": "order_status",
            "status": new_status,
            "read": False,
            "created_at": now
        })
        
        try:
            from firebase_admin import messaging
            customer_doc = db.collection('customers').document(customer_uid).get()
            if customer_doc.exists:
                customer_data = customer_doc.to_dict()
                fcm_token = customer_data.get('fcm_token') or customer_data.get('push_token')
                if fcm_token:
                    message = messaging.Message(
                        notification=messaging.Notification(title=title, body=body),
                        data={"type": "order_status", "order_id": order_id, "status": new_status, "order_number": order_number},
                        token=fcm_token,
                    )
                    messaging.send(message)
        except Exception as e:
            print(f"Push error: {e}")
        
        return True
    except Exception as e:
        print(f"Notification error: {e}")
        return False

class OrderCreate(BaseModel):
    customer_uid: str
    customer_name: str
    customer_phone: str
    items: List[Dict[str, Any]]
    subtotal: float
    total: float
    order_type: str = "takeaway"
    payment_method: str = "cash"
    delivery_address: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    promotions_applied: List[Dict[str, Any]] = []
    loyalty_used: float = 0
    loyalty_earned: float = 0

class OrderStatusUpdate(BaseModel):
    status: str

@router.get("")
def get_orders(status: Optional[str] = None, limit: int = 50):
    try:
        query = db.collection('orders')
        if status:
            query = query.where('status', '==', status)
        query = query.order_by('created_at', direction='DESCENDING').limit(limit)
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

@router.get("/active")
def get_active_orders():
    try:
        active_statuses = ['new', 'in_preparation', 'ready', 'delivering']
        all_orders = []
        for st in active_statuses:
            docs = db.collection('orders').where('status', '==', st).stream()
            for doc in docs:
                order = doc.to_dict()
                order['id'] = doc.id
                for field in ['created_at', 'updated_at']:
                    if order.get(field) and hasattr(order[field], 'isoformat'):
                        order[field] = order[field].isoformat()
                all_orders.append(order)
        all_orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return {"orders": all_orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/today")
def get_today_orders():
    try:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        docs = db.collection('orders').where('created_at', '>=', today_start).order_by('created_at', direction='DESCENDING').stream()
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

@router.get("/{order_id}")
def get_order(order_id: str):
    try:
        doc = db.collection('orders').document(order_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        order = doc.to_dict()
        order['id'] = doc.id
        for field in ['created_at', 'updated_at']:
            if order.get(field) and hasattr(order[field], 'isoformat'):
                order[field] = order[field].isoformat()
        return {"order": order}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_order(order: OrderCreate):
    try:
        now = datetime.now(timezone.utc)
        today = now.strftime('%Y%m%d')
        count = len(list(db.collection('orders').where('order_date', '==', today).stream())) + 1
        order_number = f"FAM-{today[-4:]}-{count:03d}"
        
        data = order.model_dump()
        data['order_number'] = order_number
        data['order_date'] = today
        data['status'] = 'new'
        data['status_history'] = [{'status': 'new', 'at': now.isoformat(), 'by': 'system'}]
        data['created_at'] = now
        data['updated_at'] = now
        
        doc_ref = db.collection('orders').document()
        doc_ref.set(data)
        
        if order.customer_uid:
            customer_ref = db.collection('customers').document(order.customer_uid)
            customer_doc = customer_ref.get()
            if customer_doc.exists:
                cd = customer_doc.to_dict()
                customer_ref.update({
                    'order_count': cd.get('order_count', 0) + 1,
                    'total_spent': cd.get('total_spent', 0) + order.total,
                    'loyalty_balance': cd.get('loyalty_balance', 0) + order.loyalty_earned - order.loyalty_used,
                    'last_order_at': now,
                    'updated_at': now
                })
            
            send_order_notification(doc_ref.id, 'new', order.customer_uid, order_number, order.order_type)
        
        data['id'] = doc_ref.id
        data['created_at'] = now.isoformat()
        data['updated_at'] = now.isoformat()
        return {"success": True, "order": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{order_id}/status")
def update_order_status(order_id: str, status_update: OrderStatusUpdate):
    try:
        doc_ref = db.collection('orders').document(order_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        
        current = doc.to_dict()
        now = datetime.now(timezone.utc)
        
        history = current.get('status_history', [])
        history.append({'status': status_update.status, 'at': now.isoformat(), 'by': 'admin'})
        
        doc_ref.update({'status': status_update.status, 'status_history': history, 'updated_at': now})
        
        notif_sent = False
        if current.get('customer_uid'):
            notif_sent = send_order_notification(
                order_id, status_update.status, current['customer_uid'],
                current.get('order_number', order_id[:8]), current.get('order_type', 'takeaway')
            )
        
        return {"success": True, "status": status_update.status, "notification_sent": notif_sent}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{order_id}/cancel")
def cancel_order(order_id: str, reason: str = "Annulé par le restaurant"):
    try:
        doc_ref = db.collection('orders').document(order_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        
        current = doc.to_dict()
        now = datetime.now(timezone.utc)
        
        history = current.get('status_history', [])
        history.append({'status': 'cancelled', 'at': now.isoformat(), 'by': 'admin', 'reason': reason})
        
        doc_ref.update({'status': 'cancelled', 'cancel_reason': reason, 'status_history': history, 'updated_at': now})
        
        if current.get('loyalty_used', 0) > 0 and current.get('customer_uid'):
            cust_ref = db.collection('customers').document(current['customer_uid'])
            cust_doc = cust_ref.get()
            if cust_doc.exists:
                cust_ref.update({'loyalty_balance': cust_doc.to_dict().get('loyalty_balance', 0) + current['loyalty_used'], 'updated_at': now})
        
        if current.get('customer_uid'):
            send_order_notification(order_id, 'cancelled', current['customer_uid'], current.get('order_number', order_id[:8]), current.get('order_type', 'takeaway'))
        
        return {"success": True, "message": "Commande annulée"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/today")
def get_today_stats():
    try:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        docs = list(db.collection('orders').where('created_at', '>=', today_start).stream())
        
        total_orders = len(docs)
        total_revenue = sum(d.to_dict().get('total', 0) for d in docs if d.to_dict().get('status') not in ['cancelled'])
        completed = sum(1 for d in docs if d.to_dict().get('status') == 'completed')
        
        return {
            "total_orders": total_orders,
            "completed_orders": completed,
            "total_revenue": round(total_revenue, 2),
            "average_order": round(total_revenue / total_orders, 2) if total_orders > 0 else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

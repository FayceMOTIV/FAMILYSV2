"""
Routes Notifications - Firebase/Firestore
Notifications push automatiques et marketing
"""
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db
import firebase_admin
from firebase_admin import messaging

router = APIRouter(prefix="/notifications", tags=["firebase-notifications"])

# Messages de statut de commande
ORDER_STATUS_MESSAGES = {
    "pending": ("Commande reçue ✅", "Votre commande #{order_number} a été reçue et est en attente de confirmation."),
    "confirmed": ("Commande confirmée 👨‍🍳", "Votre commande #{order_number} est confirmée et en préparation !"),
    "preparing": ("En préparation 🍳", "Votre commande #{order_number} est en cours de préparation."),
    "ready": ("Commande prête ! 🎉", "Votre commande #{order_number} est prête ! Venez la récupérer."),
    "delivering": ("En livraison 🚗", "Votre commande #{order_number} est en route !"),
    "delivered": ("Livrée ✅", "Votre commande #{order_number} a été livrée. Bon appétit !"),
    "completed": ("Terminée ✅", "Merci pour votre commande #{order_number} ! À bientôt !"),
    "cancelled": ("Annulée ❌", "Votre commande #{order_number} a été annulée."),
}

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "marketing"
    target: str = "all"
    target_ids: List[str] = []
    scheduled_at: Optional[str] = None
    image_url: Optional[str] = None

class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    type: Optional[str] = None
    target: Optional[str] = None
    target_ids: Optional[List[str]] = None
    scheduled_at: Optional[str] = None
    image_url: Optional[str] = None

def serialize_notification(doc) -> dict:
    data = doc.to_dict()
    data['id'] = doc.id
    for field in ['created_at', 'updated_at', 'sent_at', 'scheduled_at']:
        if data.get(field) and hasattr(data[field], 'isoformat'):
            data[field] = data[field].isoformat()
    return data

def send_push_to_customer(customer_uid: str, title: str, body: str, data: dict = None):
    """Envoyer une notification push à un client via FCM"""
    try:
        # Récupérer le token FCM du client
        customer_doc = db.collection('customers').document(customer_uid).get()
        if not customer_doc.exists:
            print(f"Customer {customer_uid} not found")
            return False
        
        customer_data = customer_doc.to_dict()
        fcm_token = customer_data.get('fcm_token') or customer_data.get('push_token')
        
        if not fcm_token:
            print(f"No FCM token for customer {customer_uid}")
            return False
        
        # Créer le message FCM
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=fcm_token,
        )
        
        # Envoyer
        response = messaging.send(message)
        print(f"Push sent to {customer_uid}: {response}")
        return True
        
    except Exception as e:
        print(f"Error sending push to {customer_uid}: {e}")
        return False

def send_order_status_notification(order_id: str, new_status: str, customer_uid: str, order_number: str = None):
    """Envoyer une notification de changement de statut de commande"""
    try:
        if new_status not in ORDER_STATUS_MESSAGES:
            return False
        
        title, body_template = ORDER_STATUS_MESSAGES[new_status]
        body = body_template.format(order_number=order_number or order_id[:8])
        
        # Envoyer la push notification
        send_push_to_customer(
            customer_uid=customer_uid,
            title=title,
            body=body,
            data={
                "type": "order_status",
                "order_id": order_id,
                "status": new_status
            }
        )
        
        # Sauvegarder dans l'historique des notifications du client
        now = datetime.now(timezone.utc)
        db.collection('customer_notifications').add({
            "customer_uid": customer_uid,
            "order_id": order_id,
            "title": title,
            "body": body,
            "type": "order_status",
            "status": new_status,
            "read": False,
            "created_at": now
        })
        
        return True
    except Exception as e:
        print(f"Error sending order notification: {e}")
        return False

# === ROUTES ADMIN ===

@router.get("")
def get_all_notifications():
    """Récupérer toutes les notifications marketing"""
    try:
        docs = db.collection('admin_notifications').stream()
        notifications = [serialize_notification(doc) for doc in docs]
        notifications.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return {"notifications": notifications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{notif_id}")
def get_notification(notif_id: str):
    """Récupérer une notification par ID"""
    try:
        doc_ref = db.collection('admin_notifications').document(notif_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Notification non trouvée")
        return {"notification": serialize_notification(doc)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
def create_notification(notif: NotificationCreate):
    """Créer une nouvelle notification marketing"""
    try:
        now = datetime.now(timezone.utc)
        
        data = {
            "title": notif.title,
            "message": notif.message,
            "type": notif.type,
            "target": notif.target,
            "target_ids": notif.target_ids,
            "scheduled_at": notif.scheduled_at,
            "image_url": notif.image_url,
            "status": "draft",
            "sent_count": 0,
            "created_at": now,
            "updated_at": now
        }
        
        doc_ref = db.collection('admin_notifications').document()
        doc_ref.set(data)
        
        data['id'] = doc_ref.id
        data['created_at'] = now.isoformat()
        data['updated_at'] = now.isoformat()
        
        return {"success": True, "notification": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{notif_id}")
def update_notification(notif_id: str, notif: NotificationUpdate):
    """Mettre à jour une notification"""
    try:
        doc_ref = db.collection('admin_notifications').document(notif_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Notification non trouvée")
        
        update_data = {k: v for k, v in notif.model_dump().items() if v is not None}
        update_data['updated_at'] = datetime.now(timezone.utc)
        doc_ref.update(update_data)
        
        updated_doc = doc_ref.get()
        return {"success": True, "notification": serialize_notification(updated_doc)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{notif_id}")
def delete_notification(notif_id: str):
    """Supprimer une notification"""
    try:
        doc_ref = db.collection('admin_notifications').document(notif_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Notification non trouvée")
        doc_ref.delete()
        return {"success": True, "message": "Notification supprimée"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{notif_id}/send")
def send_notification(notif_id: str):
    """Envoyer une notification marketing à tous les clients"""
    try:
        doc_ref = db.collection('admin_notifications').document(notif_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Notification non trouvée")
        
        notif_data = doc.to_dict()
        now = datetime.now(timezone.utc)
        sent_count = 0
        
        # Récupérer tous les clients avec un token FCM
        customers = db.collection('customers').stream()
        for customer in customers:
            customer_data = customer.to_dict()
            fcm_token = customer_data.get('fcm_token') or customer_data.get('push_token')
            if fcm_token:
                try:
                    message = messaging.Message(
                        notification=messaging.Notification(
                            title=notif_data['title'],
                            body=notif_data['message'],
                        ),
                        token=fcm_token,
                    )
                    messaging.send(message)
                    sent_count += 1
                except Exception as e:
                    print(f"Failed to send to {customer.id}: {e}")
        
        doc_ref.update({
            "status": "sent",
            "sent_at": now,
            "sent_count": sent_count,
            "updated_at": now
        })
        
        return {"success": True, "message": f"Notification envoyée à {sent_count} clients"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === ROUTES CLIENT ===

@router.get("/customer/{customer_uid}")
def get_customer_notifications(customer_uid: str, limit: int = 20):
    """Récupérer les notifications d'un client"""
    try:
        docs = db.collection('customer_notifications')\
            .where('customer_uid', '==', customer_uid)\
            .order_by('created_at', direction='DESCENDING')\
            .limit(limit)\
            .stream()
        
        notifications = [serialize_notification(doc) for doc in docs]
        return {"notifications": notifications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/customer/{notif_id}/read")
def mark_notification_read(notif_id: str):
    """Marquer une notification comme lue"""
    try:
        doc_ref = db.collection('customer_notifications').document(notif_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Notification non trouvée")
        
        doc_ref.update({"read": True})
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

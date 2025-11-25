from database import db
from datetime import datetime, timezone
import uuid

async def send_order_notification(order_id: str, notification_type: str, restaurant_id: str):
    """
    Envoie une notification au client pour une commande.
    Types: order_preparing, order_ready, order_delivering, order_completed
    """
    
    # Récupérer la commande
    order = await db.orders.find_one({"id": order_id, "restaurant_id": restaurant_id})
    if not order:
        return False
    
    # Messages selon le type
    messages = {
        "order_preparing": {
            "title": "🍔 Commande en préparation",
            "message": f"Votre commande #{order_id[:8]} est en cours de préparation. Elle sera bientôt prête!",
            "icon": "🔥"
        },
        "order_ready": {
            "title": "✅ Commande prête!",
            "message": f"Votre commande #{order_id[:8]} est prête à être récupérée. Bon appétit!",
            "icon": "🎉"
        },
        "order_delivering": {
            "title": "🚚 Commande en livraison",
            "message": f"Votre commande #{order_id[:8]} est en cours de livraison. Arrivée estimée dans 15-20 minutes.",
            "icon": "🚚"
        },
        "order_completed": {
            "title": "🎊 Commande livrée!",
            "message": f"Votre commande #{order_id[:8]} a été livrée. Merci et bon appétit!",
            "icon": "✨"
        }
    }
    
    notification_data = messages.get(notification_type)
    if not notification_data:
        return False
    
    # Créer la notification dans la DB
    notification = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "customer_id": order.get("customer_id"),
        "customer_name": order.get("customer_name"),
        "customer_email": order.get("customer_email"),
        "customer_phone": order.get("customer_phone"),
        "order_id": order_id,
        "type": notification_type,
        "title": notification_data["title"],
        "message": notification_data["message"],
        "icon": notification_data["icon"],
        "is_read": False,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notifications.insert_one(notification)
    
    # TODO: Envoyer vraiment la notification (email, SMS, push)
    # Pour l'instant on stocke juste dans la DB
    
    print(f"📱 Notification envoyée: {notification_data['title']} pour commande {order_id[:8]}")
    return True

async def get_customer_notifications(customer_id: str, restaurant_id: str):
    """Récupère les notifications d'un client."""
    notifications = await db.notifications.find({
        "restaurant_id": restaurant_id,
        "customer_id": customer_id
    }).sort("created_at", -1).to_list(length=50)
    
    return notifications

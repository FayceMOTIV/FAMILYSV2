from database import db
from datetime import datetime, timezone
import uuid
import httpx

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

async def send_push_notification(push_token: str, title: str, body: str, data: dict = None):
    """Send a push notification via Expo."""
    if not push_token or not push_token.startswith("ExponentPushToken"):
        return False
    
    message = {
        "to": push_token,
        "sound": "default",
        "title": title,
        "body": body,
        "data": data or {}
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                EXPO_PUSH_URL,
                json=message,
                headers={"Content-Type": "application/json"}
            )
            print(f"Push sent: {response.status_code}")
            return response.status_code == 200
    except Exception as e:
        print(f"Error sending push: {e}")
        return False

async def send_order_notification(order_id: str, notification_type: str, restaurant_id: str):
    """
    Envoie une notification au client pour une commande.
    Types: order_preparing, order_ready, order_delivering, order_completed
    """
    
    # Recuperer la commande
    order = await db.orders.find_one({"id": order_id, "restaurant_id": restaurant_id})
    if not order:
        return False
    
    order_number = order.get("order_number", order_id[:8])
    
    # Messages selon le type
    messages = {
        "order_preparing": {
            "title": "Commande en preparation",
            "message": f"Votre commande #{order_number} est en cours de preparation!",
            "icon": "fire"
        },
        "order_ready": {
            "title": "Commande prete!",
            "message": f"Votre commande #{order_number} est prete a etre recuperee!",
            "icon": "check"
        },
        "order_delivering": {
            "title": "Commande en livraison",
            "message": f"Votre commande #{order_number} est en cours de livraison!",
            "icon": "truck"
        },
        "order_completed": {
            "title": "Commande livree!",
            "message": f"Votre commande #{order_number} a ete livree. Bon appetit!",
            "icon": "star"
        }
    }
    
    notification_data = messages.get(notification_type)
    if not notification_data:
        return False
    
    # Creer la notification dans la DB
    notification = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "customer_id": order.get("customer_id"),
        "customer_name": order.get("customer_name"),
        "customer_email": order.get("customer_email"),
        "customer_phone": order.get("customer_phone"),
        "order_id": order_id,
        "order_number": order_number,
        "type": notification_type,
        "title": notification_data["title"],
        "message": notification_data["message"],
        "icon": notification_data["icon"],
        "is_read": False,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.notifications.insert_one(notification)
    
    # Envoyer push notification si le client a un token
    customer_email = order.get("customer_email")
    if customer_email:
        customer = await db.customers.find_one({"email": customer_email})
        if customer and customer.get("push_token"):
            await send_push_notification(
                push_token=customer["push_token"],
                title=notification_data["title"],
                body=notification_data["message"],
                data={
                    "type": notification_type,
                    "order_id": order_id,
                    "order_number": order_number
                }
            )
    
    print(f"Notification envoyee: {notification_data['title']} pour commande {order_number}")
    return True

async def get_customer_notifications(customer_id: str, restaurant_id: str):
    """Recupere les notifications d un client."""
    notifications = await db.notifications.find({
        "restaurant_id": restaurant_id,
        "customer_id": customer_id
    }).sort("created_at", -1).to_list(length=50)
    
    return notifications

async def send_marketing_push(title: str, message: str, target_emails: list = None, restaurant_id: str = "default"):
    """Envoie une notification marketing a plusieurs clients."""
    sent_count = 0
    
    if target_emails:
        query = {"email": {"$in": target_emails}, "push_token": {"$exists": True}}
    else:
        query = {"push_token": {"$exists": True}}
    
    customers = await db.customers.find(query).to_list(length=1000)
    
    for customer in customers:
        if customer.get("push_token"):
            success = await send_push_notification(
                push_token=customer["push_token"],
                title=title,
                body=message,
                data={"type": "marketing"}
            )
            if success:
                sent_count += 1
    
    return sent_count

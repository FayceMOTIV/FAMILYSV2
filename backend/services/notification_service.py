"""
Service de notifications push pour les commandes et le marketing
"""
from database import db
from datetime import datetime, timezone
import uuid
import httpx
import os

# Configuration Expo Push Notifications
EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

# Templates de notifications par type
NOTIFICATION_TEMPLATES = {
    "order_preparing": {
        "title": "🍳 Commande en préparation",
        "body": "Ta commande #{order_number} est en cours de préparation !",
        "emoji": "🍳"
    },
    "order_ready": {
        "title": "✅ Commande prête !",
        "body": "Ta commande #{order_number} est prête ! Viens la récupérer 🎉",
        "emoji": "✅"
    },
    "order_delivering": {
        "title": "🚚 Commande en livraison",
        "body": "Ta commande #{order_number} est en route vers toi !",
        "emoji": "🚚"
    },
    "order_completed": {
        "title": "🎉 Commande terminée",
        "body": "Merci pour ta commande #{order_number} ! Bon appétit !",
        "emoji": "🎉"
    },
    "order_cancelled": {
        "title": "❌ Commande annulée",
        "body": "Ta commande #{order_number} a été annulée.",
        "emoji": "❌"
    },
    "loyalty_credited": {
        "title": "💰 Fidélité créditée !",
        "body": "+{amount}€ ajoutés à ta cagnotte ! Total: {total}€",
        "emoji": "💰"
    },
    "reward_won": {
        "title": "🎁 Tu as gagné !",
        "body": "{reward_label}",
        "emoji": "🎁"
    },
    "reward_expiring": {
        "title": "⏰ Récompense bientôt expirée",
        "body": "Ta récompense expire dans {days} jour(s) ! Utilise-la vite !",
        "emoji": "⏰"
    }
}


async def send_push_notification(push_token: str, title: str, body: str, data: dict = None):
    """
    Envoie une notification push via Expo
    """
    if not push_token or not push_token.startswith("ExponentPushToken"):
        print(f"Invalid push token: {push_token}")
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
            
            if response.status_code == 200:
                print(f"Push notification sent successfully to {push_token[:20]}...")
                return True
            else:
                print(f"Push notification failed: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"Error sending push notification: {e}")
        return False


async def send_order_notification(order_id: str, notification_type: str, restaurant_id: str = "default"):
    """
    Envoie une notification pour une commande
    """
    try:
        # Récupérer la commande
        order = await db.orders.find_one({"id": order_id})
        if not order:
            print(f"Order not found: {order_id}")
            return False
        
        # Récupérer le template
        template = NOTIFICATION_TEMPLATES.get(notification_type)
        if not template:
            print(f"Unknown notification type: {notification_type}")
            return False
        
        # Préparer le message
        order_number = order.get("order_number", order_id[:8])
        title = template["title"]
        body = template["body"].format(order_number=order_number)
        
        # Récupérer le client
        customer_email = order.get("customer_email")
        if not customer_email:
            print("No customer email in order")
            return False
        
        customer = await db.customers.find_one({"email": customer_email})
        if not customer:
            print(f"Customer not found: {customer_email}")
            return False
        
        push_token = customer.get("push_token")
        
        # Créer la notification en base (même sans push token)
        notification = {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "customer_email": customer_email,
            "type": notification_type,
            "title": title,
            "body": body,
            "order_id": order_id,
            "order_number": order_number,
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.notifications.insert_one(notification)
        
        # Envoyer la push notification si token disponible
        if push_token:
            await send_push_notification(
                push_token=push_token,
                title=title,
                body=body,
                data={
                    "type": notification_type,
                    "order_id": order_id,
                    "order_number": order_number
                }
            )
        
        return True
        
    except Exception as e:
        print(f"Error sending order notification: {e}")
        return False


async def send_marketing_push(title: str, body: str = None, message: str = None, target_audience: str = "all", target_emails: list = None, restaurant_id: str = "default"):
    """
    Envoie une notification marketing à un groupe de clients
    
    Args:
        title: Titre de la notification
        body: Corps du message (alias: message)
        message: Corps du message (alias: body)
        target_audience: "all", "active", "inactive"
        target_emails: Liste d'emails spécifiques (optionnel)
        restaurant_id: ID du restaurant
    """
    # Supporter les deux noms de paramètre
    notification_body = body or message or ""
    
    try:
        # Si des emails spécifiques sont fournis
        if target_emails and len(target_emails) > 0:
            customers = await db.customers.find({
                "email": {"$in": target_emails},
                "push_token": {"$exists": True, "$ne": None}
            }).to_list(length=1000)
        else:
            # Récupérer les clients avec push token selon l'audience
            query = {"push_token": {"$exists": True, "$ne": None}}
            
            if target_audience == "active":
                from datetime import timedelta
                thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
                query["last_order_at"] = {"$gte": thirty_days_ago}
            elif target_audience == "inactive":
                from datetime import timedelta
                thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
                query["$or"] = [
                    {"last_order_at": {"$lt": thirty_days_ago}},
                    {"last_order_at": {"$exists": False}}
                ]
            
            customers = await db.customers.find(query).to_list(length=1000)
        
        sent_count = 0
        for customer in customers:
            push_token = customer.get("push_token")
            if push_token:
                success = await send_push_notification(
                    push_token=push_token,
                    title=title,
                    body=notification_body,
                    data={"type": "marketing"}
                )
                if success:
                    sent_count += 1
        
        return sent_count
        
    except Exception as e:
        print(f"Error sending marketing push: {e}")
        return 0


async def send_loyalty_credited_notification(user_id: str, order_id: str, amount_credited: float, total_points: float):
    """
    Envoie une notification quand du cashback est crédité
    """
    try:
        customer = await db.customers.find_one({"id": user_id})
        if not customer:
            return False
        
        template = NOTIFICATION_TEMPLATES["loyalty_credited"]
        title = template["title"]
        body = template["body"].format(amount=f"{amount_credited:.2f}", total=f"{total_points:.2f}")
        
        # Créer la notification en base
        notification = {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "customer_email": customer.get("email"),
            "type": "loyalty_credited",
            "title": title,
            "body": body,
            "order_id": order_id,
            "amount": amount_credited,
            "total_points": total_points,
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.notifications.insert_one(notification)
        
        # Envoyer push si token disponible
        push_token = customer.get("push_token")
        if push_token:
            await send_push_notification(
                push_token=push_token,
                title=title,
                body=body,
                data={
                    "type": "loyalty_credited",
                    "amount": amount_credited,
                    "total": total_points
                }
            )
        
        return True
        
    except Exception as e:
        print(f"Error sending loyalty notification: {e}")
        return False


async def send_reward_notification(user_id: str, reward_label: str, reward_type: str):
    """
    Envoie une notification quand un client gagne une récompense
    """
    try:
        customer = await db.customers.find_one({"id": user_id})
        if not customer:
            return False
        
        template = NOTIFICATION_TEMPLATES["reward_won"]
        title = template["title"]
        body = template["body"].format(reward_label=reward_label)
        
        # Créer la notification en base
        notification = {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "customer_email": customer.get("email"),
            "type": "reward_won",
            "title": title,
            "body": body,
            "reward_type": reward_type,
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.notifications.insert_one(notification)
        
        # Envoyer push si token disponible
        push_token = customer.get("push_token")
        if push_token:
            await send_push_notification(
                push_token=push_token,
                title=title,
                body=body,
                data={
                    "type": "reward_won",
                    "reward_type": reward_type
                }
            )
        
        return True
        
    except Exception as e:
        print(f"Error sending reward notification: {e}")
        return False

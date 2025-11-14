"""
Script pour générer des commandes de test dans tous les statuts
"""

import asyncio
import uuid
from datetime import datetime, timezone, timedelta
import random
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "familys_restaurant"
RESTAURANT_ID = "family-s-restaurant"

# Données réalistes
CUSTOMERS = [
    {"name": "Marie Dubois", "phone": "+33612345678", "email": "marie.dubois@email.fr"},
    {"name": "Jean Martin", "phone": "+33623456789", "email": "jean.martin@email.fr"},
    {"name": "Sophie Bernard", "phone": "+33634567890", "email": "sophie.bernard@email.fr"},
    {"name": "Pierre Petit", "phone": "+33645678901", "email": "pierre.petit@email.fr"},
    {"name": "Lucie Robert", "phone": "+33656789012", "email": "lucie.robert@email.fr"},
    {"name": "Thomas Richard", "phone": "+33667890123", "email": "thomas.richard@email.fr"},
    {"name": "Emma Durand", "phone": "+33678901234", "email": "emma.durand@email.fr"},
    {"name": "Lucas Moreau", "phone": "+33689012345", "email": "lucas.moreau@email.fr"},
    {"name": "Chloé Simon", "phone": "+33690123456", "email": "chloe.simon@email.fr"},
    {"name": "Hugo Laurent", "phone": "+33601234567", "email": "hugo.laurent@email.fr"},
]

ADDRESSES = [
    "15 Rue de la République, 75001 Paris",
    "42 Avenue des Champs-Élysées, 75008 Paris",
    "8 Boulevard Saint-Germain, 75005 Paris",
    "23 Rue de Rivoli, 75004 Paris",
    "67 Avenue Montaigne, 75008 Paris",
    "31 Rue du Faubourg Saint-Honoré, 75008 Paris",
    "19 Place Vendôme, 75001 Paris",
    "54 Rue de la Paix, 75002 Paris",
    "88 Boulevard Haussmann, 75008 Paris",
    "12 Rue Royale, 75008 Paris",
]

ITEMS = [
    {"name": "Family's Original", "price": 12.90, "quantity": 1},
    {"name": "Le King", "price": 13.90, "quantity": 1},
    {"name": "Chicken Deluxe", "price": 11.90, "quantity": 1},
    {"name": "Veggie Burger", "price": 10.90, "quantity": 1},
    {"name": "Frites Maison", "price": 3.90, "quantity": 1},
    {"name": "Nuggets (6 pcs)", "price": 5.90, "quantity": 1},
    {"name": "Coca-Cola", "price": 2.50, "quantity": 1},
    {"name": "Milkshake Vanille", "price": 4.90, "quantity": 1},
    {"name": "Tiramisu", "price": 5.50, "quantity": 1},
    {"name": "Brownie Chocolat", "price": 4.50, "quantity": 1},
]

STATUSES = [
    "new",
    "in_preparation",
    "ready",
    "out_for_delivery",
    "completed",
    "canceled"
]

PAYMENT_METHODS = ["cash", "card", "mobile", "online"]

async def generate_orders():
    """Générer 5 commandes par statut (30 total)"""
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    orders_created = 0
    
    for status in STATUSES:
        for i in range(5):
            customer = random.choice(CUSTOMERS)
            order_type = random.choice(["delivery", "takeaway"])
            
            # Générer items aléatoires (2-4 items)
            num_items = random.randint(2, 4)
            order_items = []
            total = 0
            
            for _ in range(num_items):
                item = random.choice(ITEMS).copy()
                item["quantity"] = random.randint(1, 2)
                item["total_price"] = item["price"] * item["quantity"]
                total += item["total_price"]
                order_items.append(item)
            
            # Frais de livraison
            delivery_fee = 2.50 if order_type == "delivery" else 0
            total += delivery_fee
            
            # Déterminer le statut de paiement
            if status in ["completed"]:
                payment_status = "paid"
                payment_method = random.choice(PAYMENT_METHODS)
            elif status in ["new", "in_preparation"]:
                payment_status = random.choice(["pending", "paid"])
                payment_method = random.choice(PAYMENT_METHODS) if payment_status == "paid" else None
            else:
                payment_status = random.choice(["pending", "paid"])
                payment_method = random.choice(PAYMENT_METHODS) if payment_status == "paid" else None
            
            # Calcul des montants pour espèces
            amount_received = None
            change_given = None
            if payment_method == "cash" and payment_status == "paid":
                amount_received = round(total + random.uniform(0, 10), 2)
                change_given = round(amount_received - total, 2)
            
            # Créer la commande
            order = {
                "id": str(uuid.uuid4()),
                "restaurant_id": RESTAURANT_ID,
                "customer_name": customer["name"],
                "customer_phone": customer["phone"],
                "customer_email": customer["email"],
                "order_type": order_type,
                "delivery_address": random.choice(ADDRESSES) if order_type == "delivery" else None,
                "items": order_items,
                "subtotal": round(total - delivery_fee, 2),
                "delivery_fee": delivery_fee,
                "total": round(total, 2),
                "status": status,
                "payment_status": payment_status,
                "payment_method": payment_method,
                "amount_received": amount_received,
                "change_given": change_given,
                "notes": random.choice([None, "Sans oignon", "Bien cuit", "Sauce à part", None, None]),
                "cancellation_reason": "Client a annulé" if status == "canceled" else None,
                "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(0, 7))).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.orders.insert_one(order)
            orders_created += 1
            print(f"✅ Commande créée: {order['customer_name']} - {status} - {order_type} - {total}€")
    
    print(f"\n🎉 {orders_created} commandes créées avec succès!")
    client.close()

if __name__ == "__main__":
    asyncio.run(generate_orders())

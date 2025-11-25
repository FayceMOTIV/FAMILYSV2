import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone, timedelta
import uuid
import random

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test_database")

async def create_test_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    restaurant_id = "default"
    
    # Clients factices
    customers = [
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Jean Dupont",
            "email": "jean.dupont@email.com",
            "phone": "+33612345678",
            "loyalty_points": 150,
            "total_orders": 8,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Marie Martin",
            "email": "marie.martin@email.com",
            "phone": "+33623456789",
            "loyalty_points": 80,
            "total_orders": 4,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Pierre Leclerc",
            "email": "pierre.leclerc@email.com",
            "phone": "+33634567890",
            "loyalty_points": 220,
            "total_orders": 12,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Sophie Bernard",
            "email": "sophie.bernard@email.com",
            "phone": "+33645678901",
            "loyalty_points": 50,
            "total_orders": 3,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Luc Dubois",
            "email": "luc.dubois@email.com",
            "phone": "+33656789012",
            "loyalty_points": 180,
            "total_orders": 9,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Supprimer anciennes données
    await db.customers.delete_many({"restaurant_id": restaurant_id})
    await db.orders.delete_many({"restaurant_id": restaurant_id})
    
    # Insérer clients
    await db.customers.insert_many(customers)
    print(f"✅ {len(customers)} clients créés")
    
    # Produits possibles
    products = [
        {"name": "Burger Classic", "price": 8.50},
        {"name": "Burger Cheese", "price": 9.50},
        {"name": "Burger Bacon", "price": 10.50},
        {"name": "Frites", "price": 3.50},
        {"name": "Nuggets (6pcs)", "price": 5.50},
        {"name": "Salade César", "price": 7.50},
        {"name": "Coca-Cola", "price": 2.50},
        {"name": "Sprite", "price": 2.50},
        {"name": "Tiramisu", "price": 4.50},
        {"name": "Brownie", "price": 3.50},
    ]
    
    # Créer commandes avec différents statuts
    statuses = ["pending", "preparing", "ready", "delivering", "completed", "cancelled"]
    order_types = ["takeaway", "delivery"]
    payment_methods = ["cash", "card", "mobile", "online"]
    
    orders = []
    
    # 3 nouvelles commandes (pending)
    for i in range(3):
        customer = random.choice(customers)
        items = []
        total = 0
        
        # 2-4 items par commande
        for j in range(random.randint(2, 4)):
            product = random.choice(products)
            quantity = random.randint(1, 2)
            item_total = product["price"] * quantity
            total += item_total
            
            items.append({
                "product_id": str(uuid.uuid4()),
                "name": product["name"],
                "quantity": quantity,
                "unit_price": product["price"],
                "total_price": round(item_total, 2),
                "notes": random.choice(["", "", "", "Sans oignon", "Bien cuit"])
            })
        
        order = {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "customer_id": customer["id"],
            "customer_name": customer["name"],
            "customer_email": customer["email"],
            "customer_phone": customer["phone"],
            "items": items,
            "total": round(total, 2),
            "status": "pending",
            "order_type": random.choice(order_types),
            "payment_method": None,
            "payment_status": "pending",
            "created_at": (datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 30))).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        orders.append(order)
    
    # 2 en préparation
    for i in range(2):
        customer = random.choice(customers)
        items = []
        total = 0
        
        for j in range(random.randint(2, 4)):
            product = random.choice(products)
            quantity = random.randint(1, 2)
            item_total = product["price"] * quantity
            total += item_total
            
            items.append({
                "product_id": str(uuid.uuid4()),
                "name": product["name"],
                "quantity": quantity,
                "unit_price": product["price"],
                "total_price": round(item_total, 2),
                "notes": ""
            })
        
        order = {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "customer_id": customer["id"],
            "customer_name": customer["name"],
            "customer_email": customer["email"],
            "customer_phone": customer["phone"],
            "items": items,
            "total": round(total, 2),
            "status": "preparing",
            "order_type": random.choice(order_types),
            "payment_method": random.choice(payment_methods),
            "payment_status": "paid",
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=1, minutes=random.randint(0, 30))).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        orders.append(order)
    
    # 1 prête
    customer = random.choice(customers)
    items = []
    total = 0
    for j in range(random.randint(2, 3)):
        product = random.choice(products)
        quantity = random.randint(1, 2)
        item_total = product["price"] * quantity
        total += item_total
        items.append({
            "product_id": str(uuid.uuid4()),
            "name": product["name"],
            "quantity": quantity,
            "unit_price": product["price"],
            "total_price": round(item_total, 2),
            "notes": ""
        })
    
    order = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "customer_id": customer["id"],
        "customer_name": customer["name"],
        "customer_email": customer["email"],
        "customer_phone": customer["phone"],
        "items": items,
        "total": round(total, 2),
        "status": "ready",
        "order_type": "takeaway",
        "payment_method": "card",
        "payment_status": "paid",
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    orders.append(order)
    
    # 1 en livraison
    customer = random.choice(customers)
    items = []
    total = 0
    for j in range(random.randint(2, 4)):
        product = random.choice(products)
        quantity = random.randint(1, 2)
        item_total = product["price"] * quantity
        total += item_total
        items.append({
            "product_id": str(uuid.uuid4()),
            "name": product["name"],
            "quantity": quantity,
            "unit_price": product["price"],
            "total_price": round(item_total, 2),
            "notes": ""
        })
    
    order = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "customer_id": customer["id"],
        "customer_name": customer["name"],
        "customer_email": customer["email"],
        "customer_phone": customer["phone"],
        "items": items,
        "total": round(total, 2),
        "status": "delivering",
        "order_type": "delivery",
        "payment_method": "online",
        "payment_status": "paid",
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    orders.append(order)
    
    # Insérer commandes
    await db.orders.insert_many(orders)
    print(f"✅ {len(orders)} commandes créées")
    print(f"   - 3 nouvelles (pending)")
    print(f"   - 2 en préparation (preparing)")
    print(f"   - 1 prête (ready)")
    print(f"   - 1 en livraison (delivering)")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_test_data())

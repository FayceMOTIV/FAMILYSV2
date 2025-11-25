"""
Script to create test orders with correct statuses for Family's Back Office
"""
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from datetime import datetime, timezone, timedelta
import random
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_order_test_data():
    """Create test orders with correct statuses."""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    restaurant_id = "default"
    
    # Define test products (simple burger items)
    test_products = [
        {"name": "Family's Burger", "price": 9.90},
        {"name": "Cheeseburger", "price": 10.90},
        {"name": "Double Cheese", "price": 12.90},
        {"name": "Bacon Burger", "price": 11.90},
        {"name": "Veggie Burger", "price": 10.50},
        {"name": "Frites", "price": 3.50},
        {"name": "Nuggets x6", "price": 5.90},
        {"name": "Coca-Cola", "price": 2.50},
        {"name": "Tiramisu", "price": 4.90},
    ]
    
    # Correct statuses
    statuses = ["new", "in_preparation", "ready", "out_for_delivery", "completed"]
    payment_methods = ["card", "cash", "mobile", "online"]
    order_types = ["takeaway", "delivery"]
    
    # Create 20 test orders
    orders = []
    
    for i in range(20):
        # Random time in the last 48 hours
        hours_ago = random.randint(0, 48)
        created_at = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
        
        # Random items (1-4 products)
        num_items = random.randint(1, 4)
        selected_products = random.sample(test_products, min(num_items, len(test_products)))
        
        items = []
        subtotal = 0
        
        for product in selected_products:
            quantity = random.randint(1, 3)
            item_price = product['price'] * quantity
            
            items.append({
                "product_id": str(uuid.uuid4()),
                "name": product['name'],
                "base_price": product['price'],
                "quantity": quantity,
                "options": [],
                "total_price": round(item_price, 2),
                "notes": random.choice([None, "Sans oignons", "Bien cuit", "Sans cornichons"])
            })
            
            subtotal += item_price
        
        # Calculate VAT (10%)
        vat_amount = subtotal * 0.10
        total = subtotal
        
        # Random status (more new and in_preparation orders)
        status_weights = {
            "new": 0.3,
            "in_preparation": 0.25,
            "ready": 0.15,
            "out_for_delivery": 0.1,
            "completed": 0.2
        }
        status = random.choices(list(status_weights.keys()), weights=list(status_weights.values()))[0]
        
        # Random order type
        order_type = random.choice(order_types)
        
        order = {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "order_number": f"#{1000 + i}",
            "customer_email": f"client{i+1}@familys.fr",
            "customer_name": random.choice([
                "Jean Dupont", "Marie Martin", "Pierre Dubois", 
                "Sophie Bernard", "Luc Petit", "Emma Moreau",
                "Thomas Robert", "Julie Rousseau", "Nicolas Simon",
                "Laura Lefebvre"
            ]),
            "customer_phone": f"06{random.randint(10000000, 99999999)}",
            "customer_id": str(uuid.uuid4()),
            "items": items,
            "subtotal": round(subtotal, 2),
            "vat_amount": round(vat_amount, 2),
            "total": round(total, 2),
            "status": status,
            "payment_method": random.choice(payment_methods),
            "payment_status": "paid" if status in ["completed", "out_for_delivery"] else "pending",
            "order_type": order_type,
            "consumption_mode": order_type,
            "pickup_date": None,
            "pickup_time": None,
            "notes": random.choice([None, "Livraison rapide svp", "Sonner à l'interphone", "Laisser devant la porte"]),
            "created_at": created_at.isoformat(),
            "updated_at": created_at.isoformat()
        }
        
        orders.append(order)
    
    # Clear existing orders
    await db.orders.delete_many({"restaurant_id": restaurant_id})
    
    # Insert new orders
    await db.orders.insert_many(orders)
    
    # Calculate stats
    print(f"✅ {len(orders)} commandes de test créées\n")
    print("📊 Répartition par statut:")
    for status in statuses:
        count = len([o for o in orders if o['status'] == status])
        print(f"   {status}: {count}")
    
    print("\n💰 Stats financières:")
    total_ca = sum(order['total'] for order in orders)
    print(f"   CA Total: {total_ca:.2f}€")
    
    # Today's orders
    today_orders = [o for o in orders if (datetime.now(timezone.utc) - datetime.fromisoformat(o['created_at'])).days == 0]
    today_ca = sum(order['total'] for order in today_orders)
    print(f"   CA Aujourd'hui: {today_ca:.2f}€")
    print(f"   Commandes aujourd'hui: {len(today_orders)}")
    
    client.close()
    print("\n✅ Base de données initialisée avec succès!")

if __name__ == "__main__":
    asyncio.run(create_order_test_data())

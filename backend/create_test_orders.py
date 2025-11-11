"""
Script to create test orders for Family's Back Office dashboard
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

async def create_test_orders():
    """Create test orders with different statuses and payment methods."""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    restaurant_id = "familys-bourg-en-bresse"
    
    # Get existing products
    products = await db.products.find({"restaurant_id": restaurant_id}).to_list(length=None)
    
    if not products:
        print("❌ Aucun produit trouvé. Exécutez d'abord seed_data.py")
        client.close()
        return
    
    # Payment methods and statuses
    payment_methods = ["card", "cash", "ticket_resto", "check"]
    statuses = ["new", "in_preparation", "ready", "completed"]
    consumption_modes = ["takeaway", "on_site"]
    
    # Create 15 test orders
    orders = []
    order_number_start = 1001
    
    for i in range(15):
        # Random time in the last 24 hours
        hours_ago = random.randint(0, 24)
        created_at = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
        
        # Random items (1-4 products)
        num_items = random.randint(1, 4)
        selected_products = random.sample(products, min(num_items, len(products)))
        
        items = []
        subtotal = 0
        vat_amount = 0
        
        for product in selected_products:
            quantity = random.randint(1, 2)
            item_price = product['base_price'] * quantity
            item_vat = item_price * (product['vat_rate'] / 100)
            
            items.append({
                "product_id": product['id'],
                "name": product['name'],
                "base_price": product['base_price'],
                "quantity": quantity,
                "options": [],
                "total_price": item_price,
                "notes": None
            })
            
            subtotal += item_price
            vat_amount += item_vat
        
        total = subtotal
        
        order = {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "order_number": f"#{order_number_start + i}",
            "customer_email": f"client{i+1}@example.com",
            "customer_name": f"Client Test {i+1}",
            "customer_phone": f"06{random.randint(10000000, 99999999)}",
            "items": items,
            "subtotal": round(subtotal, 2),
            "vat_amount": round(vat_amount, 2),
            "total": round(total, 2),
            "status": random.choice(statuses),
            "payment_method": random.choice(payment_methods),
            "consumption_mode": random.choice(consumption_modes),
            "pickup_date": None,
            "pickup_time": None,
            "notes": None,
            "created_at": created_at.isoformat(),
            "updated_at": created_at.isoformat()
        }
        
        orders.append(order)
    
    # Insert orders
    await db.orders.insert_many(orders)
    
    # Calculate stats
    total_ca = sum(order['total'] for order in orders)
    today_orders = [o for o in orders if (datetime.now(timezone.utc) - datetime.fromisoformat(o['created_at'])).days == 0]
    today_ca = sum(order['total'] for order in today_orders)
    
    print(f"✅ {len(orders)} commandes de test créées")
    print(f"\n📊 Stats:")
    print(f"   CA Total: {total_ca:.2f}€")
    print(f"   CA Aujourd'hui: {today_ca:.2f}€")
    print(f"   Commandes aujourd'hui: {len(today_orders)}")
    print(f"\n💳 Répartition paiements:")
    for method in payment_methods:
        method_orders = [o for o in today_orders if o['payment_method'] == method]
        method_ca = sum(o['total'] for o in method_orders)
        if method_ca > 0:
            print(f"   {method}: {method_ca:.2f}€")
    
    print(f"\n📦 Statuts:")
    for status in statuses:
        status_count = len([o for o in today_orders if o['status'] == status])
        if status_count > 0:
            print(f"   {status}: {status_count}")
    
    client.close()
    print("\n✅ Commandes de test créées avec succès!")

if __name__ == "__main__":
    asyncio.run(create_test_orders())

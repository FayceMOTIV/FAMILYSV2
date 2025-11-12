"""
Script complet de génération de données de test pour Family's Back Office
Génère: catégories, options, produits, clients, commandes, promotions, notifications, et réservations
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

async def create_complete_test_data():
    """Créer un jeu complet de données de test."""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    restaurant_id = "default"
    
    print("🚀 Génération complète des données de test...\n")
    
    # ========== 1. CATÉGORIES ==========
    print("📁 Création des catégories...")
    categories_data = [
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🍔 Burgers",
            "description": "Nos burgers signature au bœuf premium",
            "image": "/uploads/categories/burgers.jpg",
            "display_order": 1,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🍟 Accompagnements",
            "description": "Frites, nuggets, onion rings...",
            "image": "/uploads/categories/sides.jpg",
            "display_order": 2,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🥤 Boissons",
            "description": "Sodas, jus, et boissons chaudes",
            "image_url": "/uploads/categories/drinks.jpg",
            "display_order": 3,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🍰 Desserts",
            "description": "Douceurs et pâtisseries maison",
            "image_url": "/uploads/categories/desserts.jpg",
            "display_order": 4,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🥗 Salades",
            "description": "Salades fraîches et complètes",
            "image_url": "/uploads/categories/salads.jpg",
            "display_order": 5,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.categories.delete_many({"restaurant_id": restaurant_id})
    await db.categories.insert_many(categories_data)
    print(f"   ✅ {len(categories_data)} catégories créées")
    
    # ========== 2. OPTIONS ==========
    print("\n⚙️  Création des options produits...")
    options_data = [
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Cuisson",
            "type": "single",
            "is_required": True,
            "choices": [
                {"name": "Saignant", "price": 0},
                {"name": "À point", "price": 0},
                {"name": "Bien cuit", "price": 0}
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Sauce",
            "type": "single",
            "is_required": False,
            "choices": [
                {"name": "Ketchup", "price": 0},
                {"name": "Mayonnaise", "price": 0},
                {"name": "Moutarde", "price": 0},
                {"name": "BBQ", "price": 0.50},
                {"name": "Algérienne", "price": 0.50},
                {"name": "Samouraï", "price": 0.50}
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Suppléments",
            "type": "multiple",
            "is_required": False,
            "max_choices": 5,
            "choices": [
                {"name": "Bacon", "price": 1.50},
                {"name": "Fromage", "price": 1.00},
                {"name": "Oeuf", "price": 1.00},
                {"name": "Oignons frits", "price": 0.80},
                {"name": "Avocat", "price": 1.50},
                {"name": "Champignons", "price": 1.00}
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Taille Boisson",
            "type": "single",
            "is_required": True,
            "choices": [
                {"name": "Petite (33cl)", "price": 0},
                {"name": "Moyenne (50cl)", "price": 0.50},
                {"name": "Grande (1L)", "price": 1.00}
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "Extras Sans",
            "type": "multiple",
            "is_required": False,
            "choices": [
                {"name": "Sans oignons", "price": 0},
                {"name": "Sans cornichons", "price": 0},
                {"name": "Sans tomates", "price": 0},
                {"name": "Sans salade", "price": 0}
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.options.delete_many({"restaurant_id": restaurant_id})
    await db.options.insert_many(options_data)
    print(f"   ✅ {len(options_data)} options créées")
    
    # ========== 3. PRODUITS ==========
    print("\n📦 Création des produits...")
    products_data = [
        # Burgers
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[0]["id"],
            "name": "Family's Original",
            "description": "Notre burger signature : steak haché 180g, cheddar, sauce secrète, cornichons, oignons frits",
            "image_url": "/uploads/products/family-original.jpg",
            "price": 9.90,
            "is_available": True,
            "option_ids": [options_data[0]["id"], options_data[1]["id"], options_data[2]["id"], options_data[4]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[0]["id"],
            "name": "Double Cheese",
            "description": "2 steaks 100g, double cheddar, sauce burger, salade, tomate",
            "image_url": "/uploads/products/double-cheese.jpg",
            "price": 11.90,
            "is_available": True,
            "option_ids": [options_data[0]["id"], options_data[1]["id"], options_data[2]["id"], options_data[4]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[0]["id"],
            "name": "Bacon BBQ",
            "description": "Steak 180g, bacon grillé, cheddar, sauce BBQ, oignons frits",
            "image_url": "/uploads/products/bacon-bbq.jpg",
            "price": 12.50,
            "is_available": True,
            "option_ids": [options_data[0]["id"], options_data[1]["id"], options_data[2]["id"], options_data[4]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[0]["id"],
            "name": "Veggie Burger",
            "description": "Steak végétarien, cheddar, avocat, sauce curry, salade, tomate",
            "image_url": "/uploads/products/veggie.jpg",
            "price": 10.50,
            "is_available": True,
            "option_ids": [options_data[1]["id"], options_data[2]["id"], options_data[4]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[0]["id"],
            "name": "Chicken Crispy",
            "description": "Poulet pané croustillant, salade, tomate, sauce mayonnaise épicée",
            "image_url": "/uploads/products/chicken-crispy.jpg",
            "price": 9.50,
            "is_available": True,
            "option_ids": [options_data[1]["id"], options_data[2]["id"], options_data[4]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Accompagnements
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[1]["id"],
            "name": "Frites Maison",
            "description": "Frites fraîches coupées au couteau",
            "image_url": "/uploads/products/fries.jpg",
            "price": 3.50,
            "is_available": True,
            "option_ids": [options_data[1]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[1]["id"],
            "name": "Nuggets x6",
            "description": "6 nuggets de poulet croustillants",
            "image_url": "/uploads/products/nuggets.jpg",
            "price": 5.90,
            "is_available": True,
            "option_ids": [options_data[1]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[1]["id"],
            "name": "Onion Rings",
            "description": "Rondelles d'oignons panées",
            "image_url": "/uploads/products/onion-rings.jpg",
            "price": 4.50,
            "is_available": True,
            "option_ids": [options_data[1]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Boissons
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[2]["id"],
            "name": "Coca-Cola",
            "description": "Coca-Cola original",
            "image_url": "/uploads/products/coca.jpg",
            "price": 2.50,
            "is_available": True,
            "option_ids": [options_data[3]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[2]["id"],
            "name": "Orangina",
            "description": "Boisson pétillante à l'orange",
            "image_url": "/uploads/products/orangina.jpg",
            "price": 2.50,
            "is_available": True,
            "option_ids": [options_data[3]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[2]["id"],
            "name": "Limonade Maison",
            "description": "Limonade artisanale au citron frais",
            "image_url": "/uploads/products/lemonade.jpg",
            "price": 3.50,
            "is_available": True,
            "option_ids": [options_data[3]["id"]],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Desserts
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[3]["id"],
            "name": "Tiramisu",
            "description": "Tiramisu maison au café",
            "image_url": "/uploads/products/tiramisu.jpg",
            "price": 4.90,
            "is_available": True,
            "option_ids": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[3]["id"],
            "name": "Brownie Chocolat",
            "description": "Brownie fondant au chocolat noir",
            "image_url": "/uploads/products/brownie.jpg",
            "price": 4.50,
            "is_available": True,
            "option_ids": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[3]["id"],
            "name": "Cheesecake",
            "description": "Cheesecake new-yorkais aux fruits rouges",
            "image_url": "/uploads/products/cheesecake.jpg",
            "price": 5.50,
            "is_available": True,
            "option_ids": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Salades
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "category_id": categories_data[4]["id"],
            "name": "César Poulet",
            "description": "Salade, poulet grillé, parmesan, croûtons, sauce césar",
            "image_url": "/uploads/products/caesar.jpg",
            "price": 8.90,
            "is_available": True,
            "option_ids": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.delete_many({"restaurant_id": restaurant_id})
    await db.products.insert_many(products_data)
    print(f"   ✅ {len(products_data)} produits créés")
    
    # ========== 4. CLIENTS ==========
    print("\n👥 Création des clients...")
    
    first_names = ["Jean", "Marie", "Pierre", "Sophie", "Luc", "Emma", "Thomas", "Julie", "Nicolas", "Laura",
                   "Alexandre", "Camille", "Maxime", "Léa", "Antoine", "Chloé", "Lucas", "Manon", "Hugo", "Sarah"]
    last_names = ["Dupont", "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Petit", "Richard", "Garcia", "Durand",
                  "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Leroy", "Martinez", "David", "Fontaine", "Rousseau"]
    
    customers_data = []
    for i in range(30):
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        customers_data.append({
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "email": f"{first_name.lower()}.{last_name.lower()}{i}@example.com",
            "first_name": first_name,
            "last_name": last_name,
            "phone": f"06{random.randint(10000000, 99999999)}",
            "loyalty_points": random.randint(0, 500),
            "total_orders": random.randint(1, 50),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 365))).isoformat()
        })
    
    await db.customers.delete_many({"restaurant_id": restaurant_id})
    await db.customers.insert_many(customers_data)
    print(f"   ✅ {len(customers_data)} clients créés")
    
    # ========== 5. COMMANDES ==========
    print("\n📦 Création des commandes...")
    
    statuses = ["new", "in_preparation", "ready", "out_for_delivery", "completed", "canceled"]
    payment_methods = ["card", "cash", "mobile", "online"]
    order_types = ["takeaway", "delivery"]
    
    orders_data = []
    for i in range(50):
        customer = random.choice(customers_data)
        hours_ago = random.randint(0, 168)  # 7 jours
        created_at = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
        
        # Sélectionner des produits aléatoires
        num_items = random.randint(1, 5)
        selected_products = random.sample(products_data, min(num_items, len(products_data)))
        
        items = []
        subtotal = 0
        for product in selected_products:
            quantity = random.randint(1, 3)
            item_total = product['price'] * quantity
            items.append({
                "product_id": product['id'],
                "name": product['name'],
                "base_price": product['price'],
                "quantity": quantity,
                "options": [],
                "total_price": round(item_total, 2),
                "notes": random.choice([None, "Sans oignons", "Bien cuit", "Sans cornichons", "Sauce à part"])
            })
            subtotal += item_total
        
        vat_amount = subtotal * 0.10
        total = subtotal
        
        # Plus de commandes récentes en statut "new" et "in_preparation"
        if hours_ago < 24:
            status = random.choice(["new", "in_preparation", "in_preparation", "ready"])
        else:
            status = random.choice(statuses)
        
        order_type = random.choice(order_types)
        
        orders_data.append({
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "order_number": f"#{1000 + i}",
            "customer_id": customer["id"],
            "customer_email": customer["email"],
            "customer_name": f"{customer['first_name']} {customer['last_name']}",
            "customer_phone": customer["phone"],
            "items": items,
            "subtotal": round(subtotal, 2),
            "vat_amount": round(vat_amount, 2),
            "total": round(total, 2),
            "status": status,
            "payment_method": random.choice(payment_methods),
            "payment_status": "paid" if status in ["completed", "out_for_delivery", "ready"] else "pending",
            "order_type": order_type,
            "notes": random.choice([None, "Livraison rapide svp", "Sonner à l'interphone", "Laisser devant la porte"]),
            "created_at": created_at.isoformat(),
            "updated_at": created_at.isoformat()
        })
    
    await db.orders.delete_many({"restaurant_id": restaurant_id})
    await db.orders.insert_many(orders_data)
    print(f"   ✅ {len(orders_data)} commandes créées")
    
    # ========== 6. PROMOTIONS ==========
    print("\n🎉 Création des promotions...")
    
    promos_data = [
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "code": "WELCOME10",
            "description": "10% de réduction pour les nouveaux clients",
            "discount_type": "percentage",
            "discount_value": 10,
            "min_order_amount": 15.0,
            "is_active": True,
            "valid_from": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=60)).isoformat(),
            "usage_count": random.randint(10, 100),
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "code": "MENU20",
            "description": "Menu King à 9,90€ au lieu de 12,50€",
            "discount_type": "fixed",
            "discount_value": 2.60,
            "min_order_amount": 0,
            "is_active": True,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "usage_count": random.randint(50, 200),
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "code": "LIVRAISON5",
            "description": "5€ de réduction sur livraison",
            "discount_type": "fixed",
            "discount_value": 5,
            "min_order_amount": 20.0,
            "is_active": True,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "usage_count": random.randint(20, 80),
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "code": "HAPPY15",
            "description": "Happy Hour : 15% de 17h à 19h",
            "discount_type": "percentage",
            "discount_value": 15,
            "min_order_amount": 10.0,
            "is_active": True,
            "valid_from": datetime.now(timezone.utc).isoformat(),
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
            "usage_count": random.randint(100, 300),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.promos.delete_many({"restaurant_id": restaurant_id})
    await db.promos.insert_many(promos_data)
    print(f"   ✅ {len(promos_data)} promotions créées")
    
    # ========== 7. RÉSERVATIONS ==========
    print("\n📅 Création des réservations...")
    
    reservations_data = []
    for i in range(20):
        customer = random.choice(customers_data)
        days_offset = random.randint(-7, 14)  # -7 jours passées, +14 jours futures
        reservation_date = datetime.now(timezone.utc) + timedelta(days=days_offset)
        
        reservations_data.append({
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "customer_id": customer["id"],
            "customer_name": f"{customer['first_name']} {customer['last_name']}",
            "customer_email": customer["email"],
            "customer_phone": customer["phone"],
            "date": reservation_date.date().isoformat(),
            "time": f"{random.randint(11, 21)}:{random.choice(['00', '15', '30', '45'])}",
            "guests": random.randint(2, 8),
            "status": random.choice(["pending", "confirmed", "completed", "cancelled"]) if days_offset < 0 else "pending",
            "notes": random.choice([None, "Table près de la fenêtre", "Anniversaire", "Chaise bébé nécessaire"]),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30))).isoformat()
        })
    
    await db.reservations.delete_many({"restaurant_id": restaurant_id})
    await db.reservations.insert_many(reservations_data)
    print(f"   ✅ {len(reservations_data)} réservations créées")
    
    # ========== 8. NOTIFICATIONS ==========
    print("\n🔔 Création des notifications...")
    
    notifications_data = []
    for order in random.sample(orders_data, min(30, len(orders_data))):
        notification_types = [
            ("order_preparing", "🍔 Commande en préparation", "Votre commande est en cours de préparation"),
            ("order_ready", "✅ Commande prête!", "Votre commande est prête à être récupérée"),
            ("order_delivering", "🚚 En livraison", "Votre commande est en cours de livraison"),
            ("order_completed", "🎊 Commande livrée!", "Votre commande a été livrée. Bon appétit!")
        ]
        
        notif_type, title, message = random.choice(notification_types)
        
        notifications_data.append({
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "customer_id": order["customer_id"],
            "order_id": order["id"],
            "type": notif_type,
            "title": title,
            "message": f"{message} - Commande {order['order_number']}",
            "is_read": random.choice([True, False]),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    await db.notifications.delete_many({"restaurant_id": restaurant_id})
    await db.notifications.insert_many(notifications_data)
    print(f"   ✅ {len(notifications_data)} notifications créées")
    
    # ========== STATISTIQUES FINALES ==========
    print("\n" + "="*60)
    print("✅ GÉNÉRATION TERMINÉE!")
    print("="*60)
    print(f"📁 Catégories:      {len(categories_data)}")
    print(f"⚙️  Options:         {len(options_data)}")
    print(f"📦 Produits:        {len(products_data)}")
    print(f"👥 Clients:         {len(customers_data)}")
    print(f"📦 Commandes:       {len(orders_data)}")
    print(f"🎉 Promotions:      {len(promos_data)}")
    print(f"📅 Réservations:    {len(reservations_data)}")
    print(f"🔔 Notifications:   {len(notifications_data)}")
    
    # Stats commandes
    print(f"\n📊 STATISTIQUES COMMANDES:")
    for status in statuses:
        count = len([o for o in orders_data if o['status'] == status])
        print(f"   {status}: {count}")
    
    # CA Total
    total_ca = sum(order['total'] for order in orders_data if order['status'] not in ['canceled'])
    today_orders = [o for o in orders_data if (datetime.now(timezone.utc) - datetime.fromisoformat(o['created_at'])).days == 0]
    today_ca = sum(order['total'] for order in today_orders)
    
    print(f"\n💰 CHIFFRE D'AFFAIRES:")
    print(f"   Total: {total_ca:.2f}€")
    print(f"   Aujourd'hui: {today_ca:.2f}€ ({len(today_orders)} commandes)")
    
    client.close()
    print("\n🎉 Base de données complète prête pour les tests!")

if __name__ == "__main__":
    asyncio.run(create_complete_test_data())

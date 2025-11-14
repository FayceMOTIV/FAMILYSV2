#!/usr/bin/env python3
"""
Script pour générer des données factices pour tester les IA de marketing et promotions
"""
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone
import random
import uuid

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import db

async def generate_test_orders():
    """Génère des commandes factices pour les 3 derniers mois"""
    print("🔄 Génération de commandes factices...")
    
    # Produits factices
    products = [
        {"id": str(uuid.uuid4()), "name": "Family's Original", "category": "burgers", "price": 9.00},
        {"id": str(uuid.uuid4()), "name": "Double Cheese", "category": "burgers", "price": 10.50},
        {"id": str(uuid.uuid4()), "name": "Bacon BBQ", "category": "burgers", "price": 11.00},
        {"id": str(uuid.uuid4()), "name": "Veggie Burger", "category": "burgers", "price": 8.50},
        {"id": str(uuid.uuid4()), "name": "Frites classiques", "category": "accompagnements", "price": 3.50},
        {"id": str(uuid.uuid4()), "name": "Onion Rings", "category": "accompagnements", "price": 4.00},
        {"id": str(uuid.uuid4()), "name": "Coca Cola", "category": "boissons", "price": 2.50},
        {"id": str(uuid.uuid4()), "name": "Sprite", "category": "boissons", "price": 2.50},
    ]
    
    # Clients factices
    customers = []
    for i in range(20):
        customers.append({
            "id": str(uuid.uuid4()),
            "name": f"Client Test {i+1}",
            "email": f"client{i+1}@test.com",
            "phone": f"06{random.randint(10000000, 99999999)}",
            "total_orders": 0,
            "total_spent": 0.0,
            "loyalty_points": 0.0,
            "last_order_date": None
        })
    
    # Générer 200 commandes sur 3 mois
    orders = []
    now = datetime.now(timezone.utc)
    
    for i in range(200):
        # Date aléatoire dans les 3 derniers mois
        days_ago = random.randint(0, 90)
        order_date = now - timedelta(days=days_ago)
        
        # Heures avec probabilité plus élevée à midi et soir
        hour_weights = [1] * 24
        hour_weights[11:14] = [5, 8, 5]  # Midi
        hour_weights[18:21] = [6, 10, 6]  # Soir
        hour = random.choices(range(24), weights=hour_weights)[0]
        order_date = order_date.replace(hour=hour, minute=random.randint(0, 59))
        
        # Sélectionner un client aléatoire
        customer = random.choice(customers)
        
        # Créer des items (1-4 produits)
        num_items = random.choices([1, 2, 3, 4], weights=[20, 40, 30, 10])[0]
        items = []
        total = 0
        
        for _ in range(num_items):
            product = random.choice(products)
            quantity = random.choices([1, 2], weights=[80, 20])[0]
            items.append({
                "product_id": product["id"],
                "product_name": product["name"],
                "quantity": quantity,
                "price": product["price"]
            })
            total += product["price"] * quantity
        
        order = {
            "id": str(uuid.uuid4()),
            "order_number": f"ORD{1000 + i}",
            "customer_id": customer["id"],
            "customer_name": customer["name"],
            "customer_email": customer["email"],
            "items": items,
            "total_amount": round(total, 2),
            "status": random.choices(
                ["completed", "cancelled", "completed", "completed"],
                weights=[70, 5, 15, 10]
            )[0],
            "payment_status": "paid" if random.random() > 0.1 else "pending",
            "payment_method": random.choice(["card", "cash", "card", "card"]),
            "order_type": random.choice(["takeaway", "delivery", "onsite"]),
            "created_at": order_date.isoformat(),
            "completed_at": (order_date + timedelta(minutes=random.randint(15, 45))).isoformat()
        }
        
        orders.append(order)
        
        # Mettre à jour les stats client
        if order["status"] == "completed":
            customer["total_orders"] += 1
            customer["total_spent"] += order["total_amount"]
            customer["loyalty_points"] += order["total_amount"] * 0.05
            if not customer["last_order_date"] or order_date > datetime.fromisoformat(customer["last_order_date"]):
                customer["last_order_date"] = order_date.isoformat()
    
    # Insérer dans la base de données
    try:
        # Supprimer les anciennes données de test
        await db.orders.delete_many({"order_number": {"$regex": "^ORD"}})
        await db.customers.delete_many({"email": {"$regex": "@test.com$"}})
        
        # Insérer les nouvelles données
        if customers:
            await db.customers.insert_many(customers)
        if orders:
            await db.orders.insert_many(orders)
        
        print(f"✅ {len(customers)} clients créés")
        print(f"✅ {len(orders)} commandes créées")
        print(f"📊 Période: {min(o['created_at'] for o in orders)} à {max(o['created_at'] for o in orders)}")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'insertion: {e}")

async def generate_promotion_usage():
    """Génère des données d'utilisation de promotions"""
    print("\n🔄 Génération de données d'utilisation de promotions...")
    
    # Récupérer les promotions existantes
    promotions = await db.promotions.find().to_list(length=None)
    
    if not promotions:
        print("⚠️  Aucune promotion trouvée. Veuillez d'abord créer des promotions.")
        return
    
    # Récupérer les commandes
    orders = await db.orders.find({"status": "completed"}).to_list(length=500)
    
    if not orders:
        print("⚠️  Aucune commande trouvée.")
        return
    
    usage_logs = []
    
    # Créer des logs d'utilisation pour ~30% des commandes
    for order in random.sample(orders, min(len(orders) // 3, 60)):
        promo = random.choice(promotions)
        
        # Calculer le discount
        discount_amount = order["total_amount"] * random.uniform(0.05, 0.25)
        
        usage_log = {
            "id": str(uuid.uuid4()),
            "promotion_id": promo["id"],
            "promotion_name": promo.get("name", "Promo"),
            "order_id": order["id"],
            "customer_id": order.get("customer_id"),
            "discount_amount": round(discount_amount, 2),
            "original_amount": order["total_amount"],
            "final_amount": round(order["total_amount"] - discount_amount, 2),
            "used_at": order["created_at"]
        }
        
        usage_logs.append(usage_log)
    
    try:
        # Supprimer les anciens logs de test
        await db.promotion_usage_log.delete_many({})
        
        if usage_logs:
            await db.promotion_usage_log.insert_many(usage_logs)
        
        print(f"✅ {len(usage_logs)} logs d'utilisation de promotions créés")
        
        # Mettre à jour les compteurs des promotions
        for promo in promotions:
            count = len([log for log in usage_logs if log["promotion_id"] == promo["id"]])
            total_discount = sum(log["discount_amount"] for log in usage_logs if log["promotion_id"] == promo["id"])
            
            await db.promotions.update_one(
                {"id": promo["id"]},
                {"$set": {
                    "usage_count": count,
                    "total_discount_given": round(total_discount, 2)
                }}
            )
        
        print("✅ Compteurs de promotions mis à jour")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'insertion: {e}")

async def generate_ai_campaigns():
    """Génère quelques campagnes AI de test"""
    print("\n🔄 Génération de campagnes IA factices...")
    
    campaigns = [
        {
            "id": str(uuid.uuid4()),
            "name": "Boost Burgers Happy Hour",
            "description": "Augmenter les ventes de burgers entre 15h-18h avec une remise attractive",
            "offer_type": "happy_hour",
            "suggested_discount": 15,
            "suggested_products": ["burgers"],
            "reasoning": "Analyse: Baisse de 30% des ventes entre 15h-18h. Happy Hour peut stimuler les ventes.",
            "confidence": 0.85,
            "potential_revenue": 450.00,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "BOGO Accompagnements Weekend",
            "description": "2 accompagnements pour le prix d'1 le weekend",
            "offer_type": "bogo",
            "suggested_discount": 50,
            "suggested_products": ["accompagnements"],
            "reasoning": "Les clients commandent souvent 1 seul accompagnement. BOGO peut augmenter la taille du panier.",
            "confidence": 0.78,
            "potential_revenue": 280.00,
            "status": "pending",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Réactivation Clients Inactifs",
            "description": "-20% pour clients n'ayant pas commandé depuis 30 jours",
            "offer_type": "reactivation",
            "suggested_discount": 20,
            "suggested_products": ["all"],
            "reasoning": "47 clients inactifs depuis plus de 30 jours. Réactivation ciblée.",
            "confidence": 0.72,
            "potential_revenue": 520.00,
            "status": "pending",
            "created_at": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
        }
    ]
    
    try:
        # Supprimer les anciennes campagnes de test
        await db.ai_campaigns.delete_many({"name": {"$regex": "^(Boost|BOGO|Réactivation)"}})
        
        if campaigns:
            await db.ai_campaigns.insert_many(campaigns)
        
        print(f"✅ {len(campaigns)} campagnes IA créées")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'insertion: {e}")

async def main():
    print("🚀 Génération de données de test pour les IA\n")
    print("=" * 50)
    
    await generate_test_orders()
    await generate_promotion_usage()
    await generate_ai_campaigns()
    
    print("\n" + "=" * 50)
    print("✅ Génération terminée!")
    print("\n💡 Vous pouvez maintenant tester:")
    print("   - L'IA Marketing (analyse des ventes)")
    print("   - Les promotions V2 (simulateur)")
    print("   - Les suggestions de campagnes")

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid

# Configuration MongoDB (même que database.py)
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "familys_restaurant"

async def insert_test_data():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print("🗑️  Nettoyage des anciennes données...")
    await db.categories.delete_many({})
    await db.products.delete_many({})
    
    # Catégories de test
    categories = [
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Burgers",
            "icon": "🍔",
            "order": 1,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Pizzas",
            "icon": "🍕",
            "order": 2,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Tacos",
            "icon": "🌮",
            "order": 3,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Desserts",
            "icon": "🍰",
            "order": 4,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Boissons",
            "icon": "🥤",
            "order": 5,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    # Insérer les catégories
    await db.categories.insert_many(categories)
    print(f"✅ {len(categories)} catégories insérées")
    
    # Produits de test
    products = [
        # Burgers
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Burger Deluxe",
            "category": "Burgers",
            "description": "Steak, fromage, bacon, sauce maison",
            "base_price": 12.90,
            "vat_rate": 10.0,
            "tags": ["bestseller"],
            "badge": "bestseller",
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Burger Classic",
            "category": "Burgers",
            "description": "Steak, salade, tomate, oignons",
            "base_price": 9.90,
            "vat_rate": 10.0,
            "tags": [],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Burger Poulet",
            "category": "Burgers",
            "description": "Poulet croustillant, sauce barbecue",
            "base_price": 10.90,
            "vat_rate": 10.0,
            "tags": ["new"],
            "badge": "nouveau",
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        # Pizzas
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Pizza Margherita",
            "category": "Pizzas",
            "description": "Sauce tomate, mozzarella, basilic",
            "base_price": 8.90,
            "vat_rate": 10.0,
            "tags": [],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Pizza 4 Fromages",
            "category": "Pizzas",
            "description": "Mozzarella, chèvre, emmental, bleu",
            "base_price": 11.90,
            "vat_rate": 10.0,
            "tags": ["bestseller"],
            "badge": "promo",
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Pizza Reine",
            "category": "Pizzas",
            "description": "Jambon, champignons, mozzarella",
            "base_price": 10.90,
            "vat_rate": 10.0,
            "tags": [],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        # Tacos
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Tacos Viande Hachée",
            "category": "Tacos",
            "description": "Viande hachée, fromage, sauce blanche",
            "base_price": 7.50,
            "vat_rate": 10.0,
            "tags": [],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Tacos Poulet",
            "category": "Tacos",
            "description": "Poulet grillé, fromage, sauce algérienne",
            "base_price": 7.50,
            "vat_rate": 10.0,
            "tags": ["new"],
            "badge": "nouveau",
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        # Desserts
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Tiramisu",
            "category": "Desserts",
            "description": "Dessert italien au café",
            "base_price": 5.50,
            "vat_rate": 10.0,
            "tags": ["bestseller"],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Fondant au Chocolat",
            "category": "Desserts",
            "description": "Coeur coulant au chocolat noir",
            "base_price": 6.50,
            "vat_rate": 10.0,
            "tags": [],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        # Boissons
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Coca-Cola 33cl",
            "category": "Boissons",
            "description": "Canette 33cl",
            "base_price": 2.50,
            "vat_rate": 10.0,
            "tags": [],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": "default",
            "name": "Eau Minérale 50cl",
            "category": "Boissons",
            "description": "Bouteille 50cl",
            "base_price": 2.00,
            "vat_rate": 10.0,
            "tags": [],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
    ]
    
    # Insérer les produits
    await db.products.insert_many(products)
    print(f"✅ {len(products)} produits insérés")
    
    client.close()
    print("\n🎉 Données de test insérées avec succès !")

if __name__ == "__main__":
    asyncio.run(insert_test_data())

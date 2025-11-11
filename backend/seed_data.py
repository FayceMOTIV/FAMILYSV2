"""
Script to seed initial data for Family's (products, categories, orders)
"""
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_data():
    """Seed initial data."""
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    restaurant_id = "familys-bourg-en-bresse"
    
    # Categories
    categories = [
        {
            "id": "burgers",
            "restaurant_id": restaurant_id,
            "name": "Burgers",
            "slug": "burgers",
            "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=400&fit=crop&q=80",
            "icon": "beef",
            "order": 0,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "tacos",
            "restaurant_id": restaurant_id,
            "name": "Tacos",
            "slug": "tacos",
            "image": "https://images.unsplash.com/photo-1683062332605-4e1209d75346?w=400&h=400&fit=crop&q=80",
            "icon": "wrap-text",
            "order": 1,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "desserts",
            "restaurant_id": restaurant_id,
            "name": "Desserts",
            "slug": "desserts",
            "image": "https://images.unsplash.com/photo-1644158776192-2d24ce35da1d?w=400&h=400&fit=crop&q=80",
            "icon": "cake",
            "order": 3,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Products
    products = [
        {
            "id": "burger-1",
            "restaurant_id": restaurant_id,
            "name": "Le King",
            "slug": "le-king",
            "category": "burgers",
            "description": "Notre burger signature : double steak haché frais, cheddar fondant, bacon croustillant",
            "base_price": 9.90,
            "vat_rate": 10.0,
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
            "tags": ["best-seller", "popular"],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "burger-2",
            "restaurant_id": restaurant_id,
            "name": "Family's Classic",
            "slug": "familys-classic",
            "category": "burgers",
            "description": "Le classique revisité : steak haché 180g, cheddar, tomates fraîches",
            "base_price": 7.90,
            "vat_rate": 10.0,
            "image_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80",
            "tags": ["popular"],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "taco-1",
            "restaurant_id": restaurant_id,
            "name": "Tacos Viande Hachée",
            "slug": "tacos-viande-hachee",
            "category": "tacos",
            "description": "Galette XXL, viande hachée épicée, fromage fondu, frites",
            "base_price": 8.50,
            "vat_rate": 10.0,
            "image_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
            "tags": ["best-seller"],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "dessert-1",
            "restaurant_id": restaurant_id,
            "name": "Tiramisu Nutella",
            "slug": "tiramisu-nutella",
            "category": "desserts",
            "description": "Tiramisu maison au Nutella, biscuits cuillère imbibés",
            "base_price": 4.50,
            "vat_rate": 5.5,
            "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80",
            "tags": ["best-seller"],
            "is_available": True,
            "is_out_of_stock": False,
            "option_groups": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert categories
    existing_cats = await db.categories.count_documents({"restaurant_id": restaurant_id})
    if existing_cats == 0:
        await db.categories.insert_many(categories)
        print(f"✅ {len(categories)} catégories ajoutées")
    else:
        print(f"ℹ️  Catégories déjà existantes")
    
    # Insert products
    existing_prods = await db.products.count_documents({"restaurant_id": restaurant_id})
    if existing_prods == 0:
        await db.products.insert_many(products)
        print(f"✅ {len(products)} produits ajoutés")
    else:
        print(f"ℹ️  Produits déjà existants")
    
    client.close()
    print("\n✅ Initialisation des données terminée!")

if __name__ == "__main__":
    asyncio.run(seed_data())

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
import uuid

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test_database")

async def create_complete_test_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    restaurant_id = "default"
    
    print("🧹 Nettoyage des anciennes données...")
    await db.product_options.delete_many({"restaurant_id": restaurant_id})
    await db.products.delete_many({"restaurant_id": restaurant_id})
    await db.categories.delete_many({"restaurant_id": restaurant_id})
    
    # ==================== CATÉGORIES ====================
    print("\n📁 Création des catégories...")
    categories = [
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🍔 Burgers",
            "description": "Nos délicieux burgers faits maison",
            "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
            "order": 1,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🥗 Salades",
            "description": "Salades fraîches et équilibrées",
            "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
            "order": 2,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🍟 Accompagnements",
            "description": "Pour compléter votre repas",
            "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
            "order": 3,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🥤 Boissons",
            "description": "Boissons fraîches et gourmandes",
            "image_url": "https://images.unsplash.com/photo-1546173159-315724a31696?w=400",
            "order": 4,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🍰 Desserts",
            "description": "Desserts gourmands pour terminer en beauté",
            "image_url": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
            "order": 5,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "restaurant_id": restaurant_id,
            "name": "🎁 Menus",
            "description": "Menus complets à prix avantageux",
            "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
            "order": 6,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.categories.insert_many(categories)
    print(f"✅ {len(categories)} catégories créées")
    
    # ==================== OPTIONS ====================
    print("\n🎛️ Création des options...")
    
    # Option 1: Taille (Choix unique, obligatoire)
    option_taille = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Taille",
        "description": "Choisissez votre taille",
        "type": "single",
        "is_required": True,
        "max_choices": None,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "Small", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Medium", "price": 2.0},
            {"id": str(uuid.uuid4()), "name": "Large", "price": 4.0}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Option 2: Sauces (Choix multiple, max 2, non obligatoire)
    option_sauces = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Sauces",
        "description": "Jusqu'à 2 sauces au choix",
        "type": "multiple",
        "is_required": False,
        "max_choices": 2,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "Ketchup", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Mayo", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Moutarde", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "BBQ", "price": 0.5},
            {"id": str(uuid.uuid4()), "name": "Samouraï", "price": 0.5},
            {"id": str(uuid.uuid4()), "name": "Algérienne", "price": 0.5}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Option 3: Accompagnement (Choix unique, obligatoire)
    option_accompagnement = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Accompagnement",
        "description": "Choisissez votre accompagnement",
        "type": "single",
        "is_required": True,
        "max_choices": None,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "Frites", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Salade", "price": 1.0},
            {"id": str(uuid.uuid4()), "name": "Potatoes", "price": 1.5},
            {"id": str(uuid.uuid4()), "name": "Onion Rings", "price": 2.0}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Option 4: Cuisson viande (Choix unique, obligatoire)
    option_cuisson = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Cuisson",
        "description": "Comment souhaitez-vous votre viande ?",
        "type": "single",
        "is_required": True,
        "max_choices": None,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "Saignant", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "À point", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Bien cuit", "price": 0.0}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Option 5: Suppléments burger (Choix multiple, max 3, non obligatoire)
    option_supplements = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Suppléments",
        "description": "Personnalisez votre burger (max 3)",
        "type": "multiple",
        "is_required": False,
        "max_choices": 3,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "Fromage extra", "price": 1.0},
            {"id": str(uuid.uuid4()), "name": "Bacon", "price": 1.5},
            {"id": str(uuid.uuid4()), "name": "Œuf", "price": 1.0},
            {"id": str(uuid.uuid4()), "name": "Avocat", "price": 2.0},
            {"id": str(uuid.uuid4()), "name": "Champignons", "price": 1.0},
            {"id": str(uuid.uuid4()), "name": "Oignons caramélisés", "price": 1.0}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Option 6: Boisson (Choix unique, obligatoire pour menus)
    option_boisson = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Boisson",
        "description": "Choisissez votre boisson",
        "type": "single",
        "is_required": True,
        "max_choices": None,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "Coca-Cola", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Coca-Cola Zero", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Sprite", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Fanta Orange", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Ice Tea", "price": 0.5},
            {"id": str(uuid.uuid4()), "name": "Eau minérale", "price": 0.0}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Option 7: Dessert (Choix unique, obligatoire pour menus)
    option_dessert = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Dessert",
        "description": "Choisissez votre dessert",
        "type": "single",
        "is_required": True,
        "max_choices": None,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "Brownie", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Tiramisu", "price": 1.0},
            {"id": str(uuid.uuid4()), "name": "Mousse au chocolat", "price": 1.0},
            {"id": str(uuid.uuid4()), "name": "Tarte aux pommes", "price": 1.0}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Option 8: Assaisonnement salade (Choix unique, non obligatoire)
    option_assaisonnement = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Assaisonnement",
        "description": "Sauce pour votre salade",
        "type": "single",
        "is_required": False,
        "max_choices": None,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "Vinaigrette", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "César", "price": 0.5},
            {"id": str(uuid.uuid4()), "name": "Miel & Moutarde", "price": 0.5},
            {"id": str(uuid.uuid4()), "name": "Balsamique", "price": 0.5}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Option 9: Taille boisson (Choix unique, obligatoire)
    option_taille_boisson = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Taille boisson",
        "description": "Format de votre boisson",
        "type": "single",
        "is_required": True,
        "max_choices": None,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "33cl", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "50cl", "price": 1.0},
            {"id": str(uuid.uuid4()), "name": "1L", "price": 2.0}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Option 10: Sans allergènes (Choix multiple, non obligatoire)
    option_sans = {
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "name": "Restrictions alimentaires",
        "description": "Indiquez vos restrictions",
        "type": "multiple",
        "is_required": False,
        "max_choices": 5,
        "price": 0.0,
        "choices": [
            {"id": str(uuid.uuid4()), "name": "Sans gluten", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Sans lactose", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Sans oignon", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Sans cornichon", "price": 0.0},
            {"id": str(uuid.uuid4()), "name": "Sans tomate", "price": 0.0}
        ],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    options = [
        option_taille, option_sauces, option_accompagnement, option_cuisson,
        option_supplements, option_boisson, option_dessert, option_assaisonnement,
        option_taille_boisson, option_sans
    ]
    
    await db.product_options.insert_many(options)
    print(f"✅ {len(options)} options créées:")
    for opt in options:
        print(f"   - {opt['name']} ({opt['type']}, {len(opt['choices'])} choix)")
    
    # ==================== PRODUITS ====================
    print("\n🍔 Création des produits...")
    
    # Récupérer les IDs des catégories
    cat_burgers = [c for c in categories if "Burgers" in c["name"]][0]
    cat_salades = [c for c in categories if "Salades" in c["name"]][0]
    cat_accompagnements = [c for c in categories if "Accompagnements" in c["name"]][0]
    cat_boissons = [c for c in categories if "Boissons" in c["name"]][0]
    cat_desserts = [c for c in categories if "Desserts" in c["name"]][0]
    cat_menus = [c for c in categories if "Menus" in c["name"]][0]
    
    products = []
    
    # === BURGERS ===
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_burgers["id"],
        "name": "Burger Classic",
        "description": "Steak haché 150g, cheddar, salade, tomate, oignons",
        "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        "price": 8.50,
        "is_available": True,
        "option_ids": [option_cuisson["id"], option_sauces["id"], option_supplements["id"], option_sans["id"]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_burgers["id"],
        "name": "Burger Bacon",
        "description": "Steak haché 150g, bacon croustillant, cheddar, salade, sauce BBQ",
        "image_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
        "price": 10.50,
        "is_available": True,
        "option_ids": [option_cuisson["id"], option_sauces["id"], option_supplements["id"], option_sans["id"]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_burgers["id"],
        "name": "Burger Végétarien",
        "description": "Steak végétal, avocat, tomates, salade, oignons rouges",
        "image_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
        "price": 9.50,
        "is_available": True,
        "option_ids": [option_sauces["id"], option_supplements["id"], option_sans["id"]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # === SALADES ===
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_salades["id"],
        "name": "Salade César",
        "description": "Poulet grillé, parmesan, croûtons, sauce césar",
        "image_url": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
        "price": 7.50,
        "is_available": True,
        "option_ids": [option_assaisonnement["id"]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_salades["id"],
        "name": "Salade Chèvre Chaud",
        "description": "Fromage de chèvre, tomates, miel, noix",
        "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        "price": 8.50,
        "is_available": True,
        "option_ids": [option_assaisonnement["id"]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # === ACCOMPAGNEMENTS ===
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_accompagnements["id"],
        "name": "Frites",
        "description": "Frites fraîches maison",
        "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
        "price": 3.50,
        "is_available": True,
        "option_ids": [option_taille["id"], option_sauces["id"]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_accompagnements["id"],
        "name": "Nuggets",
        "description": "6 pièces de poulet pané croustillant",
        "image_url": "https://images.unsplash.com/photo-1562967914-608f82629710?w=400",
        "price": 5.50,
        "is_available": True,
        "option_ids": [option_sauces["id"]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_accompagnements["id"],
        "name": "Onion Rings",
        "description": "Rondelles d'oignons panés",
        "image_url": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400",
        "price": 4.50,
        "is_available": True,
        "option_ids": [option_sauces["id"]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # === BOISSONS ===
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_boissons["id"],
        "name": "Coca-Cola",
        "description": "Boisson gazeuse rafraîchissante",
        "image_url": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
        "price": 2.50,
        "is_available": True,
        "option_ids": [option_taille_boisson["id"]],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_boissons["id"],
        "name": "Milkshake Vanille",
        "description": "Milkshake onctueux à la vanille",
        "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
        "price": 4.50,
        "is_available": True,
        "option_ids": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # === DESSERTS ===
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_desserts["id"],
        "name": "Brownie",
        "description": "Brownie chocolat fait maison",
        "image_url": "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400",
        "price": 3.50,
        "is_available": True,
        "option_ids": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_desserts["id"],
        "name": "Tiramisu",
        "description": "Tiramisu italien traditionnel",
        "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
        "price": 4.50,
        "is_available": True,
        "option_ids": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # === MENUS ===
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_menus["id"],
        "name": "Menu Classic",
        "description": "Burger Classic + Accompagnement + Boisson + Dessert",
        "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
        "price": 15.90,
        "is_available": True,
        "option_ids": [
            option_cuisson["id"], 
            option_accompagnement["id"], 
            option_boisson["id"], 
            option_dessert["id"],
            option_sauces["id"]
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    products.append({
        "id": str(uuid.uuid4()),
        "restaurant_id": restaurant_id,
        "category_id": cat_menus["id"],
        "name": "Menu Végétarien",
        "description": "Burger Végétarien + Accompagnement + Boisson + Dessert",
        "image_url": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400",
        "price": 16.90,
        "is_available": True,
        "option_ids": [
            option_accompagnement["id"], 
            option_boisson["id"], 
            option_dessert["id"],
            option_sauces["id"]
        ],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    await db.products.insert_many(products)
    print(f"✅ {len(products)} produits créés")
    
    # Résumé
    print("\n" + "="*60)
    print("✅ DONNÉES DE TEST COMPLÈTES CRÉÉES!")
    print("="*60)
    print(f"\n📊 Résumé:")
    print(f"   - {len(categories)} catégories")
    print(f"   - {len(options)} options (avec {sum(len(opt['choices']) for opt in options)} choix au total)")
    print(f"   - {len(products)} produits")
    
    print(f"\n🎛️ Types d'options créées:")
    print(f"   - Choix unique obligatoire: {len([o for o in options if o['type']=='single' and o['is_required']])}")
    print(f"   - Choix unique optionnel: {len([o for o in options if o['type']=='single' and not o['is_required']])}")
    print(f"   - Choix multiple: {len([o for o in options if o['type']=='multiple'])}")
    
    print(f"\n📦 Produits par catégorie:")
    for cat in categories:
        count = len([p for p in products if p['category_id'] == cat['id']])
        print(f"   - {cat['name']}: {count} produits")
    
    client.close()
    print("\n✨ Prêt à tester!")

if __name__ == "__main__":
    asyncio.run(create_complete_test_data())

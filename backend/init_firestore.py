"""
Initialise les collections Firestore avec les données de base
"""
from firebase_config import db
from google.cloud.firestore import SERVER_TIMESTAMP

print("🔥 Initialisation des collections Firestore...")

# 1. SETTINGS - Configuration du restaurant
settings_data = {
    "name": "Le Family's",
    "email": "lefamilys01@gmail.com",
    "phone": "04 74 52 60 82",
    "address": "59 rue du 14 Juillet 1789",
    "city": "Bourg-en-Bresse",
    "postal_code": "01000",
    "country": "France",
    "primary_color": "#C62828",
    "secondary_color": "#FFD54F",
    "logo_url": None,
    "hero_image_url": None,
    "opening_hours": {
        "monday": {"closed": True},
        "tuesday": {"slots": [{"open": "11:30", "close": "14:00"}, {"open": "18:00", "close": "00:00"}]},
        "wednesday": {"slots": [{"open": "11:30", "close": "14:00"}, {"open": "18:00", "close": "00:00"}]},
        "thursday": {"slots": [{"open": "11:30", "close": "14:00"}, {"open": "18:00", "close": "00:00"}]},
        "friday": {"slots": [{"open": "11:30", "close": "14:00"}, {"open": "18:00", "close": "00:00"}]},
        "saturday": {"slots": [{"open": "11:30", "close": "14:00"}, {"open": "18:00", "close": "00:00"}]},
        "sunday": {"slots": [{"open": "11:30", "close": "14:00"}, {"open": "18:00", "close": "00:00"}]}
    },
    "order_hours": {
        "monday": {"disabled": True},
        "tuesday": {"slots": [{"start": "11:30", "end": "13:45"}, {"start": "18:00", "end": "23:45"}]},
        "wednesday": {"slots": [{"start": "11:30", "end": "13:45"}, {"start": "18:00", "end": "23:45"}]},
        "thursday": {"slots": [{"start": "11:30", "end": "13:45"}, {"start": "18:00", "end": "23:45"}]},
        "friday": {"slots": [{"start": "11:30", "end": "13:45"}, {"start": "18:00", "end": "23:45"}]},
        "saturday": {"slots": [{"start": "11:30", "end": "13:45"}, {"start": "18:00", "end": "23:45"}]},
        "sunday": {"slots": [{"start": "11:30", "end": "13:45"}, {"start": "18:00", "end": "23:45"}]}
    },
    "loyalty_percentage": 5.0,
    "enable_delivery": True,
    "enable_takeaway": True,
    "enable_onsite": True,
    "is_paused": False,
    "preparation_time_minutes": 15,
    "order_cutoff_minutes": 15,
    "updated_at": SERVER_TIMESTAMP
}

db.collection("settings").document("restaurant").set(settings_data)
print("✅ Collection 'settings' créée")

# 2. Créer une catégorie de test
category_data = {
    "name": "Burgers",
    "description": "Nos délicieux burgers maison",
    "icon": "🍔",
    "image_url": None,
    "display_order": 1,
    "is_active": True,
    "created_at": SERVER_TIMESTAMP,
    "updated_at": SERVER_TIMESTAMP
}
cat_ref = db.collection("categories").document()
cat_ref.set(category_data)
print(f"✅ Collection 'categories' créée (ID: {cat_ref.id})")

# 3. Créer un produit de test
product_data = {
    "name": "Burger Classic",
    "description": "Steak haché, salade, tomate, oignon, sauce maison",
    "category_id": cat_ref.id,
    "category_name": "Burgers",
    "base_price": 8.90,
    "image_url": None,
    "is_available": True,
    "is_out_of_stock": False,
    "display_order": 1,
    "tags": ["populaire"],
    "badge": "bestseller",
    "option_groups": [],
    "created_at": SERVER_TIMESTAMP,
    "updated_at": SERVER_TIMESTAMP
}
prod_ref = db.collection("products").document()
prod_ref.set(product_data)
print(f"✅ Collection 'products' créée (ID: {prod_ref.id})")

# 4. Collections vides (structure)
print("✅ Collections prêtes: customers, orders, promotions, popups")

print("\n🎉 Firestore initialisé avec succès !")
print("\n📊 Vérifie dans la console Firebase:")
print("   https://console.firebase.google.com/project/family-2026/firestore")

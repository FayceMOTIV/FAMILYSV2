#!/usr/bin/env python3
"""
Script pour ajouter des choix à la bibliothèque Firebase
Usage: python3 add_choices_to_library.py
"""

import requests

API_URL = "http://localhost:8000"

# Liste des choix à ajouter
choices_to_add = [
    # === SAUCES (gratuites) ===
    {"name": "Ketchup", "default_price": 0, "description": "Sauce"},
    {"name": "Mayo", "default_price": 0, "description": "Sauce"},
    {"name": "Moutarde", "default_price": 0, "description": "Sauce"},
    {"name": "Burger", "default_price": 0, "description": "Sauce"},
    {"name": "Algérienne", "default_price": 0, "description": "Sauce"},
    {"name": "Barbecue", "default_price": 0, "description": "Sauce"},
    {"name": "Samouraï", "default_price": 0, "description": "Sauce"},
    {"name": "Blanche", "default_price": 0, "description": "Sauce"},
    {"name": "Tartare", "default_price": 0, "description": "Sauce"},
    {"name": "Chili Thaï", "default_price": 0, "description": "Sauce"},
    {"name": "Andalouse", "default_price": 0, "description": "Sauce"},
    {"name": "Fish", "default_price": 0, "description": "Sauce"},
    {"name": "Harissa", "default_price": 0, "description": "Sauce"},
    {"name": "Curry", "default_price": 0, "description": "Sauce"},
    {"name": "Américaine", "default_price": 0, "description": "Sauce"},
    
    # === GRATINAGES (supplément) ===
    {"name": "Gratinage Emmental", "default_price": 1.00, "description": "Supplément fromage"},
    {"name": "Gratinage Chèvre", "default_price": 1.00, "description": "Supplément fromage"},
    {"name": "Gratinage Mozzarella", "default_price": 1.00, "description": "Supplément fromage"},
    {"name": "Gratinage Reblochon", "default_price": 1.50, "description": "Supplément fromage"},
    
    # === SAUCES FROMAGE (supplément) ===
    {"name": "Sauce Cheddar Maison", "default_price": 1.00, "description": "Sauce fromage"},
    {"name": "Sauce Gruyère Maison", "default_price": 1.00, "description": "Sauce fromage"},
    
    # === VIANDES (supplément) ===
    {"name": "Viande Hachée", "default_price": 2.00, "description": "Supplément viande"},
    {"name": "Escalope de Poulet", "default_price": 2.50, "description": "Supplément viande"},
    {"name": "Kebab", "default_price": 2.50, "description": "Supplément viande"},
    {"name": "Merguez", "default_price": 2.00, "description": "Supplément viande"},
    {"name": "Tenders", "default_price": 2.50, "description": "Supplément viande"},
    {"name": "Cordon Bleu", "default_price": 3.00, "description": "Supplément viande"},
]

def add_choice(choice):
    """Ajoute un choix à la bibliothèque"""
    try:
        response = requests.post(
            f"{API_URL}/api/v1/fb/choice-library",
            json=choice
        )
        if response.status_code in [200, 201]:
            print(f"✅ Ajouté: {choice['name']} ({choice['default_price']}€)")
            return True
        elif response.status_code == 409 or "already exists" in response.text.lower():
            print(f"⏭️  Existe déjà: {choice['name']}")
            return True
        else:
            print(f"❌ Erreur pour {choice['name']}: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur pour {choice['name']}: {e}")
        return False

def main():
    print("=" * 50)
    print("📚 Ajout des choix à la bibliothèque Firebase")
    print("=" * 50)
    print(f"API: {API_URL}")
    print(f"Nombre de choix à ajouter: {len(choices_to_add)}")
    print("=" * 50)
    
    success = 0
    failed = 0
    
    for choice in choices_to_add:
        if add_choice(choice):
            success += 1
        else:
            failed += 1
    
    print("=" * 50)
    print(f"✅ Réussis: {success}")
    print(f"❌ Échoués: {failed}")
    print("=" * 50)
    
    if failed == 0:
        print("🎉 Tous les choix ont été ajoutés avec succès!")
    else:
        print("⚠️  Certains choix n'ont pas pu être ajoutés")

if __name__ == "__main__":
    main()

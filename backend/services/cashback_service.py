"""
Service pour gérer le système de cashback Family's
"""
from typing import Dict, Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get('DB_NAME', 'test_database')]


async def get_settings():
    """Récupérer les settings du restaurant"""
    settings = await db.settings.find_one({"restaurant_id": "family_restaurant_01"})
    if not settings:
        # Valeurs par défaut
        return {
            "loyalty_percentage": 5.0,
            "loyalty_exclude_promos_from_calculation": False
        }
    return settings


async def calculate_cashback_earned(
    subtotal: float,
    total_after_promos: float,
    promo_discount: float = 0.0
) -> float:
    """
    Calculer le cashback gagné sur une commande
    
    Args:
        subtotal: Total avant promos
        total_after_promos: Total après application des promos
        promo_discount: Montant total des réductions appliquées
    
    Returns:
        Montant de cashback en €
    """
    settings = await get_settings()
    loyalty_percentage = settings.get("loyalty_percentage", 5.0)
    exclude_promos = settings.get("loyalty_exclude_promos_from_calculation", False)
    
    # Base de calcul : avant ou après promos selon paramètre
    if exclude_promos:
        base_amount = subtotal  # Avant promos
    else:
        base_amount = total_after_promos  # Après promos (défaut)
    
    # Calculer le cashback
    cashback = (base_amount * loyalty_percentage) / 100.0
    
    # Arrondir à 2 décimales
    return round(cashback, 2)


async def calculate_cashback_to_use(
    customer_id: str,
    order_total: float
) -> Dict[str, float]:
    """
    Calculer combien de cashback le client peut utiliser (logique "tout ou rien")
    
    Args:
        customer_id: ID du client
        order_total: Total de la commande
    
    Returns:
        Dict avec cashback_available, cashback_to_use, remaining_to_pay
    """
    # Récupérer le solde du client
    customer = await db.customers.find_one({"id": customer_id})
    
    if not customer:
        return {
            "cashback_available": 0.0,
            "cashback_to_use": 0.0,
            "remaining_to_pay": order_total
        }
    
    cashback_available = customer.get("loyalty_points", 0.0)
    
    # Logique "tout ou rien" : on utilise ce dont on a besoin, pas plus
    if cashback_available >= order_total:
        # Le cashback couvre tout
        cashback_to_use = order_total
        remaining_to_pay = 0.0
    else:
        # Le cashback ne couvre qu'une partie
        cashback_to_use = cashback_available
        remaining_to_pay = order_total - cashback_available
    
    return {
        "cashback_available": round(cashback_available, 2),
        "cashback_to_use": round(cashback_to_use, 2),
        "remaining_to_pay": round(remaining_to_pay, 2)
    }


async def deduct_cashback_from_customer(
    customer_id: str,
    amount: float
) -> Dict[str, any]:
    """
    Déduire le cashback du solde du client
    
    Args:
        customer_id: ID du client
        amount: Montant à déduire
    
    Returns:
        Dict avec success, old_balance, new_balance
    """
    customer = await db.customers.find_one({"id": customer_id})
    
    if not customer:
        raise ValueError("Client non trouvé")
    
    old_balance = customer.get("loyalty_points", 0.0)
    
    if old_balance < amount:
        raise ValueError(f"Solde insuffisant. Disponible: {old_balance}€, demandé: {amount}€")
    
    new_balance = old_balance - amount
    
    # Mettre à jour le solde
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": {"loyalty_points": round(new_balance, 2)}}
    )
    
    return {
        "success": True,
        "old_balance": round(old_balance, 2),
        "new_balance": round(new_balance, 2),
        "amount_deducted": round(amount, 2)
    }


async def add_cashback_to_customer(
    customer_id: str,
    amount: float
) -> Dict[str, any]:
    """
    Ajouter du cashback au solde du client
    
    Args:
        customer_id: ID du client
        amount: Montant à ajouter
    
    Returns:
        Dict avec success, old_balance, new_balance
    """
    customer = await db.customers.find_one({"id": customer_id})
    
    if not customer:
        raise ValueError("Client non trouvé")
    
    old_balance = customer.get("loyalty_points", 0.0)
    new_balance = old_balance + amount
    
    # Mettre à jour le solde
    await db.customers.update_one(
        {"id": customer_id},
        {"$set": {"loyalty_points": round(new_balance, 2)}}
    )
    
    return {
        "success": True,
        "old_balance": round(old_balance, 2),
        "new_balance": round(new_balance, 2),
        "amount_added": round(amount, 2)
    }


async def get_cashback_preview(
    customer_id: Optional[str],
    subtotal: float,
    total_after_promos: float,
    promo_discount: float = 0.0,
    use_cashback: bool = False
) -> Dict:
    """
    Prévisualiser le cashback pour une commande (avant validation)
    Utilisé dans le panier pour afficher les infos au client
    
    Returns:
        Dict avec toutes les infos nécessaires pour l'affichage
    """
    # Calculer le cashback qui sera gagné
    cashback_earned = await calculate_cashback_earned(
        subtotal,
        total_after_promos,
        promo_discount
    )
    
    result = {
        "cashback_earned": cashback_earned,
        "cashback_available": 0.0,
        "cashback_to_use": 0.0,
        "remaining_to_pay": total_after_promos,
        "new_balance_after_order": 0.0
    }
    
    if customer_id:
        customer = await db.customers.find_one({"id": customer_id})
        if customer:
            cashback_available = customer.get("loyalty_points", 0.0)
            result["cashback_available"] = round(cashback_available, 2)
            
            if use_cashback:
                # Calculer combien sera utilisé
                cashback_calc = await calculate_cashback_to_use(
                    customer_id,
                    total_after_promos
                )
                result["cashback_to_use"] = cashback_calc["cashback_to_use"]
                result["remaining_to_pay"] = cashback_calc["remaining_to_pay"]
                
                # Nouveau solde estimé après commande
                new_balance = cashback_available - cashback_calc["cashback_to_use"] + cashback_earned
                result["new_balance_after_order"] = round(new_balance, 2)
            else:
                # Pas d'utilisation du cashback, juste gain
                new_balance = cashback_available + cashback_earned
                result["new_balance_after_order"] = round(new_balance, 2)
    
    return result

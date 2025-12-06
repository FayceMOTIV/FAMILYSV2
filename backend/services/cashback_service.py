"""
Service de gestion du cashback et de la fidélité client
"""
from database import db
from datetime import datetime, timezone


async def get_settings():
    """
    Récupère les paramètres du restaurant
    """
    settings = await db.settings.find_one({"restaurant_id": "default"})
    if not settings:
        # Paramètres par défaut
        return {
            "loyalty_percentage": 5.0,  # 5% de cashback
            "min_order_for_loyalty": 0,  # Pas de minimum
            "loyalty_enabled": True
        }
    return settings


async def calculate_cashback_earned(subtotal: float, total_after_promos: float = None) -> float:
    """
    Calcule le cashback gagné sur une commande
    
    Args:
        subtotal: Sous-total avant promos
        total_after_promos: Total après promos (si différent)
    
    Returns:
        Montant de cashback gagné
    """
    settings = await get_settings()
    
    if not settings.get("loyalty_enabled", True):
        return 0.0
    
    loyalty_percentage = settings.get("loyalty_percentage", 5.0)
    min_order = settings.get("min_order_for_loyalty", 0)
    
    # Utiliser le montant après promos si disponible
    base_amount = total_after_promos if total_after_promos is not None else subtotal
    
    # Vérifier le minimum de commande
    if base_amount < min_order:
        return 0.0
    
    # Calculer le cashback
    cashback = base_amount * (loyalty_percentage / 100)
    
    # Arrondir à 2 décimales
    return round(cashback, 2)


async def get_customer_balance(customer_id: str) -> float:
    """
    Récupère le solde cashback d'un client
    """
    customer = await db.customers.find_one({"id": customer_id})
    if not customer:
        return 0.0
    
    return customer.get("cashback_balance", 0.0)


async def get_customer_balance_by_email(email: str) -> float:
    """
    Récupère le solde cashback d'un client par email
    """
    customer = await db.customers.find_one({"email": email})
    if not customer:
        return 0.0
    
    return customer.get("cashback_balance", 0.0)


async def calculate_cashback_to_use(customer_id: str, order_total: float) -> dict:
    """
    Calcule combien de cashback peut être utilisé pour une commande
    
    Returns:
        {
            "available_balance": float,
            "cashback_to_use": float,
            "remaining_to_pay": float
        }
    """
    balance = await get_customer_balance(customer_id)
    
    # Le cashback utilisable est le minimum entre le solde et le total
    cashback_to_use = min(balance, order_total)
    remaining_to_pay = max(0, order_total - cashback_to_use)
    
    return {
        "available_balance": balance,
        "cashback_to_use": round(cashback_to_use, 2),
        "remaining_to_pay": round(remaining_to_pay, 2)
    }


async def add_cashback_to_customer(customer_id: str, amount: float) -> dict:
    """
    Ajoute du cashback au compte d'un client
    
    Returns:
        {"success": bool, "new_balance": float}
    """
    if amount <= 0:
        return {"success": False, "new_balance": 0, "error": "Amount must be positive"}
    
    try:
        # Mettre à jour le solde
        result = await db.customers.update_one(
            {"id": customer_id},
            {
                "$inc": {"cashback_balance": amount},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        
        if result.modified_count == 0:
            return {"success": False, "new_balance": 0, "error": "Customer not found"}
        
        # Récupérer le nouveau solde
        customer = await db.customers.find_one({"id": customer_id})
        new_balance = customer.get("cashback_balance", 0.0)
        
        # Enregistrer la transaction
        await db.cashback_transactions.insert_one({
            "customer_id": customer_id,
            "type": "credit",
            "amount": amount,
            "balance_after": new_balance,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "new_balance": round(new_balance, 2)}
        
    except Exception as e:
        print(f"Error adding cashback: {e}")
        return {"success": False, "new_balance": 0, "error": str(e)}


async def deduct_cashback_from_customer(customer_id: str, amount: float) -> dict:
    """
    Déduit du cashback du compte d'un client
    
    Returns:
        {"success": bool, "new_balance": float}
    """
    if amount <= 0:
        return {"success": False, "new_balance": 0, "error": "Amount must be positive"}
    
    try:
        # Vérifier le solde actuel
        balance = await get_customer_balance(customer_id)
        
        if balance < amount:
            return {"success": False, "new_balance": balance, "error": "Insufficient balance"}
        
        # Déduire le montant
        result = await db.customers.update_one(
            {"id": customer_id},
            {
                "$inc": {"cashback_balance": -amount},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        
        if result.modified_count == 0:
            return {"success": False, "new_balance": balance, "error": "Customer not found"}
        
        # Récupérer le nouveau solde
        customer = await db.customers.find_one({"id": customer_id})
        new_balance = customer.get("cashback_balance", 0.0)
        
        # Enregistrer la transaction
        await db.cashback_transactions.insert_one({
            "customer_id": customer_id,
            "type": "debit",
            "amount": amount,
            "balance_after": new_balance,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "new_balance": round(new_balance, 2)}
        
    except Exception as e:
        print(f"Error deducting cashback: {e}")
        return {"success": False, "new_balance": 0, "error": str(e)}


async def get_cashback_preview(customer_email: str, order_total: float) -> dict:
    """
    Prévisualisation du cashback pour une commande
    
    Returns:
        {
            "current_balance": float,
            "can_use": float,
            "will_earn": float,
            "new_balance_after": float
        }
    """
    # Récupérer le client
    customer = await db.customers.find_one({"email": customer_email})
    
    current_balance = 0.0
    customer_id = None
    
    if customer:
        current_balance = customer.get("cashback_balance", 0.0)
        customer_id = customer.get("id")
    
    # Calcul du cashback utilisable
    can_use = min(current_balance, order_total)
    
    # Calcul du cashback qui sera gagné
    remaining_after_use = order_total - can_use
    will_earn = await calculate_cashback_earned(order_total, remaining_after_use)
    
    # Nouveau solde estimé (si utilisation + gain)
    new_balance_after = current_balance - can_use + will_earn
    
    return {
        "current_balance": round(current_balance, 2),
        "can_use": round(can_use, 2),
        "will_earn": round(will_earn, 2),
        "new_balance_after": round(new_balance_after, 2)
    }


async def get_customer_transactions(customer_id: str, limit: int = 20) -> list:
    """
    Récupère l'historique des transactions cashback d'un client
    """
    transactions = await db.cashback_transactions.find(
        {"customer_id": customer_id}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    for t in transactions:
        t.pop("_id", None)
    
    return transactions

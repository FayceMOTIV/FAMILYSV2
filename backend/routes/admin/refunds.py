from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime, timezone
from database import db

router = APIRouter(prefix="/orders", tags=["admin-refunds"])

class MissingItemsRequest(BaseModel):
    missing_item_indices: List[int]  # Indices des items manquants dans l'order.items
    reason: str = "Produit manquant"

@router.post("/{order_id}/refund-missing-items")
async def refund_missing_items(
    order_id: str,
    request: MissingItemsRequest
):
    """
    Marque des items comme manquants et crédite le montant sur la carte de fidélité du client.
    """
    try:
        # Récupérer la commande
        order = await db.orders.find_one({"id": order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Commande non trouvée")
        
        # Vérifier que le paiement a été fait en CB
        if order.get("payment_method") != "card":
            raise HTTPException(
                status_code=400, 
                detail="Le remboursement automatique n'est possible que pour les paiements par carte"
            )
        
        # Calculer le montant à rembourser
        refund_amount = 0
        items = order.get("items", [])
        missing_items_details = []
        
        for index in request.missing_item_indices:
            if index < len(items):
                item = items[index]
                refund_amount += item.get("total_price", 0)
                missing_items_details.append({
                    "name": item.get("name"),
                    "quantity": item.get("quantity"),
                    "price": item.get("total_price")
                })
                # Marquer l'item comme manquant
                items[index]["is_missing"] = True
        
        if refund_amount == 0:
            raise HTTPException(status_code=400, detail="Aucun montant à rembourser")
        
        # Récupérer le client
        customer_email = order.get("customer_email")
        if not customer_email:
            raise HTTPException(status_code=400, detail="Client non identifié")
        
        customer = await db.users.find_one({"email": customer_email})
        if not customer:
            raise HTTPException(status_code=404, detail="Client non trouvé")
        
        # Créditer la carte de fidélité
        current_points = customer.get("loyalty_points", 0)
        new_points = current_points + refund_amount
        
        await db.users.update_one(
            {"email": customer_email},
            {
                "$set": {
                    "loyalty_points": new_points,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Mettre à jour la commande
        await db.orders.update_one(
            {"id": order_id},
            {
                "$set": {
                    "items": items,
                    "refund_amount": refund_amount,
                    "refund_reason": request.reason,
                    "refunded_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Créer une transaction de fidélité
        await db.loyalty_transactions.insert_one({
            "user_email": customer_email,
            "type": "credit",
            "amount": refund_amount,
            "reason": f"Remboursement commande #{order.get('order_number')} - {request.reason}",
            "order_id": order_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "success": True,
            "refund_amount": refund_amount,
            "new_loyalty_points": new_points,
            "missing_items": missing_items_details,
            "message": f"Avoir de {refund_amount:.2f}€ crédité sur la carte de fidélité"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

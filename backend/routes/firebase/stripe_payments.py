"""
Routes de paiement Stripe pour FAMILYS-CLEAN
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
import os
import stripe
from firebase_admin import firestore

router = APIRouter(prefix="/payments", tags=["Payments"])

# Initialiser Stripe avec la clé secrète depuis .env
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

db = firestore.client()


class PaymentIntentRequest(BaseModel):
    amount: float  # En euros
    currency: str = "eur"
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    order_id: Optional[str] = None
    metadata: Optional[dict] = None


class PaymentConfirmRequest(BaseModel):
    payment_intent_id: str
    order_id: str


# ============================================
# CRÉER UN PAYMENT INTENT
# ============================================
@router.post("/create-intent")
async def create_payment_intent(request: PaymentIntentRequest):
    """
    Crée un PaymentIntent Stripe pour le paiement
    Appelé par l'app mobile avant d'afficher le formulaire de paiement
    """
    try:
        if not stripe.api_key:
            raise HTTPException(
                status_code=500, 
                detail="Stripe n'est pas configuré. Ajoutez STRIPE_SECRET_KEY dans le fichier .env"
            )
        
        # Convertir euros en centimes
        amount_cents = int(request.amount * 100)
        
        if amount_cents < 50:  # Minimum Stripe = 0.50€
            raise HTTPException(
                status_code=400,
                detail="Le montant minimum est de 0.50€"
            )
        
        # Créer le PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=request.currency,
            payment_method_types=["card", "apple_pay", "google_pay"],
            metadata={
                "order_id": request.order_id or "",
                "customer_email": request.customer_email or "",
                "customer_name": request.customer_name or "",
                **(request.metadata or {})
            },
            receipt_email=request.customer_email,
            description=f"Commande Family's - {request.order_id or 'N/A'}"
        )
        
        return {
            "success": True,
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": request.amount,
            "currency": request.currency
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur création paiement: {str(e)}")


# ============================================
# CONFIRMER UN PAIEMENT
# ============================================
@router.post("/confirm")
async def confirm_payment(request: PaymentConfirmRequest):
    """
    Confirme qu'un paiement a été effectué et met à jour la commande
    """
    try:
        if not stripe.api_key:
            raise HTTPException(status_code=500, detail="Stripe non configuré")
        
        # Récupérer le PaymentIntent
        intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        if intent.status == "succeeded":
            # Mettre à jour la commande dans Firestore
            order_ref = db.collection("orders").document(request.order_id)
            order_doc = order_ref.get()
            
            if order_doc.exists:
                order_ref.update({
                    "payment_status": "paid",
                    "payment_method": "card",
                    "payment_intent_id": request.payment_intent_id,
                    "paid_at": firestore.SERVER_TIMESTAMP
                })
                
                return {
                    "success": True,
                    "status": "paid",
                    "message": "Paiement confirmé avec succès"
                }
            else:
                raise HTTPException(status_code=404, detail="Commande non trouvée")
        else:
            return {
                "success": False,
                "status": intent.status,
                "message": f"Le paiement n'est pas encore confirmé (status: {intent.status})"
            }
            
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur confirmation: {str(e)}")


# ============================================
# WEBHOOK STRIPE
# ============================================
@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Webhook appelé par Stripe pour notifier des événements de paiement
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        
        if webhook_secret and sig_header:
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, webhook_secret
                )
            except stripe.error.SignatureVerificationError:
                raise HTTPException(status_code=400, detail="Signature invalide")
        else:
            # Mode dev sans signature
            import json
            event = json.loads(payload)
        
        event_type = event.get("type", "")
        data = event.get("data", {}).get("object", {})
        
        # Traiter les événements
        if event_type == "payment_intent.succeeded":
            order_id = data.get("metadata", {}).get("order_id")
            if order_id:
                order_ref = db.collection("orders").document(order_id)
                order_ref.update({
                    "payment_status": "paid",
                    "payment_intent_id": data.get("id"),
                    "paid_at": firestore.SERVER_TIMESTAMP
                })
                print(f"✅ Paiement confirmé pour commande {order_id}")
                
        elif event_type == "payment_intent.payment_failed":
            order_id = data.get("metadata", {}).get("order_id")
            if order_id:
                order_ref = db.collection("orders").document(order_id)
                order_ref.update({
                    "payment_status": "failed",
                    "payment_error": data.get("last_payment_error", {}).get("message", "Erreur inconnue")
                })
                print(f"❌ Paiement échoué pour commande {order_id}")
        
        elif event_type == "charge.refunded":
            payment_intent_id = data.get("payment_intent")
            # Trouver la commande par payment_intent_id
            orders = db.collection("orders").where("payment_intent_id", "==", payment_intent_id).limit(1).get()
            for order in orders:
                order.reference.update({
                    "payment_status": "refunded",
                    "refunded_at": firestore.SERVER_TIMESTAMP
                })
                print(f"💸 Remboursement pour commande {order.id}")
        
        return {"received": True}
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# VÉRIFIER LE STATUT D'UN PAIEMENT
# ============================================
@router.get("/status/{payment_intent_id}")
async def get_payment_status(payment_intent_id: str):
    """
    Vérifie le statut d'un PaymentIntent
    """
    try:
        if not stripe.api_key:
            raise HTTPException(status_code=500, detail="Stripe non configuré")
        
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        return {
            "payment_intent_id": intent.id,
            "status": intent.status,
            "amount": intent.amount / 100,  # Convertir centimes en euros
            "currency": intent.currency,
            "created": intent.created,
            "metadata": intent.metadata
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# REMBOURSER UN PAIEMENT
# ============================================
@router.post("/refund/{payment_intent_id}")
async def refund_payment(payment_intent_id: str, amount: Optional[float] = None):
    """
    Rembourse un paiement (total ou partiel)
    """
    try:
        if not stripe.api_key:
            raise HTTPException(status_code=500, detail="Stripe non configuré")
        
        refund_params = {"payment_intent": payment_intent_id}
        
        if amount:
            refund_params["amount"] = int(amount * 100)  # Montant partiel en centimes
        
        refund = stripe.Refund.create(**refund_params)
        
        return {
            "success": True,
            "refund_id": refund.id,
            "amount": refund.amount / 100,
            "status": refund.status
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================
# RÉCUPÉRER LA CLÉ PUBLIQUE STRIPE
# ============================================
@router.get("/config")
async def get_stripe_config():
    """
    Retourne la clé publique Stripe pour l'app mobile
    Récupère depuis Firestore settings
    """
    try:
        settings_doc = db.collection("settings").document("restaurant").get()
        
        if settings_doc.exists:
            data = settings_doc.to_dict()
            api_keys = data.get("api_keys", {})
            service_links = data.get("service_links", {})
            
            # Chercher la clé publique dans api_keys ou service_links
            public_key = (
                api_keys.get("stripe_public_key") or 
                service_links.get("stripe") or 
                ""
            )
            
            if public_key and public_key.startswith("pk_"):
                return {
                    "publishable_key": public_key,
                    "enabled": True
                }
        
        return {
            "publishable_key": None,
            "enabled": False,
            "message": "Stripe n'est pas configuré. Ajoutez la clé publique dans les paramètres."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

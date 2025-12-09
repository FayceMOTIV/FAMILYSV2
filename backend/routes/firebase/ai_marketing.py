"""
Routes AI Marketing - Firebase/Firestore
Gestion des campagnes IA, historique et statistiques
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import os
import uuid

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/ai-marketing", tags=["firebase-ai-marketing"])

# ============================================
# MODÈLES
# ============================================
class CampaignCreate(BaseModel):
    name: str
    type: str = "produit"  # produit, fidelite, happy_hour, reactivation, panier_moyen
    message: str
    discount_type: str = "percentage"  # percentage, fixed
    discount_value: float = 10
    start_date: str
    end_date: str
    target_hours: Optional[str] = None
    target_products: Optional[List[str]] = []
    target_categories: Optional[List[str]] = []

class CampaignValidate(BaseModel):
    accepted: bool
    notes: Optional[str] = None

class AIMarketingSettings(BaseModel):
    analysis_frequency: str = "daily"
    max_suggestions_per_week: int = 5
    max_promo_budget_percent: float = 15.0
    excluded_product_ids: List[str] = []
    excluded_category_ids: List[str] = []
    priority_objectives: List[str] = ["boost_ca", "fideliser"]
    allowed_offer_types: List[str] = ["percentage", "bogo", "fidelity"]

# ============================================
# HELPERS
# ============================================
def get_openai_key():
    """Récupérer la clé OpenAI depuis les settings"""
    try:
        doc = db.collection('settings').document('restaurant').get()
        if doc.exists:
            key = doc.to_dict().get('openai_api_key', '')
            if key and key.startswith('sk-'):
                return key.split()[0]
        return os.environ.get('OPENAI_API_KEY', '')
    except:
        return os.environ.get('OPENAI_API_KEY', '')

def call_openai(prompt: str, system_prompt: str = None):
    """Appeler l'API OpenAI"""
    try:
        import openai
        api_key = get_openai_key()
        if not api_key:
            return {"error": "Clé OpenAI non configurée"}
        
        client = openai.OpenAI(api_key=api_key)
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=1500,
            temperature=0.7
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}

def get_sales_data(days: int = 30):
    """Récupérer les données de vente des X derniers jours"""
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        orders = list(db.collection('orders').where('created_at', '>=', cutoff).stream())
        
        total_revenue = 0
        product_counts = {}
        category_counts = {}
        daily_revenue = {}
        hour_distribution = {}
        customer_orders = {}
        
        for order in orders:
            data = order.to_dict()
            if data.get('status') == 'cancelled':
                continue
            
            total_revenue += data.get('total', 0)
            customer_id = data.get('customer_uid', 'anonymous')
            customer_orders[customer_id] = customer_orders.get(customer_id, 0) + 1
            
            # Heure de commande
            created = data.get('created_at')
            if hasattr(created, 'hour'):
                hour = created.hour
                hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
            
            for item in data.get('items', []):
                name = item.get('name', 'Unknown')
                qty = item.get('quantity', 1)
                product_counts[name] = product_counts.get(name, 0) + qty
        
        return {
            "total_revenue": total_revenue,
            "order_count": len(orders),
            "average_order": total_revenue / len(orders) if orders else 0,
            "product_counts": product_counts,
            "hour_distribution": hour_distribution,
            "returning_customers": sum(1 for c in customer_orders.values() if c > 1),
            "new_customers": sum(1 for c in customer_orders.values() if c == 1)
        }
    except Exception as e:
        return {"error": str(e)}

# ============================================
# ROUTES CAMPAGNES
# ============================================
@router.get("/campaigns/pending")
def get_pending_campaigns():
    """Récupère les campagnes en attente de validation"""
    try:
        campaigns = []
        docs = db.collection('ai_campaigns').where('status', '==', 'pending').stream()
        
        for doc in docs:
            campaign = doc.to_dict()
            campaign['id'] = doc.id
            campaigns.append(campaign)
        
        # Trier par date de création (plus récent d'abord)
        campaigns.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return {"campaigns": campaigns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaigns/all")
def get_all_campaigns(status: str = None):
    """Récupère toutes les campagnes avec filtre optionnel"""
    try:
        query = db.collection('ai_campaigns')
        if status:
            query = query.where('status', '==', status)
        
        campaigns = []
        for doc in query.stream():
            campaign = doc.to_dict()
            campaign['id'] = doc.id
            campaigns.append(campaign)
        
        campaigns.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return {"campaigns": campaigns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/generate")
def generate_campaigns(force_regenerate: bool = False):
    """Génère de nouvelles campagnes IA basées sur les données"""
    try:
        # Récupérer les paramètres IA
        settings_doc = db.collection('settings').document('ai_marketing').get()
        settings = settings_doc.to_dict() if settings_doc.exists else {}
        
        max_suggestions = settings.get('max_suggestions_per_week', 5)
        objectives = settings.get('priority_objectives', ['boost_ca', 'fideliser'])
        allowed_types = settings.get('allowed_offer_types', ['percentage', 'bogo'])
        max_discount = settings.get('max_promo_budget_percent', 15)
        
        # Récupérer données de vente
        sales_data = get_sales_data(30)
        if "error" in sales_data:
            raise HTTPException(status_code=500, detail=sales_data["error"])
        
        # Trouver les produits peu vendus
        product_counts = sales_data.get('product_counts', {})
        all_products = list(db.collection('products').stream())
        low_sellers = []
        for prod in all_products:
            p = prod.to_dict()
            if p.get('name') not in product_counts or product_counts.get(p.get('name'), 0) < 5:
                low_sellers.append(p.get('name'))
        
        # Trouver les heures creuses
        hour_dist = sales_data.get('hour_distribution', {})
        peak_hours = sorted(hour_dist.items(), key=lambda x: x[1], reverse=True)[:3]
        low_hours = sorted(hour_dist.items(), key=lambda x: x[1])[:3]
        
        # Construire le contexte pour l'IA
        context = f"""
Données des 30 derniers jours du restaurant Le Family's:
- CA total: {sales_data['total_revenue']:.2f}€
- Nombre de commandes: {sales_data['order_count']}
- Panier moyen: {sales_data['average_order']:.2f}€
- Nouveaux clients: {sales_data.get('new_customers', 0)}
- Clients récurrents: {sales_data.get('returning_customers', 0)}
- Produits peu vendus: {', '.join(low_sellers[:5]) if low_sellers else 'Aucun'}
- Heures de pointe: {', '.join([f"{h[0]}h" for h in peak_hours]) if peak_hours else 'N/A'}
- Heures creuses: {', '.join([f"{h[0]}h" for h in low_hours]) if low_hours else 'N/A'}

Objectifs prioritaires: {', '.join(objectives)}
Types d'offres autorisées: {', '.join(allowed_types)}
Réduction max conseillée: {max_discount}%

Génère {min(3, max_suggestions)} campagnes promotionnelles différentes et pertinentes.
"""
        
        system_prompt = """Tu es un expert en marketing pour restaurants fast-food.
Tu génères des campagnes promotionnelles au format JSON.

RÉPONDS UNIQUEMENT avec un tableau JSON valide contenant les campagnes:
[
  {
    "name": "Nom accrocheur de la promo",
    "type": "produit|fidelite|happy_hour|reactivation|panier_moyen",
    "message": "Explication détaillée de la promo et pourquoi elle est pertinente (50-100 mots)",
    "discount_type": "percentage|fixed",
    "discount_value": 10,
    "duration_days": 7,
    "target_hours": "18h-20h" ou null,
    "impact_estimate": {
      "ca_increase": "+5-10%",
      "difficulty": "facile|moyen|difficile"
    }
  }
]

Sois créatif et propose des promos adaptées aux données réelles du restaurant.
"""
        
        result = call_openai(context, system_prompt)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=f"Erreur IA: {result['error']}")
        
        # Parser la réponse JSON
        import json
        try:
            response_text = result["response"]
            # Nettoyer la réponse (enlever markdown si présent)
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            campaigns_data = json.loads(response_text.strip())
        except json.JSONDecodeError:
            campaigns_data = []
        
        # Sauvegarder les campagnes générées
        created_campaigns = []
        now = datetime.now(timezone.utc)
        
        for camp in campaigns_data:
            campaign_id = str(uuid.uuid4())[:8]
            start_date = now + timedelta(days=1)
            end_date = start_date + timedelta(days=camp.get('duration_days', 7))
            
            campaign_doc = {
                "name": camp.get('name', 'Promo IA'),
                "type": camp.get('type', 'produit'),
                "message": camp.get('message', ''),
                "discount_type": camp.get('discount_type', 'percentage'),
                "discount_value": camp.get('discount_value', 10),
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "target_hours": camp.get('target_hours'),
                "impact_estimate": camp.get('impact_estimate', {}),
                "status": "pending",
                "created_at": now.isoformat(),
                "generated_by": "ai"
            }
            
            db.collection('ai_campaigns').document(campaign_id).set(campaign_doc)
            campaign_doc['id'] = campaign_id
            created_campaigns.append(campaign_doc)
        
        return {
            "message": f"{len(created_campaigns)} campagnes générées",
            "campaigns": created_campaigns
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/campaigns/{campaign_id}/validate")
def validate_campaign(campaign_id: str, data: CampaignValidate):
    """Valide ou refuse une campagne proposée par l'IA"""
    try:
        doc_ref = db.collection('ai_campaigns').document(campaign_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Campagne non trouvée")
        
        campaign = doc.to_dict()
        now = datetime.now(timezone.utc)
        
        if data.accepted:
            # Créer une promo en brouillon à partir de la campagne
            promo_id = str(uuid.uuid4())[:8]
            promo_data = {
                "name": campaign.get('name'),
                "description": campaign.get('message', ''),
                "type": "percentage" if campaign.get('discount_type') == 'percentage' else "fixed_amount",
                "value": campaign.get('discount_value', 10),
                "start_date": campaign.get('start_date'),
                "end_date": campaign.get('end_date'),
                "is_active": False,  # Brouillon
                "is_ai_generated": True,
                "ai_campaign_id": campaign_id,
                "created_at": now.isoformat()
            }
            db.collection('promotions').document(promo_id).set(promo_data)
            
            # Mettre à jour la campagne
            doc_ref.update({
                "status": "accepted",
                "validated_at": now.isoformat(),
                "validation_notes": data.notes,
                "promotion_id": promo_id
            })
            
            return {"message": "Campagne acceptée", "promotion_id": promo_id}
        else:
            doc_ref.update({
                "status": "refused",
                "validated_at": now.isoformat(),
                "validation_notes": data.notes
            })
            return {"message": "Campagne refusée"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ROUTES STATISTIQUES
# ============================================
@router.get("/stats")
def get_ai_marketing_stats():
    """Récupère les statistiques globales des campagnes IA"""
    try:
        campaigns = list(db.collection('ai_campaigns').stream())
        
        total = len(campaigns)
        accepted = sum(1 for c in campaigns if c.to_dict().get('status') == 'accepted')
        refused = sum(1 for c in campaigns if c.to_dict().get('status') == 'refused')
        pending = sum(1 for c in campaigns if c.to_dict().get('status') == 'pending')
        
        # Calculer le CA généré par les promos IA
        total_ca_generated = 0
        total_fidelity_points = 0
        
        for camp in campaigns:
            data = camp.to_dict()
            if data.get('status') == 'accepted' and data.get('promotion_id'):
                # Récupérer les commandes avec cette promo
                promo_id = data.get('promotion_id')
                orders = list(db.collection('orders').where('promotions_applied', 'array_contains', promo_id).stream())
                for order in orders:
                    total_ca_generated += order.to_dict().get('total', 0)
                    total_fidelity_points += order.to_dict().get('loyalty_earned', 0)
        
        acceptance_rate = round((accepted / total * 100), 1) if total > 0 else 0
        
        # Générer un résumé hebdomadaire IA
        weekly_summary = None
        if total > 0:
            result = call_openai(
                f"Résume en 2-3 phrases les performances marketing:\n"
                f"- {total} campagnes générées\n"
                f"- {accepted} acceptées ({acceptance_rate}%)\n"
                f"- {total_ca_generated:.2f}€ CA généré\n"
                f"- {total_fidelity_points:.2f} points fidélité distribués",
                "Tu es un assistant marketing. Sois encourageant et donne un conseil pratique."
            )
            if "response" in result:
                weekly_summary = result["response"]
        
        return {
            "total_campaigns": total,
            "accepted": accepted,
            "refused": refused,
            "pending": pending,
            "acceptance_rate": acceptance_rate,
            "total_ca_generated": round(total_ca_generated, 2),
            "total_fidelity_points": round(total_fidelity_points, 2),
            "weekly_summary": weekly_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# ROUTES PARAMÈTRES
# ============================================
@router.get("/settings")
def get_ai_marketing_settings():
    """Récupère les paramètres IA Marketing"""
    try:
        doc = db.collection('settings').document('ai_marketing').get()
        if doc.exists:
            return doc.to_dict()
        return {
            "analysis_frequency": "daily",
            "max_suggestions_per_week": 5,
            "max_promo_budget_percent": 15.0,
            "excluded_product_ids": [],
            "excluded_category_ids": [],
            "priority_objectives": ["boost_ca", "fideliser", "reactiver", "augmenter_panier"],
            "allowed_offer_types": ["bogo", "percentage", "fidelity", "happy_hour", "reactivation"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/settings")
def update_ai_marketing_settings(settings: AIMarketingSettings):
    """Met à jour les paramètres IA Marketing"""
    try:
        db.collection('settings').document('ai_marketing').set(settings.dict())
        return {"message": "Paramètres sauvegardés"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

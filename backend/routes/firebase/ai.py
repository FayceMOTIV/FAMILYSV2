"""
Routes AI - Firebase/Firestore
Assistant IA et Marketing
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import os

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/ai", tags=["firebase-ai"])

class ChatRequest(BaseModel):
    question: str

class MarketingRequest(BaseModel):
    type: str = "social"  # social, email, sms, promo
    tone: str = "friendly"
    product_id: Optional[str] = None
    promotion_id: Optional[str] = None

def get_openai_key():
    """Récupérer la clé OpenAI depuis les settings"""
    try:
        doc = db.collection('settings').document('restaurant').get()
        if doc.exists:
            key = doc.to_dict().get('openai_api_key', '')
            # Nettoyer la clé si elle contient des caractères parasites
            if key and key.startswith('sk-'):
                return key.split()[0]  # Prendre juste la clé
        return os.environ.get('OPENAI_API_KEY', '')
    except:
        return os.environ.get('OPENAI_API_KEY', '')

def call_openai(prompt: str, system_prompt: str = None):
    """Appeler l'API OpenAI"""
    try:
        import openai
        api_key = get_openai_key()
        if not api_key:
            return {"error": "Clé OpenAI non configurée. Ajoutez-la dans Paramètres > Paramètres IA"}
        
        client = openai.OpenAI(api_key=api_key)
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=1000,
            temperature=0.7
        )
        
        return {"response": response.choices[0].message.content}
    except Exception as e:
        return {"error": str(e)}

@router.get("/analyze-sales")
def analyze_sales():
    """Analyser les ventes avec l'IA"""
    try:
        # Récupérer les commandes des 30 derniers jours
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        orders = list(db.collection('orders').where('created_at', '>=', thirty_days_ago).stream())
        
        if not orders:
            return {"analysis": "Pas assez de données pour une analyse. Commencez à recevoir des commandes !"}
        
        # Préparer les stats
        total_revenue = 0
        product_counts = {}
        daily_revenue = {}
        
        for order in orders:
            data = order.to_dict()
            if data.get('status') == 'cancelled':
                continue
            
            total_revenue += data.get('total', 0)
            
            # Compter les produits
            for item in data.get('items', []):
                name = item.get('name', 'Unknown')
                qty = item.get('quantity', 1)
                product_counts[name] = product_counts.get(name, 0) + qty
            
            # Revenue par jour
            created = data.get('created_at')
            if hasattr(created, 'strftime'):
                day = created.strftime('%Y-%m-%d')
            else:
                day = str(created)[:10]
            daily_revenue[day] = daily_revenue.get(day, 0) + data.get('total', 0)
        
        # Top produits
        top_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        stats_summary = f"""
Données des 30 derniers jours:
- Chiffre d'affaires total: {total_revenue:.2f}€
- Nombre de commandes: {len(orders)}
- Panier moyen: {total_revenue/len(orders):.2f}€
- Top 5 produits: {', '.join([f'{p[0]} ({p[1]}x)' for p in top_products])}
"""
        
        system_prompt = """Tu es un assistant business pour Le Family's, un restaurant à Bourg-en-Bresse.
Analyse les données et donne des conseils concrets et actionnables en français.
Sois positif et encourageant. Maximum 200 mots."""
        
        result = call_openai(f"Analyse ces données de vente et donne des conseils:\n{stats_summary}", system_prompt)
        
        if "error" in result:
            return {"analysis": f"Erreur IA: {result['error']}", "stats": stats_summary}
        
        return {
            "analysis": result["response"],
            "stats": {
                "total_revenue": round(total_revenue, 2),
                "order_count": len(orders),
                "average_order": round(total_revenue/len(orders), 2) if orders else 0,
                "top_products": [{"name": p[0], "count": p[1]} for p in top_products]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
def chat_with_ai(request: ChatRequest):
    """Chat avec l'assistant IA"""
    try:
        # Récupérer le contexte du restaurant
        settings = db.collection('settings').document('restaurant').get()
        restaurant_name = "Le Family's"
        if settings.exists:
            restaurant_name = settings.to_dict().get('name', "Le Family's")
        
        system_prompt = f"""Tu es l'assistant IA de {restaurant_name}, un restaurant à Bourg-en-Bresse.
Tu aides le gérant avec:
- Analyse des ventes et performances
- Idées marketing et promotions
- Conseils pour améliorer le service
- Réponses aux questions sur la gestion

Réponds en français, sois concis et pratique. Maximum 150 mots."""
        
        result = call_openai(request.question, system_prompt)
        
        if "error" in result:
            return {"response": f"Erreur: {result['error']}"}
        
        return {"response": result["response"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-marketing")
def generate_marketing(request: MarketingRequest):
    """Générer du contenu marketing"""
    try:
        # Récupérer infos du restaurant
        settings = db.collection('settings').document('restaurant').get()
        restaurant_info = settings.to_dict() if settings.exists else {}
        restaurant_name = restaurant_info.get('name', "Le Family's")
        
        # Récupérer produit si spécifié
        product_info = ""
        if request.product_id:
            prod_doc = db.collection('products').document(request.product_id).get()
            if prod_doc.exists:
                prod = prod_doc.to_dict()
                product_info = f"\nProduit à promouvoir: {prod.get('name')} - {prod.get('base_price')}€"
        
        # Récupérer promo si spécifiée
        promo_info = ""
        if request.promotion_id:
            promo_doc = db.collection('promotions').document(request.promotion_id).get()
            if promo_doc.exists:
                promo = promo_doc.to_dict()
                promo_info = f"\nPromotion: {promo.get('name')} - {promo.get('description')}"
        
        type_instructions = {
            "social": "Crée un post Instagram/Facebook accrocheur avec emojis. Court et percutant.",
            "email": "Crée un email marketing avec objet et corps. Professionnel mais chaleureux.",
            "sms": "Crée un SMS de max 160 caractères. Direct et avec appel à l'action.",
            "promo": "Suggère une promotion attractive avec nom, description et conditions."
        }
        
        prompt = f"""Restaurant: {restaurant_name}
Type de contenu: {request.type}
Ton souhaité: {request.tone}
{product_info}
{promo_info}

{type_instructions.get(request.type, type_instructions['social'])}"""
        
        system_prompt = "Tu es un expert en marketing digital pour restaurants. Crée du contenu engageant en français."
        
        result = call_openai(prompt, system_prompt)
        
        if "error" in result:
            return {"content": f"Erreur: {result['error']}"}
        
        return {"content": result["response"], "type": request.type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggest-promo")
def suggest_promo():
    """Suggérer une promotion basée sur les données"""
    try:
        # Analyser les tendances
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        orders = list(db.collection('orders').where('created_at', '>=', week_ago).stream())
        
        # Trouver les produits les moins vendus
        product_counts = {}
        for order in orders:
            data = order.to_dict()
            for item in data.get('items', []):
                name = item.get('name', 'Unknown')
                product_counts[name] = product_counts.get(name, 0) + item.get('quantity', 1)
        
        # Récupérer tous les produits
        all_products = list(db.collection('products').stream())
        low_sellers = []
        for prod in all_products:
            p = prod.to_dict()
            p['id'] = prod.id
            if p.get('name') not in product_counts or product_counts.get(p.get('name'), 0) < 3:
                low_sellers.append(p.get('name'))
        
        context = f"""
Produits peu vendus cette semaine: {', '.join(low_sellers[:5]) if low_sellers else 'Aucun'}
Nombre total de commandes: {len(orders)}
"""
        
        system_prompt = """Tu es un expert en promotions restaurant.
Suggère UNE promotion concrète pour booster les ventes.
Format: Nom de la promo | Description courte | Réduction suggérée
Maximum 50 mots."""
        
        result = call_openai(f"Suggère une promo pour ces données:\n{context}", system_prompt)
        
        if "error" in result:
            return {"suggestion": f"Erreur: {result['error']}"}
        
        return {"suggestion": result["response"], "low_sellers": low_sellers[:5]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

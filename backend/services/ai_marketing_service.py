import os
from datetime import datetime, timezone, timedelta
from typing import List, Dict
from emergentintegrations.llm.chat import LlmChat, UserMessage
from database import db
import json

EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "sk-emergent-13c430b876b353768F")

async def analyze_and_generate_campaigns(restaurant_id: str, settings: Dict = None) -> List[Dict]:
    """Analyse les données et génère 3-5 campagnes marketing pertinentes."""
    
    # 1. Collecter les données
    analysis_data = await collect_restaurant_data(restaurant_id)
    
    # 2. Demander à l'IA de générer des campagnes
    campaigns = await generate_campaigns_with_ai(analysis_data, settings or {})
    
    return campaigns

async def collect_restaurant_data(restaurant_id: str) -> Dict:
    """Collecte toutes les données nécessaires pour l'analyse."""
    
    # Derniers 30 jours
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    
    # Commandes récentes
    recent_orders = await db.orders.find({
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": seven_days_ago}
    }).to_list(length=None)
    
    # Commandes du mois précédent (pour comparaison)
    previous_month_orders = await db.orders.find({
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": thirty_days_ago, "$lt": seven_days_ago}
    }).to_list(length=None)
    
    # Produits
    products = await db.products.find({"restaurant_id": restaurant_id}).to_list(length=None)
    
    # Catégories
    categories = await db.categories.find({"restaurant_id": restaurant_id}).to_list(length=None)
    
    # Promos passées (ancienne table + nouvelle table promotions V2)
    past_promos_old = await db.promos.find({
        "restaurant_id": restaurant_id,
        "end_date": {"$lt": datetime.now(timezone.utc).isoformat()}
    }).to_list(length=None)
    
    past_promos_v2 = await db.promotions.find({
        "restaurant_id": restaurant_id,
        "end_date": {"$lt": datetime.now(timezone.utc).date().isoformat()}
    }).to_list(length=None)
    
    # Combiner les deux
    past_promos = past_promos_old + past_promos_v2
    
    # Usage des promotions V2
    promotion_usage_logs = await db.promotion_usage_log.find({}).to_list(length=None)
    
    # Clients
    customers = await db.customers.find({"restaurant_id": restaurant_id}).to_list(length=None)
    
    # Analyser les ventes par produit
    product_sales = {}
    for order in recent_orders:
        for item in order.get("items", []):
            pid = item.get("product_id")
            if pid:
                if pid not in product_sales:
                    product_sales[pid] = {
                        "quantity": 0,
                        "revenue": 0,
                        "name": item.get("name", "Unknown")
                    }
                product_sales[pid]["quantity"] += item.get("quantity", 0)
                product_sales[pid]["revenue"] += item.get("total_price", 0)
    
    # Analyser les ventes par catégorie
    category_sales = {}
    for order in recent_orders:
        for item in order.get("items", []):
            cat_id = item.get("category_id")
            if cat_id:
                if cat_id not in category_sales:
                    category_sales[cat_id] = {
                        "quantity": 0,
                        "revenue": 0
                    }
                category_sales[cat_id]["quantity"] += item.get("quantity", 0)
                category_sales[cat_id]["revenue"] += item.get("total_price", 0)
    
    # Clients inactifs (>14 jours sans commande)
    fourteen_days_ago = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()
    inactive_customers = [c for c in customers if c.get("last_order_date", "") < fourteen_days_ago]
    
    # CA total
    total_ca_week = sum(o.get("total", 0) for o in recent_orders)
    total_ca_prev = sum(o.get("total", 0) for o in previous_month_orders)
    
    # Analyser les performances des promos
    promo_performance = {}
    for promo in past_promos:
        promo_id = promo.get("id")
        usage = [log for log in promotion_usage_logs if log.get("promotion_id") == promo_id]
        if usage:
            promo_performance[promo_id] = {
                "name": promo.get("name") or promo.get("title", "Unknown"),
                "type": promo.get("type", "unknown"),
                "usage_count": len(usage),
                "total_discount": sum(log.get("discount_amount", 0) for log in usage),
                "total_revenue": sum(log.get("original_amount", 0) for log in usage)
            }
    
    # Top 3 meilleures promos
    top_promos = sorted(promo_performance.values(), key=lambda x: x["total_revenue"], reverse=True)[:3]
    
    return {
        "restaurant_id": restaurant_id,
        "period": "7 derniers jours",
        "total_orders": len(recent_orders),
        "total_ca": round(total_ca_week, 2),
        "avg_basket": round(total_ca_week / len(recent_orders), 2) if recent_orders else 0,
        "ca_trend": "hausse" if total_ca_week > total_ca_prev else "baisse",
        "ca_evolution_percent": round(((total_ca_week - total_ca_prev) / total_ca_prev * 100), 1) if total_ca_prev > 0 else 0,
        "product_sales": dict(sorted(product_sales.items(), key=lambda x: x[1]["revenue"], reverse=True)[:10]),
        "category_sales": category_sales,
        "inactive_customers_count": len(inactive_customers),
        "past_promos_count": len(past_promos),
        "promotion_usage_logs_count": len(promotion_usage_logs),
        "top_performing_promos": top_promos,
        "products_count": len(products),
        "categories_count": len(categories)
    }

async def generate_campaigns_with_ai(data: Dict, settings: Dict) -> List[Dict]:
    """Utilise GPT-5 pour générer 3-5 campagnes pertinentes."""
    
    max_suggestions = settings.get("max_suggestions_per_week", 5)
    priority_objectives = settings.get("priority_objectives", ["boost_ca"])
    allowed_types = settings.get("allowed_offer_types", ["percentage", "bogo", "fidelity"])
    
    prompt = f"""Tu es l'assistant marketing IA du restaurant Family's. 
Analyse ces données et génère {max_suggestions} campagnes marketing pertinentes.

**Données de performance :**
- Commandes : {data['total_orders']}
- CA : {data['total_ca']}€ ({data.get('ca_evolution_percent', 0):+.1f}% vs période précédente)
- Panier moyen : {data['avg_basket']}€
- Tendance : {data['ca_trend']}
- Clients inactifs : {data['inactive_customers_count']}
- Promos passées (ancien + nouveau moteur) : {data['past_promos_count']}
- Logs d'utilisation promos : {data.get('promotion_usage_logs_count', 0)}

**Top 3 promos les plus performantes :**
{json.dumps(data.get('top_performing_promos', []), indent=2, ensure_ascii=False)}

**Top produits vendus :**
{json.dumps(data['product_sales'], indent=2, ensure_ascii=False)}

**Ventes par catégorie :**
{json.dumps(data['category_sales'], indent=2, ensure_ascii=False)}

**Objectifs prioritaires :** {', '.join(priority_objectives)}
**Types d'offres autorisées :** {', '.join(allowed_types)}

**Format de réponse JSON strict :**
```json
[
  {{
    "name": "Nom court et accrocheur",
    "type": "produit|fidelite|happy_hour|reactivation|panier_moyen",
    "product_ids": ["id1", "id2"],
    "category_ids": ["cat1"],
    "message": "Message motivant en 2-3 phrases max avec emojis. Ton naturel, style manager marketing.",
    "start_date": "2025-11-15",
    "end_date": "2025-11-17",
    "discount_type": "percentage|fixed|bogo|fidelity_multiplier",
    "discount_value": 20,
    "target_hours": "14h-18h (optionnel)",
    "impact_estimate": {{
      "ca_increase": "+18%",
      "difficulty": "facile|moyen|difficile",
      "duration": "3 jours"
    }}
  }}
]
```

**Consignes :**
- 3 à 5 campagnes max
- Messages courts, motivants, avec emojis pertinents
- Dates réalistes (prochains jours/week-end)
- Impact estimé réaliste
- Cibler les problèmes détectés (baisse ventes, clients inactifs, etc.)
- Ton humain et encourageant

Réponds UNIQUEMENT avec le JSON, rien d'autre."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"ai-marketing-{data['restaurant_id']}",
            system_message="Tu es un expert en marketing restaurant. Tu génères des campagnes pertinentes en JSON."
        ).with_model("openai", "gpt-5")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parser la réponse JSON
        response_clean = response.strip()
        if response_clean.startswith("```json"):
            response_clean = response_clean[7:]
        if response_clean.startswith("```"):
            response_clean = response_clean[3:]
        if response_clean.endswith("```"):
            response_clean = response_clean[:-3]
        
        campaigns = json.loads(response_clean.strip())
        
        # Ajouter restaurant_id et status
        for campaign in campaigns:
            campaign["restaurant_id"] = data["restaurant_id"]
            campaign["status"] = "pending"
        
        return campaigns
        
    except Exception as e:
        print(f"Erreur génération campagnes IA: {str(e)}")
        # Fallback: générer une campagne par défaut
        return [{
            "restaurant_id": data["restaurant_id"],
            "name": "Offre Week-end Desserts 🍰",
            "type": "produit",
            "product_ids": [],
            "category_ids": [],
            "message": "👀 Les ventes de desserts peuvent être boostées ! Je te propose une offre -20% ce week-end pour attirer plus de gourmands. 🔥",
            "start_date": (datetime.now(timezone.utc) + timedelta(days=2)).strftime("%Y-%m-%d"),
            "end_date": (datetime.now(timezone.utc) + timedelta(days=4)).strftime("%Y-%m-%d"),
            "discount_type": "percentage",
            "discount_value": 20,
            "target_hours": None,
            "impact_estimate": {
                "ca_increase": "+15%",
                "difficulty": "facile",
                "duration": "3 jours"
            },
            "status": "pending"
        }]

async def calculate_campaign_results(campaign_id: str, restaurant_id: str) -> Dict:
    """Calcule les résultats réels d'une campagne validée."""
    
    # Récupérer la campagne
    campaign = await db.ai_campaign_suggestions.find_one({"id": campaign_id})
    if not campaign:
        return {}
    
    # Période de la campagne
    start = campaign.get("start_date")
    end = campaign.get("end_date")
    
    # Commandes pendant la campagne
    orders = await db.orders.find({
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": start, "$lte": end}
    }).to_list(length=None)
    
    total_ca = sum(o.get("total", 0) for o in orders)
    orders_count = len(orders)
    fidelity_points = sum(o.get("loyalty_points_earned", 0) for o in orders)
    
    return {
        "real_ca": round(total_ca, 2),
        "orders_count": orders_count,
        "fidelity_points_gained": fidelity_points,
        "estimated_gain_percent": 0  # Calculé par comparaison avec période similaire
    }

async def generate_weekly_summary(restaurant_id: str) -> str:
    """Génère un résumé hebdomadaire des campagnes."""
    
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    
    # Campagnes de la semaine
    campaigns = await db.ai_campaign_suggestions.find({
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": seven_days_ago}
    }).to_list(length=None)
    
    accepted = [c for c in campaigns if c.get("status") == "accepted"]
    refused = [c for c in campaigns if c.get("status") == "refused"]
    
    # Résultats
    results = await db.ai_campaign_results.find({
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": seven_days_ago}
    }).to_list(length=None)
    
    total_ca_gain = sum(r.get("real_ca", 0) for r in results)
    
    prompt = f"""Génère un résumé hebdomadaire court (3-4 phrases max) pour le gérant.

**Données :**
- Campagnes proposées : {len(campaigns)}
- Acceptées : {len(accepted)}
- Refusées : {len(refused)}
- CA généré : {total_ca_gain}€

Ton : motivant, concis, actionnable. Ajoute des emojis pertinents."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"summary-{restaurant_id}",
            system_message="Tu es un assistant marketing concis et motivant."
        ).with_model("openai", "gpt-5")
        
        response = await chat.send_message(UserMessage(text=prompt))
        return response.strip()
    except:
        return f"📊 Cette semaine : {len(accepted)} campagnes activées sur {len(campaigns)} proposées. Gain estimé : +{total_ca_gain}€. Continue comme ça ! 🔥"

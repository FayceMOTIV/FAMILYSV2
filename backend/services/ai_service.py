import os
from openai import OpenAI
from typing import List, Dict

# Emergent LLM Key
EMERGENT_LLM_KEY = "sk-emergent-13c430b876b353768F"

client = OpenAI(
    api_key=EMERGENT_LLM_KEY,
    base_url="https://llm.kindo.ai/v1"
)

def generate_marketing_text(prompt: str, context: str = "") -> str:
    """Generate marketing text using GPT-5."""
    try:
        response = client.chat.completions.create(
            model="gpt-5",
            messages=[
                {"role": "system", "content": "Tu es un expert en marketing pour un restaurant fast-food gourmet appelé Family's. Génère des textes accrocheurs, appétissants et professionnels en français."},
                {"role": "user", "content": f"{context}\n\n{prompt}"}
            ],
            max_tokens=500,
            temperature=0.8
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Erreur IA: {str(e)}"

def analyze_sales_data(sales_data: Dict) -> Dict:
    """Analyze sales data and provide insights."""
    try:
        prompt = f"""Analyse ces données de ventes d'un restaurant:
        
CA total: {sales_data.get('total_revenue', 0)}€
Nombre de commandes: {sales_data.get('total_orders', 0)}
Panier moyen: {sales_data.get('avg_basket', 0)}€
Top produits: {sales_data.get('top_products', [])}

Fournis:
1. 3 insights clés
2. 2 recommandations d'actions concrètes
3. 1 alerte si nécessaire

Format: JSON avec clés 'insights', 'recommendations', 'alert'"""
        
        response = client.chat.completions.create(
            model="gpt-5",
            messages=[
                {"role": "system", "content": "Tu es un analyste business pour restaurants. Fournis des insights actionnables en français."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        # Parse response as JSON
        import json
        try:
            result = json.loads(response.choices[0].message.content)
        except:
            result = {"insights": [response.choices[0].message.content], "recommendations": [], "alert": None}
        
        return result
    except Exception as e:
        return {"error": str(e)}

def ai_chat(question: str, context: Dict = None) -> str:
    """AI chat for natural language queries."""
    try:
        system_prompt = "Tu es l'assistant IA du back-office Family's. Réponds aux questions sur les ventes, produits et commandes en français de manière concise et utile."
        
        if context:
            context_str = f"Contexte: {context}"
        else:
            context_str = ""
        
        response = client.chat.completions.create(
            model="gpt-5",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"{context_str}\n\nQuestion: {question}"}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Erreur: {str(e)}"

def generate_promo_suggestion(sales_data: Dict) -> Dict:
    """Generate promo suggestions based on sales data."""
    try:
        prompt = f"""Basé sur ces données de ventes:
{sales_data}

Suggère une promotion pour booster les ventes. Fournis:
- Titre accrocheur
- Description
- Type (pourcentage ou montant fixe)
- Valeur recommandée
- Produit/catégorie ciblé
- Durée suggérée (jours)

Format JSON avec clés: title, description, discount_type, discount_value, target, duration_days"""
        
        response = client.chat.completions.create(
            model="gpt-5",
            messages=[
                {"role": "system", "content": "Tu es un expert en promotions restaurant. Génère des suggestions en français."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600,
            temperature=0.8
        )
        
        import json
        try:
            result = json.loads(response.choices[0].message.content)
        except:
            result = {"title": "Promo suggérée", "description": response.choices[0].message.content}
        
        return result
    except Exception as e:
        return {"error": str(e)}

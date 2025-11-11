import os
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
from typing import Dict
import json

load_dotenv()

# Emergent LLM Key
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY", "sk-emergent-13c430b876b353768F")

async def generate_marketing_text(prompt: str, context: str = "") -> str:
    """Generate marketing text using GPT-5."""
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id="marketing-gen",
            system_message="Tu es un expert en marketing pour un restaurant fast-food gourmet appelé Family's. Génère des textes accrocheurs, appétissants et professionnels en français."
        ).with_model("openai", "gpt-5")
        
        full_prompt = f"{context}\n\n{prompt}" if context else prompt
        user_message = UserMessage(text=full_prompt)
        
        response = await chat.send_message(user_message)
        return response.strip()
    except Exception as e:
        return f"Erreur IA: {str(e)}"

async def analyze_sales_data(sales_data: Dict) -> Dict:
    """Analyze sales data and provide insights."""
    try:
        prompt = f"""Analyse ces données de ventes d'un restaurant:
        
CA total: {sales_data.get('total_revenue', 0)}€
Nombre de commandes: {sales_data.get('total_orders', 0)}
Panier moyen: {sales_data.get('avg_basket', 0)}€
Top produits: {sales_data.get('top_products', [])}

Fournis un JSON avec:
- "insights": liste de 3 observations clés
- "recommendations": liste de 2 actions concrètes
- "alert": une alerte si nécessaire (null sinon)

Format strict JSON."""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id="sales-analysis",
            system_message="Tu es un analyste business pour restaurants. Réponds toujours en JSON valide."
        ).with_model("openai", "gpt-5")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        try:
            result = json.loads(response)
        except:
            # If not valid JSON, structure it
            result = {
                "insights": [response[:200]],
                "recommendations": ["Analyser en détail"],
                "alert": None
            }
        
        return result
    except Exception as e:
        return {
            "insights": [f"Erreur: {str(e)}"],
            "recommendations": [],
            "alert": None
        }

async def ai_chat(question: str, context: Dict = None) -> str:
    """AI chat for natural language queries."""
    try:
        system_prompt = "Tu es l'assistant IA du back-office Family's. Réponds aux questions sur les ventes, produits et commandes en français de manière concise et utile."
        
        context_str = ""
        if context:
            context_str = f"Contexte disponible: {context}\n\n"
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id="ai-chat",
            system_message=system_prompt
        ).with_model("openai", "gpt-5")
        
        user_message = UserMessage(text=f"{context_str}Question: {question}")
        response = await chat.send_message(user_message)
        
        return response.strip()
    except Exception as e:
        return f"Erreur: {str(e)}"

async def generate_promo_suggestion(sales_data: Dict) -> Dict:
    """Generate promo suggestions based on sales data."""
    try:
        prompt = f"""Basé sur ces données de ventes:
{sales_data}

Suggère une promotion pour booster les ventes. Réponds en JSON avec:
- "title": titre accrocheur
- "description": description courte
- "discount_type": "percentage" ou "fixed"
- "discount_value": valeur numérique
- "target": produit ou catégorie ciblé
- "duration_days": durée suggérée en jours

Format strict JSON."""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id="promo-suggestion",
            system_message="Tu es un expert en promotions restaurant. Réponds toujours en JSON valide."
        ).with_model("openai", "gpt-5")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        try:
            result = json.loads(response)
        except:
            result = {
                "title": "Promo suggérée",
                "description": response[:200],
                "discount_type": "percentage",
                "discount_value": 10,
                "target": "tous produits",
                "duration_days": 7
            }
        
        return result
    except Exception as e:
        return {"error": str(e)}

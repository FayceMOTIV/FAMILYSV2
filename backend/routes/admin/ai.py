from fastapi import APIRouter, Security
from middleware.auth import require_manager_or_admin
from services.ai_service import generate_marketing_text, analyze_sales_data, ai_chat, generate_promo_suggestion
from pydantic import BaseModel
from typing import Optional, Dict
from database import db
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/ai", tags=["admin-ai"])

class MarketingRequest(BaseModel):
    type: str  # social_post, product_description, promo_text
    context: Optional[str] = None
    product_id: Optional[str] = None

class ChatRequest(BaseModel):
    question: str

@router.post("/generate-marketing")
async def generate_marketing(request: MarketingRequest, current_user: dict = Security(require_manager_or_admin)):
    """Generate marketing content using AI."""
    restaurant_id = current_user.get("restaurant_id")
    
    # Build prompt based on type
    if request.type == "social_post":
        prompt = "Génère un post Instagram/Facebook accrocheur pour promouvoir Family's et ses burgers gourmands. Maximum 200 caractères avec emojis."
    elif request.type == "product_description":
        if request.product_id:
            product = await db.products.find_one({"id": request.product_id})
            if product:
                prompt = f"Génère une description appétissante pour ce produit: {product['name']}. Prix: {product['base_price']}€. Rends-le irrésistible!"
            else:
                prompt = "Génère une description de produit appétissante."
        else:
            prompt = "Génère une description de produit appétissante."
    elif request.type == "promo_text":
        prompt = "Génère un texte promotionnel percutant pour une offre spéciale chez Family's. Crée l'urgence!"
    else:
        prompt = request.context or "Génère du contenu marketing pour Family's."
    
    result = await generate_marketing_text(prompt, request.context or "")
    
    return {"generated_text": result, "type": request.type}

@router.get("/analyze-sales")
async def analyze_sales(current_user: dict = Security(require_manager_or_admin)):
    """Analyze sales data with AI."""
    restaurant_id = current_user.get("restaurant_id")
    
    # Get last 7 days data
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    orders = await db.orders.find({
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": seven_days_ago}
    }).to_list(length=None)
    
    if not orders:
        return {"message": "Pas assez de données pour l'analyse"}
    
    # Calculate metrics
    total_revenue = sum(o.get("total", 0) for o in orders)
    total_orders = len(orders)
    avg_basket = total_revenue / total_orders if total_orders > 0 else 0
    
    # Top products
    product_sales = {}
    for order in orders:
        for item in order.get("items", []):
            pid = item.get("product_id")
            pname = item.get("name")
            if pid not in product_sales:
                product_sales[pid] = {"name": pname, "quantity": 0, "revenue": 0}
            product_sales[pid]["quantity"] += item.get("quantity", 0)
            product_sales[pid]["revenue"] += item.get("total_price", 0)
    
    top_products = sorted(product_sales.values(), key=lambda x: x["revenue"], reverse=True)[:5]
    
    sales_data = {
        "total_revenue": round(total_revenue, 2),
        "total_orders": total_orders,
        "avg_basket": round(avg_basket, 2),
        "top_products": [f"{p['name']} ({p['quantity']} ventes, {p['revenue']:.2f}€)" for p in top_products]
    }
    
    # AI Analysis
    analysis = await analyze_sales_data(sales_data)
    
    return {"sales_data": sales_data, "ai_analysis": analysis}

@router.post("/chat")
async def ai_chat_endpoint(request: ChatRequest, current_user: dict = Security(require_manager_or_admin)):
    """AI chat for natural language queries."""
    restaurant_id = current_user.get("restaurant_id")
    
    # Get context data if needed
    context = {"restaurant_id": restaurant_id}
    
    # Simple context gathering based on question
    if any(word in request.question.lower() for word in ["ca", "chiffre", "vente", "revenu"]):
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_orders = await db.orders.find({
            "restaurant_id": restaurant_id,
            "created_at": {"$gte": today_start.isoformat()}
        }).to_list(length=None)
        context["today_revenue"] = sum(o.get("total", 0) for o in today_orders)
        context["today_orders"] = len(today_orders)
    
    response = ai_chat(request.question, context)
    
    return {"question": request.question, "response": response}

@router.get("/suggest-promo")
async def suggest_promo(current_user: dict = Security(require_manager_or_admin)):
    """Get AI-generated promo suggestion."""
    restaurant_id = current_user.get("restaurant_id")
    
    # Get recent sales data
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    orders = await db.orders.find({
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": seven_days_ago}
    }).to_list(length=None)
    
    sales_summary = f"Commandes 7 derniers jours: {len(orders)}, CA: {sum(o.get('total', 0) for o in orders):.2f}€"
    
    suggestion = generate_promo_suggestion({"summary": sales_summary})
    
    return {"suggestion": suggestion}

from fastapi import APIRouter, Security
from datetime import datetime, timedelta, timezone
from middleware.auth import require_manager_or_admin
from typing import Dict, List
import os

router = APIRouter(prefix="/dashboard", tags=["admin-dashboard"])

# Get DB dependency
from database import db

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Security(require_manager_or_admin)):
    """Get dashboard statistics."""
    restaurant_id = current_user.get("restaurant_id")
    
    # Get today's date range
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)
    
    # Get today's orders
    today_orders = await db.orders.find({
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": today_start.isoformat(), "$lt": today_end.isoformat()}
    }).to_list(length=None)
    
    # Calculate CA today
    ca_today = sum(order.get("total", 0) for order in today_orders)
    
    # Breakdown by payment method
    payment_breakdown = {}
    for order in today_orders:
        payment_method = order.get("payment_method", "card")
        payment_breakdown[payment_method] = payment_breakdown.get(payment_method, 0) + order.get("total", 0)
    
    # Count by status
    status_count = {}
    for order in today_orders:
        status = order.get("status", "new")
        status_count[status] = status_count.get(status, 0) + 1
    
    # Get last 7 days for top products
    seven_days_ago = today_start - timedelta(days=7)
    recent_orders = await db.orders.find({
        "restaurant_id": restaurant_id,
        "created_at": {"$gte": seven_days_ago.isoformat()}
    }).to_list(length=None)
    
    # Calculate top 5 products
    product_sales = {}
    for order in recent_orders:
        for item in order.get("items", []):
            product_id = item.get("product_id")
            product_name = item.get("name")
            quantity = item.get("quantity", 0)
            
            if product_id not in product_sales:
                product_sales[product_id] = {"name": product_name, "quantity": 0, "revenue": 0}
            
            product_sales[product_id]["quantity"] += quantity
            product_sales[product_id]["revenue"] += item.get("total_price", 0)
    
    top_products = sorted(
        product_sales.values(),
        key=lambda x: x["quantity"],
        reverse=True
    )[:5]
    
    # Get out of stock products
    out_of_stock = await db.products.count_documents({
        "restaurant_id": restaurant_id,
        "is_out_of_stock": True
    })
    
    return {
        "ca_today": round(ca_today, 2),
        "orders_today": len(today_orders),
        "payment_breakdown": payment_breakdown,
        "status_count": status_count,
        "top_products": top_products,
        "alerts": {
            "out_of_stock_count": out_of_stock
        }
    }

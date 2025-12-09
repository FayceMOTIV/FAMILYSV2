"""
Routes Dashboard - Firebase/Firestore
Stats et métriques pour le tableau de bord
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import db

router = APIRouter(prefix="/dashboard", tags=["firebase-dashboard"])

@router.get("/stats")
def get_dashboard_stats():
    """Stats générales du dashboard"""
    try:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = now - timedelta(days=7)
        
        # Commandes aujourd'hui
        orders_today = list(db.collection('orders').where('created_at', '>=', today_start).stream())
        
        # Calcul CA et répartition paiements
        ca_today = 0
        payment_breakdown = {}
        
        for order in orders_today:
            order_data = order.to_dict()
            if order_data.get('status') not in ['cancelled', 'refunded']:
                total = order_data.get('total', 0)
                ca_today += total
                
                # Répartition par méthode de paiement
                payment_method = order_data.get('payment_method', 'other')
                if payment_method:
                    # Normaliser les noms
                    method_lower = payment_method.lower()
                    if 'card' in method_lower or 'cb' in method_lower or 'stripe' in method_lower:
                        method_key = 'card'
                    elif 'cash' in method_lower or 'espece' in method_lower or 'espèce' in method_lower:
                        method_key = 'cash'
                    elif 'ticket' in method_lower:
                        method_key = 'ticket_resto'
                    elif 'cheque' in method_lower or 'chèque' in method_lower:
                        method_key = 'cheque'
                    elif 'apple' in method_lower:
                        method_key = 'apple_pay'
                    else:
                        method_key = 'other'
                    
                    payment_breakdown[method_key] = payment_breakdown.get(method_key, 0) + total
        
        # Commandes de la semaine pour top produits
        orders_week = list(db.collection('orders').where('created_at', '>=', week_ago).stream())
        
        # Top 5 produits (7 jours)
        product_stats = {}
        for order in orders_week:
            order_data = order.to_dict()
            if order_data.get('status') in ['cancelled', 'refunded']:
                continue
            for item in order_data.get('items', []):
                product_name = item.get('name', 'Unknown')
                quantity = item.get('quantity', 1)
                price = item.get('price', 0) * quantity
                
                if product_name not in product_stats:
                    product_stats[product_name] = {'quantity': 0, 'revenue': 0}
                product_stats[product_name]['quantity'] += quantity
                product_stats[product_name]['revenue'] += price
        
        # Trier par quantité et prendre top 5
        top_products = sorted(
            [{'name': k, 'quantity': v['quantity'], 'revenue': round(v['revenue'], 2)} 
             for k, v in product_stats.items()],
            key=lambda x: x['quantity'],
            reverse=True
        )[:5]
        
        # Nombre de clients
        customers_count = len(list(db.collection('customers').limit(1000).stream()))
        
        # Nombre de produits
        products_count = len(list(db.collection('products').stream()))
        
        # Alertes - produits en rupture de stock
        out_of_stock_count = 0
        try:
            products = db.collection('products').stream()
            for product in products:
                product_data = product.to_dict()
                # Vérifier si le produit est en rupture
                if product_data.get('out_of_stock', False) or \
                   product_data.get('is_out_of_stock', False) or \
                   product_data.get('stock', 999) <= 0:
                    out_of_stock_count += 1
        except:
            pass
        
        # Panier moyen
        panier_moyen = ca_today / len(orders_today) if orders_today else 0
        
        return {
            "ca_today": round(ca_today, 2),
            "orders_today": len(orders_today),
            "orders_week": len(orders_week),
            "customers_count": customers_count,
            "products_count": products_count,
            "panier_moyen": round(panier_moyen, 2),
            "alerts": {
                "out_of_stock_count": out_of_stock_count
            },
            "payment_breakdown": payment_breakdown,
            "top_products": top_products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/simple")
def get_simple_dashboard():
    """Stats simplifiées pour le mode commande"""
    try:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        orders_today = list(db.collection('orders').where('created_at', '>=', today_start).stream())
        
        ca_today = 0
        orders_completed = 0
        for order in orders_today:
            order_data = order.to_dict()
            if order_data.get('status') not in ['cancelled', 'refunded']:
                ca_today += order_data.get('total', 0)
            if order_data.get('status') in ['completed', 'delivered', 'ready']:
                orders_completed += 1
        
        return {
            "orders_completed": orders_completed,
            "ca_today": round(ca_today, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/top-products")
def get_top_products(days: int = 7, limit: int = 5):
    """Top produits sur une période"""
    try:
        now = datetime.now(timezone.utc)
        start_date = now - timedelta(days=days)
        
        # Récupérer les commandes de la période
        orders = list(db.collection('orders').where('created_at', '>=', start_date).stream())
        
        # Compter les produits
        product_counts = {}
        for order in orders:
            order_data = order.to_dict()
            if order_data.get('status') in ['cancelled', 'refunded']:
                continue
            for item in order_data.get('items', []):
                product_name = item.get('name', 'Unknown')
                quantity = item.get('quantity', 1)
                product_counts[product_name] = product_counts.get(product_name, 0) + quantity
        
        # Trier et limiter
        sorted_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        return {
            "top_products": [{"name": name, "count": count} for name, count in sorted_products],
            "period_days": days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/revenue")
def get_revenue_stats(days: int = 30):
    """Statistiques de revenus par jour"""
    try:
        now = datetime.now(timezone.utc)
        start_date = now - timedelta(days=days)
        
        orders = list(db.collection('orders').where('created_at', '>=', start_date).stream())
        
        # Grouper par jour
        daily_revenue = {}
        for order in orders:
            order_data = order.to_dict()
            if order_data.get('status') in ['cancelled', 'refunded']:
                continue
            
            created_at = order_data.get('created_at')
            if hasattr(created_at, 'date'):
                day = created_at.date().isoformat()
            else:
                day = str(created_at)[:10]
            
            daily_revenue[day] = daily_revenue.get(day, 0) + order_data.get('total', 0)
        
        return {
            "daily_revenue": [{"date": k, "revenue": round(v, 2)} for k, v in sorted(daily_revenue.items())],
            "total": round(sum(daily_revenue.values()), 2),
            "period_days": days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

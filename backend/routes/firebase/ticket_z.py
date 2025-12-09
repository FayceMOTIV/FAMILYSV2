"""
Ticket Z - Version Firebase
Gestion des clôtures journalières (Ticket Z)
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from pydantic import BaseModel, Field
import uuid

from firebase_config import db  # Firestore

router = APIRouter(prefix="/ticket-z", tags=["firebase-ticket-z"])


# ============================================
# MODÈLES PYDANTIC
# ============================================

class PaymentBreakdown(BaseModel):
    espece: float = 0.0
    cb: float = 0.0
    cheque: float = 0.0
    ticket_restaurant: float = 0.0
    online: float = 0.0
    apple_pay: float = 0.0


class TicketZCreate(BaseModel):
    date: str  # Format: YYYY-MM-DD


class TicketZ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str
    closed_by: str = "admin@familys.app"
    closed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_sales: float = 0.0
    total_orders: int = 0
    completed_orders: int = 0
    cancelled_orders: int = 0
    payment_breakdown: PaymentBreakdown = Field(default_factory=PaymentBreakdown)
    tva_collected: float = 0.0
    covers_count: int = 0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DailyStatus(BaseModel):
    date: str
    is_closed: bool = False
    needs_closure: bool = False
    pending_orders: int = 0
    can_close: bool = False
    ticket_z: Optional[TicketZ] = None


# ============================================
# HELPERS
# ============================================

def normalize_payment_method(method: str) -> str:
    """Normalise les méthodes de paiement."""
    method = (method or "").lower().strip()
    
    if method in ["espece", "especes", "cash", "liquide"]:
        return "espece"
    elif method in ["cb", "card", "carte", "stripe", "credit_card"]:
        return "cb"
    elif method in ["cheque", "check"]:
        return "cheque"
    elif method in ["ticket_restaurant", "ticket_resto", "tr"]:
        return "ticket_restaurant"
    elif method in ["online", "en_ligne", "web"]:
        return "online"
    elif method in ["apple_pay", "applepay"]:
        return "apple_pay"
    else:
        return "cb"  # Par défaut


async def get_orders_for_date(date_str: str) -> List[dict]:
    """Récupère toutes les commandes d'une date donnée depuis Firebase."""
    orders = []
    
    # Format des dates dans Firebase
    start_of_day = f"{date_str}T00:00:00"
    end_of_day = f"{date_str}T23:59:59"
    
    try:
        # Query Firestore - commandes du jour
        orders_ref = db.collection("orders")
        
        # Firestore ne supporte pas les range queries sur strings facilement
        # On récupère toutes les commandes et on filtre
        all_orders = orders_ref.stream()
        
        for doc in all_orders:
            order = doc.to_dict()
            order['id'] = doc.id
            
            # Vérifier la date
            created_at = order.get('created_at', '')
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat()
            
            # Filtrer par date
            if created_at and created_at >= start_of_day and created_at <= end_of_day:
                orders.append(order)
        
        return orders
        
    except Exception as e:
        print(f"Erreur récupération commandes: {e}")
        return []


# ============================================
# ROUTES
# ============================================

@router.post("", response_model=TicketZ)
async def create_ticket_z(data: TicketZCreate):
    """Créer un Ticket Z (clôture de journée)."""
    
    # Vérifier qu'il n'existe pas déjà un Ticket Z pour cette date
    tickets_ref = db.collection("tickets_z")
    existing_query = tickets_ref.where("date", "==", data.date).limit(1).stream()
    
    for doc in existing_query:
        raise HTTPException(status_code=400, detail="Cette journée a déjà été clôturée")
    
    # Récupérer toutes les commandes de cette journée
    orders = await get_orders_for_date(data.date)
    
    # Vérifier que toutes les commandes sont terminées ou annulées
    valid_statuses = ['completed', 'delivered', 'cancelled', 'picked_up']
    pending_orders = [o for o in orders if o.get('status') not in valid_statuses]
    
    if pending_orders:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible de clôturer : {len(pending_orders)} commande(s) en attente. Toutes les commandes doivent être terminées ou annulées."
        )
    
    # Calculer les statistiques
    completed = [o for o in orders if o.get('status') in ['completed', 'delivered', 'picked_up']]
    cancelled = [o for o in orders if o.get('status') == 'cancelled']
    
    total_sales = sum(float(o.get('total', 0)) for o in completed)
    
    # Répartition par mode de paiement
    payment_breakdown = PaymentBreakdown()
    
    for order in completed:
        # Si multi-paiement
        if 'payments' in order and isinstance(order['payments'], list):
            for payment in order['payments']:
                method = normalize_payment_method(payment.get('method', ''))
                amount = float(payment.get('amount', 0))
                setattr(payment_breakdown, method, getattr(payment_breakdown, method, 0) + amount)
        # Si paiement simple
        elif 'payment_method' in order:
            method = normalize_payment_method(order.get('payment_method', ''))
            amount = float(order.get('total', 0))
            setattr(payment_breakdown, method, getattr(payment_breakdown, method, 0) + amount)
    
    # TVA (10% sur le total)
    tva_collected = round(total_sales * 0.10, 2)
    
    # Nombre de couverts = nombre de commandes terminées
    covers_count = len(completed)
    
    # Créer le Ticket Z
    ticket_z = TicketZ(
        date=data.date,
        closed_by="admin@familys.app",
        total_sales=round(total_sales, 2),
        total_orders=len(orders),
        completed_orders=len(completed),
        cancelled_orders=len(cancelled),
        payment_breakdown=payment_breakdown,
        tva_collected=tva_collected,
        covers_count=covers_count
    )
    
    # Sauvegarder dans Firebase
    ticket_dict = ticket_z.dict()
    # Convertir les datetimes en ISO string pour Firestore
    ticket_dict['closed_at'] = ticket_dict['closed_at'].isoformat()
    ticket_dict['created_at'] = ticket_dict['created_at'].isoformat()
    
    tickets_ref.document(ticket_z.id).set(ticket_dict)
    
    print(f"✅ Ticket Z créé pour {data.date}: {total_sales}€")
    
    return ticket_z


@router.get("/daily-status/{date}", response_model=DailyStatus)
async def get_daily_status(date: str):
    """Obtenir le statut de clôture d'une journée."""
    
    # Vérifier si un Ticket Z existe pour cette date
    tickets_ref = db.collection("tickets_z")
    existing_query = tickets_ref.where("date", "==", date).limit(1).stream()
    
    ticket_z_data = None
    for doc in existing_query:
        ticket_z_data = doc.to_dict()
        ticket_z_data['id'] = doc.id
    
    # Récupérer les commandes de cette journée
    orders = await get_orders_for_date(date)
    
    valid_statuses = ['completed', 'delivered', 'cancelled', 'picked_up']
    pending_orders = [o for o in orders if o.get('status') not in valid_statuses]
    
    # Déterminer si la clôture est nécessaire (après 4h du matin le lendemain)
    now = datetime.now(timezone.utc)
    date_obj = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    next_day_4am = date_obj + timedelta(days=1, hours=4)
    needs_closure = now >= next_day_4am and ticket_z_data is None
    
    status = DailyStatus(
        date=date,
        is_closed=ticket_z_data is not None,
        needs_closure=needs_closure,
        pending_orders=len(pending_orders),
        can_close=len(pending_orders) == 0,
        ticket_z=TicketZ(**ticket_z_data) if ticket_z_data else None
    )
    
    return status


@router.get("", response_model=List[TicketZ])
async def list_tickets_z(limit: int = 30):
    """Lister les Tickets Z (les plus récents en premier)."""
    
    tickets_ref = db.collection("tickets_z")
    # Trier par date décroissante
    query = tickets_ref.order_by("date", direction="DESCENDING").limit(limit)
    
    tickets = []
    for doc in query.stream():
        ticket_data = doc.to_dict()
        ticket_data['id'] = doc.id
        tickets.append(TicketZ(**ticket_data))
    
    return tickets


@router.get("/{ticket_id}", response_model=TicketZ)
async def get_ticket_z(ticket_id: str):
    """Récupérer un Ticket Z par son ID."""
    
    doc = db.collection("tickets_z").document(ticket_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Ticket Z non trouvé")
    
    ticket_data = doc.to_dict()
    ticket_data['id'] = doc.id
    
    return TicketZ(**ticket_data)


@router.delete("/{ticket_id}")
async def delete_ticket_z(ticket_id: str):
    """Supprimer un Ticket Z (admin uniquement)."""
    
    doc_ref = db.collection("tickets_z").document(ticket_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Ticket Z non trouvé")
    
    doc_ref.delete()
    
    return {"success": True, "message": "Ticket Z supprimé"}

from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone, timedelta
from typing import List
import os

from models.ticket_z import TicketZ, TicketZCreate, DailyStatus, PaymentBreakdown
from database import get_db

router = APIRouter(prefix="/ticket-z", tags=["admin-ticket-z"])

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = MONGO_URL.split('/')[-1] if '/' in MONGO_URL else 'familys_restaurant'

@router.post("", response_model=TicketZ)
async def create_ticket_z(
    data: TicketZCreate,
    user_email: str = "admin@familys.app"  # TODO: Get from auth
):
    db = get_db()
    """Créer un Ticket Z (clôture de journée)."""
    
    # Vérifier qu'il n'existe pas déjà un Ticket Z pour cette date
    existing = await db.tickets_z.find_one({"date": data.date})
    if existing:
        raise HTTPException(status_code=400, detail="Cette journée a déjà été clôturée")
    
    # Récupérer toutes les commandes de cette journée
    orders = await db.orders.find({
        "created_at": {
            "$gte": f"{data.date}T00:00:00",
            "$lt": f"{data.date}T23:59:59"
        }
    }).to_list(length=None)
    
    # Vérifier que toutes les commandes sont terminées ou annulées
    pending_orders = [o for o in orders if o.get('status') not in ['completed', 'cancelled']]
    if pending_orders:
        raise HTTPException(
            status_code=400,
            detail=f"Impossible de clôturer : {len(pending_orders)} commande(s) en attente. Toutes les commandes doivent être terminées ou annulées."
        )
    
    # Calculer les statistiques
    completed = [o for o in orders if o.get('status') == 'completed']
    cancelled = [o for o in orders if o.get('status') == 'cancelled']
    
    total_sales = sum(float(o.get('total', 0)) for o in completed)
    
    # Répartition par mode de paiement
    payment_breakdown = PaymentBreakdown()
    for order in completed:
        # Si multi-paiement
        if 'payments' in order and isinstance(order['payments'], list):
            for payment in order['payments']:
                method = payment.get('method', '')
                amount = float(payment.get('amount', 0))
                if method == 'espece':
                    payment_breakdown.espece += amount
                elif method == 'cb':
                    payment_breakdown.cb += amount
                elif method == 'cheque':
                    payment_breakdown.cheque += amount
                elif method == 'ticket_restaurant':
                    payment_breakdown.ticket_restaurant += amount
                elif method == 'online':
                    payment_breakdown.online += amount
        # Si paiement simple
        elif 'payment_method' in order:
            method = order.get('payment_method', '')
            amount = float(order.get('total', 0))
            if method == 'espece':
                payment_breakdown.espece += amount
            elif method == 'cb':
                payment_breakdown.cb += amount
            elif method == 'cheque':
                payment_breakdown.cheque += amount
            elif method == 'ticket_restaurant':
                payment_breakdown.ticket_restaurant += amount
            elif method == 'online':
                payment_breakdown.online += amount
    
    # TVA (supposons 10% sur le total)
    tva_collected = total_sales * 0.10
    
    # Nombre de couverts (supposons nombre de commandes terminées)
    covers_count = len(completed)
    
    # Créer le Ticket Z
    ticket_z = TicketZ(
        date=data.date,
        closed_by=user_email,
        total_sales=total_sales,
        total_orders=len(orders),
        completed_orders=len(completed),
        cancelled_orders=len(cancelled),
        payment_breakdown=payment_breakdown,
        tva_collected=tva_collected,
        covers_count=covers_count
    )
    
    # Sauvegarder dans la base
    ticket_dict = ticket_z.dict()
    # Convertir les datetimes en ISO string pour MongoDB
    if isinstance(ticket_dict.get('closed_at'), datetime):
        ticket_dict['closed_at'] = ticket_dict['closed_at'].isoformat()
    if isinstance(ticket_dict.get('created_at'), datetime):
        ticket_dict['created_at'] = ticket_dict['created_at'].isoformat()
    
    await db.tickets_z.insert_one(ticket_dict)
    
    return ticket_z

@router.get("/daily-status/{date}", response_model=DailyStatus)
async def get_daily_status(
    date: str  # Format: YYYY-MM-DD
):
    db = get_db()
    """Obtenir le statut de clôture d'une journée."""
    
    # Vérifier si un Ticket Z existe pour cette date
    ticket_z = await db.tickets_z.find_one({"date": date})
    
    # Récupérer les commandes de cette journée
    orders = await db.orders.find({
        "created_at": {
            "$gte": f"{date}T00:00:00",
            "$lt": f"{date}T23:59:59"
        }
    }).to_list(length=None)
    
    pending_orders = [o for o in orders if o.get('status') not in ['completed', 'cancelled']]
    
    # Déterminer si la clôture est nécessaire (après 4h du matin le lendemain)
    now = datetime.now(timezone.utc)
    date_obj = datetime.strptime(date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    next_day_4am = date_obj + timedelta(days=1, hours=4)
    needs_closure = now >= next_day_4am and ticket_z is None
    
    status = DailyStatus(
        date=date,
        is_closed=ticket_z is not None,
        needs_closure=needs_closure,
        pending_orders=len(pending_orders),
        can_close=len(pending_orders) == 0,
        ticket_z=TicketZ(**ticket_z) if ticket_z else None
    )
    
    return status

@router.get("", response_model=List[TicketZ])
async def list_tickets_z(
    limit: int = 30
):
    db = get_db()
    """Lister les Tickets Z."""
    tickets = await db.tickets_z.find().sort("date", -1).limit(limit).to_list(length=limit)
    return [TicketZ(**t) for t in tickets]

@router.get("/{ticket_id}", response_model=TicketZ)
async def get_ticket_z(
    ticket_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Récupérer un Ticket Z par son ID."""
    ticket = await db.tickets_z.find_one({"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket Z non trouvé")
    return TicketZ(**ticket)

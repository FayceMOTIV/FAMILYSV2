from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import datetime, timezone
import uuid

class PaymentBreakdown(BaseModel):
    """Répartition par mode de paiement."""
    espece: float = 0.0
    cb: float = 0.0
    cheque: float = 0.0
    ticket_restaurant: float = 0.0
    online: float = 0.0

class TicketZ(BaseModel):
    """Modèle pour le Ticket Z (clôture de journée)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # Date de la journée clôturée (YYYY-MM-DD)
    closed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    closed_by: str  # Email de l'utilisateur qui a clôturé
    
    # Statistiques de vente
    total_sales: float = 0.0  # Total des ventes
    total_orders: int = 0  # Nombre de commandes
    completed_orders: int = 0  # Commandes terminées
    cancelled_orders: int = 0  # Commandes annulées
    
    # Répartition par mode de paiement
    payment_breakdown: PaymentBreakdown = Field(default_factory=PaymentBreakdown)
    
    # TVA
    tva_collected: float = 0.0  # TVA collectée
    
    # Nombre de couverts
    covers_count: int = 0
    
    # Métadonnées
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class TicketZCreate(BaseModel):
    """Données pour créer un Ticket Z."""
    date: str  # Date de la journée à clôturer (YYYY-MM-DD)

class DailyStatus(BaseModel):
    """Statut de la journée."""
    date: str
    is_closed: bool
    needs_closure: bool  # True si après 4h et pas encore clôturé
    pending_orders: int  # Commandes non terminées/annulées
    can_close: bool  # True si toutes les commandes sont terminées ou annulées
    ticket_z: Optional[TicketZ] = None

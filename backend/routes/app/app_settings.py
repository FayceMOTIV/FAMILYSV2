from fastapi import APIRouter, HTTPException
from database import db
from datetime import datetime, timedelta

router = APIRouter(prefix="/settings", tags=["app-settings"])

@router.get("/app-config")
async def get_app_config():
    """Récupère la configuration pour l'app mobile (modes, créneaux, etc.)"""
    restaurant_id = "default"
    settings = await db.settings.find_one({"restaurant_id": restaurant_id}, {"_id": 0})
    
    if not settings:
        # Valeurs par défaut si pas de settings
        settings = {}
    
    return {
        "enable_delivery": settings.get("enable_delivery", False),
        "enable_takeaway": settings.get("enable_takeaway", True),
        "enable_onsite": settings.get("enable_onsite", True),
        "enable_reservations": settings.get("enable_reservations", False),
        "time_slot_interval": settings.get("time_slot_interval", 15),
        "preparation_time_minutes": settings.get("preparation_time_minutes", 15),
        "order_cutoff_minutes": settings.get("order_cutoff_minutes", 20),
        "order_hours": settings.get("order_hours", {}),
        "opening_hours": settings.get("opening_hours", {}),
        "is_paused": settings.get("is_paused", False),
        "pause_reason": settings.get("pause_reason"),
        "no_more_orders_today": settings.get("no_more_orders_today", False),
    }

@router.get("/time-slots")
async def get_available_time_slots(date: str = None):
    """Génère les créneaux horaires disponibles pour une date donnée"""
    restaurant_id = "default"
    settings = await db.settings.find_one({"restaurant_id": restaurant_id}, {"_id": 0})
    
    if not settings:
        settings = {}
    
    # Paramètres
    interval = settings.get("time_slot_interval", 15)
    prep_time = settings.get("preparation_time_minutes", 15)
    order_hours = settings.get("order_hours", {})
    
    # Date demandée ou aujourd'hui
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
        except:
            target_date = datetime.now()
    else:
        target_date = datetime.now()
    
    # Jour de la semaine (lundi=0, dimanche=6)
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    day_name = days[target_date.weekday()]
    
    # Récupérer les horaires du jour
    day_hours = order_hours.get(day_name, {})
    if not day_hours or not day_hours.get("open"):
        # Horaires par défaut si non configurés
        day_hours = {"open": "11:00", "close": "22:00"}
    
    open_time = day_hours.get("open", "11:00")
    close_time = day_hours.get("close", "22:00")
    
    # Générer les créneaux
    slots = []
    try:
        open_h, open_m = map(int, open_time.split(":"))
        close_h, close_m = map(int, close_time.split(":"))
        
        current = target_date.replace(hour=open_h, minute=open_m, second=0, microsecond=0)
        end = target_date.replace(hour=close_h, minute=close_m, second=0, microsecond=0)
        
        # Si c'est aujourd'hui, commencer après maintenant + temps de préparation
        now = datetime.now()
        if target_date.date() == now.date():
            min_time = now + timedelta(minutes=prep_time)
            # Arrondir au prochain créneau
            minutes_since_open = (min_time.hour * 60 + min_time.minute) - (open_h * 60 + open_m)
            if minutes_since_open > 0:
                slots_passed = (minutes_since_open // interval) + 1
                current = current + timedelta(minutes=slots_passed * interval)
        
        while current <= end:
            slots.append(current.strftime("%H:%M"))
            current += timedelta(minutes=interval)
            
    except Exception as e:
        # Fallback: créneaux par défaut
        slots = ["12:00", "12:15", "12:30", "12:45", "13:00", "19:00", "19:15", "19:30", "20:00", "20:30", "21:00"]
    
    return {
        "date": target_date.strftime("%Y-%m-%d"),
        "day": day_name,
        "open_time": open_time,
        "close_time": close_time,
        "interval": interval,
        "slots": slots
    }

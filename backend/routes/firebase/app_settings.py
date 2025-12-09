"""
Routes App Settings - Firebase/Firestore
Configuration et créneaux horaires pour l'app mobile
CORRIGÉ : Utilise order_hours avec start1/end1/start2/end2
"""
from fastapi import APIRouter, HTTPException
from firebase_config import db
from datetime import datetime, timedelta

router = APIRouter(prefix="/app-settings", tags=["app-settings"])

@router.get("/app-config")
def get_app_config():
    """Récupère la configuration pour l'app mobile (modes, créneaux, etc.)"""
    try:
        doc = db.collection('settings').document('restaurant').get()
        settings = doc.to_dict() if doc.exists else {}
        
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/time-slots")
def get_available_time_slots(date: str = None):
    """
    Génère les créneaux horaires disponibles pour une date donnée.
    CORRIGÉ : Utilise order_hours avec start1/end1 et start2/end2 (2 plages horaires possibles)
    """
    try:
        doc = db.collection('settings').document('restaurant').get()
        settings = doc.to_dict() if doc.exists else {}
        
        # Paramètres
        interval = settings.get("time_slot_interval", 15)
        prep_time = settings.get("preparation_time_minutes", 15)
        order_hours = settings.get("order_hours", {})
        
        # Fallback sur opening_hours si order_hours est vide
        if not order_hours:
            order_hours = settings.get("opening_hours", {})
        
        # Date demandée ou aujourd'hui
        if date:
            try:
                target_date = datetime.strptime(date, "%Y-%m-%d")
            except:
                target_date = datetime.now()
        else:
            target_date = datetime.now()
        
        # Jour de la semaine
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        day_name = days[target_date.weekday()]
        
        # Récupérer les horaires du jour
        day_hours = order_hours.get(day_name, {})
        
        # Vérifier si le jour est désactivé
        if day_hours.get("disabled", False):
            return {
                "date": target_date.strftime("%Y-%m-%d"),
                "day": day_name,
                "is_closed": True,
                "message": "Commandes fermées ce jour",
                "slots": []
            }
        
        slots = []
        now = datetime.now()
        is_today = target_date.date() == now.date()
        
        def generate_slots_for_period(start_time: str, end_time: str):
            """Génère les créneaux pour une période donnée"""
            period_slots = []
            if not start_time or not end_time:
                return period_slots
                
            try:
                start_h, start_m = map(int, start_time.split(":"))
                end_h, end_m = map(int, end_time.split(":"))
                
                current = target_date.replace(hour=start_h, minute=start_m, second=0, microsecond=0)
                end = target_date.replace(hour=end_h, minute=end_m, second=0, microsecond=0)
                
                # Si c'est aujourd'hui, ne proposer que les créneaux futurs + temps de préparation
                if is_today:
                    min_time = now + timedelta(minutes=prep_time)
                    if current < min_time:
                        # Arrondir au prochain créneau
                        minutes_since_start = (min_time.hour * 60 + min_time.minute) - (start_h * 60 + start_m)
                        if minutes_since_start > 0:
                            slots_passed = (minutes_since_start // interval) + 1
                            current = current + timedelta(minutes=slots_passed * interval)
                
                while current <= end:
                    # Ne pas ajouter si c'est dans le passé
                    if not is_today or current > now:
                        period_slots.append(current.strftime("%H:%M"))
                    current += timedelta(minutes=interval)
                    
            except Exception as e:
                print(f"Erreur génération créneaux: {e}")
                
            return period_slots
        
        # ============================================
        # STRUCTURE CORRIGÉE: start1/end1 et start2/end2
        # ============================================
        
        # Première plage horaire (ex: 11:30 - 14:00)
        start1 = day_hours.get("start1") or day_hours.get("open1") or day_hours.get("open")
        end1 = day_hours.get("end1") or day_hours.get("close1") or day_hours.get("close")
        
        if start1 and end1:
            slots.extend(generate_slots_for_period(start1, end1))
        
        # Deuxième plage horaire (ex: 18:30 - 22:00)
        start2 = day_hours.get("start2") or day_hours.get("open2")
        end2 = day_hours.get("end2") or day_hours.get("close2")
        
        if start2 and end2:
            slots.extend(generate_slots_for_period(start2, end2))
        
        # Si aucun créneau défini, utiliser des valeurs par défaut
        if not slots and not day_hours.get("disabled"):
            # Valeurs par défaut : midi et soir
            default_slots = generate_slots_for_period("11:30", "14:00")
            default_slots.extend(generate_slots_for_period("18:30", "22:00"))
            slots = default_slots
        
        # Supprimer les doublons et trier
        slots = sorted(list(set(slots)))
        
        return {
            "date": target_date.strftime("%Y-%m-%d"),
            "day": day_name,
            "is_closed": False,
            "period_1": {"start": start1 or "11:30", "end": end1 or "14:00"} if start1 else None,
            "period_2": {"start": start2 or "18:30", "end": end2 or "22:00"} if start2 else None,
            "interval": interval,
            "slots": slots
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/restaurant-status")
def get_restaurant_status():
    """Vérifie si le restaurant accepte les commandes"""
    try:
        doc = db.collection('settings').document('restaurant').get()
        settings = doc.to_dict() if doc.exists else {}
        
        is_paused = settings.get("is_paused", False)
        no_more_today = settings.get("no_more_orders_today", False)
        pause_reason = settings.get("pause_reason", "")
        
        # Vérifier si on est dans les horaires de commande
        now = datetime.now()
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        day_name = days[now.weekday()]
        
        order_hours = settings.get("order_hours", {})
        day_hours = order_hours.get(day_name, {})
        
        is_in_order_hours = False
        current_time = now.strftime("%H:%M")
        
        if not day_hours.get("disabled"):
            # Vérifier première plage
            start1 = day_hours.get("start1", "")
            end1 = day_hours.get("end1", "")
            if start1 and end1 and start1 <= current_time <= end1:
                is_in_order_hours = True
            
            # Vérifier deuxième plage
            start2 = day_hours.get("start2", "")
            end2 = day_hours.get("end2", "")
            if start2 and end2 and start2 <= current_time <= end2:
                is_in_order_hours = True
        
        can_order = not is_paused and not no_more_today and is_in_order_hours
        
        message = ""
        if is_paused:
            message = pause_reason or "Les commandes sont temporairement suspendues"
        elif no_more_today:
            message = "Plus de commandes pour aujourd'hui"
        elif not is_in_order_hours:
            message = "Les commandes ne sont pas ouvertes actuellement"
        
        return {
            "can_order": can_order,
            "is_paused": is_paused,
            "no_more_today": no_more_today,
            "is_in_order_hours": is_in_order_hours,
            "message": message,
            "current_time": current_time
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

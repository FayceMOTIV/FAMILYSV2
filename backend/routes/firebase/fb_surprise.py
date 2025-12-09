"""
Routes Firebase pour Surprise du Jour
Système avec 25% de chances de perdre, 75% de gagner
"""
from fastapi import APIRouter, HTTPException
from firebase_admin import firestore
from firebase_config import db
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid
import random

router = APIRouter(prefix="/surprise", tags=["Surprise du Jour"])

# ==================== STATS ====================

@router.get("/stats")
async def get_surprise_stats():
    """Stats complètes avec coûts et projections"""
    try:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        plays_ref = db.collection('surprise_plays')
        rewards_ref = db.collection('surprise_rewards')
        
        plays_list = [p.to_dict() for p in plays_ref.stream()]
        rewards_list = [r.to_dict() for r in rewards_ref.stream()]
        
        # Compteurs de jeux
        spins_today = 0
        spins_month = 0
        wins_month = 0
        losses_month = 0
        
        for p in plays_list:
            created = p.get('created_at')
            if created:
                if hasattr(created, 'replace'):
                    created = created.replace(tzinfo=timezone.utc)
                if created >= today_start:
                    spins_today += 1
                if created >= month_start:
                    spins_month += 1
                    if p.get('result') == 'win':
                        wins_month += 1
                    elif p.get('result') == 'lose':
                        losses_month += 1
        
        # État des récompenses
        active = 0
        used = 0
        expired = 0
        monthly_cost = 0
        monthly_cost_potential = 0
        
        for r in rewards_list:
            is_used = r.get('is_used', False)
            expires_at = r.get('expires_at', now)
            created_at = r.get('created_at', now)
            used_at = r.get('used_at')
            reward_value = float(r.get('reward_value', 0))
            
            if hasattr(expires_at, 'replace'):
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if hasattr(created_at, 'replace'):
                created_at = created_at.replace(tzinfo=timezone.utc)
            
            if is_used:
                used += 1
                # Coût réel = récompenses utilisées
                if used_at:
                    if hasattr(used_at, 'replace'):
                        used_at = used_at.replace(tzinfo=timezone.utc)
                    if used_at >= month_start:
                        monthly_cost += reward_value
            elif expires_at > now:
                active += 1
            else:
                expired += 1
            
            # Coût potentiel = toutes les récompenses du mois (utilisées ou non)
            if created_at >= month_start:
                monthly_cost_potential += reward_value
        
        # Taux de conversion
        total_rewards = used + active + expired
        conversion_rate = round((used / total_rewards * 100) if total_rewards > 0 else 0, 1)
        
        # Taux de victoire
        win_rate = round((wins_month / spins_month * 100) if spins_month > 0 else 0, 1)
        
        return {
            "spins_today": spins_today,
            "spins_month": spins_month,
            "wins_month": wins_month,
            "losses_month": losses_month,
            "win_rate": win_rate,
            "active_rewards": active,
            "used_rewards": used,
            "expired_rewards": expired,
            "monthly_cost": round(monthly_cost, 2),
            "monthly_cost_potential": round(monthly_cost_potential, 2),
            "conversion_rate": conversion_rate
        }
    except Exception as e:
        print(f"Error in stats: {e}")
        return {
            "spins_today": 0, "spins_month": 0, "wins_month": 0, "losses_month": 0,
            "win_rate": 0, "active_rewards": 0, "used_rewards": 0, "expired_rewards": 0,
            "monthly_cost": 0, "monthly_cost_potential": 0, "conversion_rate": 0
        }

# ==================== CONFIG ====================

@router.get("/config")
async def get_configs():
    """Récupérer toutes les configurations de récompenses"""
    try:
        configs = [c.to_dict() | {'id': c.id} for c in db.collection('surprise_configs').stream()]
        return {"configs": configs}
    except Exception as e:
        return {"configs": []}

@router.post("/config")
async def create_config(config: dict):
    """Créer une nouvelle configuration de récompense"""
    try:
        config['created_at'] = firestore.SERVER_TIMESTAMP
        config['is_active'] = config.get('is_active', True)
        doc_ref = db.collection('surprise_configs').add(config)
        return {"success": True, "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/config/{config_id}")
async def update_config(config_id: str, config: dict):
    """Mettre à jour une configuration"""
    try:
        config['updated_at'] = firestore.SERVER_TIMESTAMP
        db.collection('surprise_configs').document(config_id).update(config)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/config/{config_id}")
async def delete_config(config_id: str):
    """Supprimer une configuration"""
    try:
        db.collection('surprise_configs').document(config_id).delete()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== SETTINGS ====================

@router.get("/settings")
async def get_settings():
    """Récupérer les paramètres du module"""
    try:
        doc = db.collection('settings').document('surprise').get()
        if doc.exists:
            data = doc.to_dict()
            # S'assurer que win_probability existe
            if 'win_probability' not in data:
                data['win_probability'] = 75
            return data
        return {
            "module_active": True,
            "reward_expiration_days": 7,
            "win_probability": 75  # 75% de chance de gagner
        }
    except:
        return {
            "module_active": True,
            "reward_expiration_days": 7,
            "win_probability": 75
        }

@router.put("/settings")
async def update_settings(settings: dict):
    """Mettre à jour les paramètres"""
    try:
        settings['updated_at'] = firestore.SERVER_TIMESTAMP
        db.collection('settings').document('surprise').set(settings, merge=True)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== REWARDS ====================

@router.get("/rewards")
async def get_rewards(status: str = None, user_id: str = None):
    """Récupérer les récompenses avec filtrage optionnel"""
    try:
        rewards = []
        # Récupérer toutes les récompenses puis filtrer (évite problème index Firestore)
        for r in db.collection('surprise_rewards').order_by('created_at', direction=firestore.Query.DESCENDING).stream():
            reward_data = r.to_dict() | {'id': r.id}
            rewards.append(reward_data)
        
        # Filtrer par user_id si fourni
        if user_id:
            rewards = [r for r in rewards if r.get('user_id') == user_id]
        
        now = datetime.now(timezone.utc)
        
        if status == 'active':
            rewards = [r for r in rewards if not r.get('is_used') and _parse_date(r.get('expires_at', now)) > now]
        elif status == 'used':
            rewards = [r for r in rewards if r.get('is_used')]
        elif status == 'expired':
            rewards = [r for r in rewards if not r.get('is_used') and _parse_date(r.get('expires_at', now)) <= now]
        
        return {"rewards": rewards}
    except Exception as e:
        return {"rewards": []}

def _parse_date(dt):
    """Helper pour parser les dates avec timezone"""
    if hasattr(dt, 'replace'):
        return dt.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc)

# ==================== RECENT WINNERS ====================

@router.get("/recent-winners")
async def get_recent_winners(limit: int = 5):
    """Récupérer les derniers gagnants pour affichage dans l'app"""
    try:
        rewards = list(db.collection('surprise_rewards').order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit).stream())
        winners = []
        now = datetime.now(timezone.utc)
        
        for r in rewards:
            data = r.to_dict()
            created = data.get('created_at', now)
            if hasattr(created, 'replace'):
                created = created.replace(tzinfo=timezone.utc)
            
            diff = now - created
            if diff < timedelta(hours=1):
                time_str = f"Il y a {max(1, int(diff.total_seconds() / 60))} min"
            elif diff < timedelta(days=1):
                time_str = f"Il y a {int(diff.total_seconds() / 3600)}h"
            else:
                days = int(diff.total_seconds() / 86400)
                time_str = f"Il y a {days}j" if days > 1 else "Hier"
            
            winners.append({
                "user_name": data.get('user_name', 'Client'),
                "reward_label": data.get('reward_label', 'Récompense'),
                "time_ago": time_str
            })
        
        return winners
    except:
        return []

# ==================== GAME STATUS ====================

@router.get("/status")
async def get_play_status(user_id: str):
    """Vérifier si un utilisateur peut jouer aujourd'hui"""
    try:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        plays = list(db.collection('surprise_plays').where('user_id', '==', user_id).stream())
        
        for p in plays:
            created = p.to_dict().get('created_at', now)
            if hasattr(created, 'replace'):
                created = created.replace(tzinfo=timezone.utc)
            if created >= today_start:
                # A déjà joué aujourd'hui
                tomorrow = today_start + timedelta(days=1)
                return {
                    "can_play": False,
                    "already_played": True,
                    "next_play_time": tomorrow.isoformat()
                }
        
        return {"can_play": True, "already_played": False}
    except:
        return {"can_play": True, "already_played": False}

# ==================== PLAY GAME ====================

@router.post("/play")
async def play_game(user_id: str, user_name: str = "Client"):
    """
    Jouer au jeu Surprise du Jour
    - 1 fois par jour par utilisateur (reset à minuit)
    - win_probability% de chance de gagner (défaut 75%)
    - Répartition des gains selon les configs actives
    """
    try:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Vérifier si déjà joué aujourd'hui
        plays = list(db.collection('surprise_plays').where('user_id', '==', user_id).stream())
        for p in plays:
            created = p.to_dict().get('created_at', now)
            if hasattr(created, 'replace'):
                created = created.replace(tzinfo=timezone.utc)
            if created >= today_start:
                return {
                    "success": False,
                    "can_play": False,
                    "message": "Vous avez déjà joué aujourd'hui ! Revenez demain 🎰"
                }
        
        # Récupérer les settings
        settings = await get_settings()
        if not settings.get('module_active', True):
            return {"success": False, "message": "Le jeu est temporairement désactivé"}
        
        win_probability = settings.get('win_probability', 75)
        exp_days = settings.get('reward_expiration_days', 7)
        
        # TIRAGE 1 : Gagné ou Perdu ?
        roll = random.randint(1, 100)
        is_winner = roll <= win_probability
        
        if not is_winner:
            # PERDU ! 😢
            db.collection('surprise_plays').add({
                "user_id": user_id,
                "user_name": user_name,
                "created_at": firestore.SERVER_TIMESTAMP,
                "result": "lose",
                "roll": roll,
                "win_probability": win_probability
            })
            
            return {
                "success": True,
                "result": "lose",
                "message": "Pas de chance cette fois ! 😢 Retente demain !",
                "reward": None
            }
        
        # GAGNÉ ! 🎉 - Tirage de la récompense
        configs = [c.to_dict() | {'id': c.id} for c in db.collection('surprise_configs').where('is_active', '==', True).stream()]
        
        if not configs:
            return {"success": False, "message": "Aucune récompense configurée"}
        
        # Vérifier les limites max_per_day
        valid_configs = []
        for c in configs:
            max_per_day = c.get('max_per_day', 0)
            if max_per_day > 0:
                # Compter combien ont été distribués aujourd'hui
                today_count = len([r for r in db.collection('surprise_rewards')
                    .where('config_id', '==', c['id'])
                    .stream()
                    if _parse_date(r.to_dict().get('created_at', now)) >= today_start])
                
                if today_count >= max_per_day:
                    continue  # Limite atteinte
            valid_configs.append(c)
        
        if not valid_configs:
            # Toutes les récompenses ont atteint leur limite
            valid_configs = configs  # Fallback sur toutes les configs
        
        # TIRAGE 2 : Quelle récompense ?
        total_prob = sum(c.get('probability', 0) for c in valid_configs)
        if total_prob == 0:
            total_prob = len(valid_configs) * 10  # Fallback équiprobable
            for c in valid_configs:
                c['probability'] = 10
        
        rand = random.uniform(0, total_prob)
        cumulative = 0
        selected = valid_configs[0]
        
        for c in valid_configs:
            cumulative += c.get('probability', 0)
            if rand <= cumulative:
                selected = c
                break
        
        # Créer le code unique
        code = f"SDJ-{uuid.uuid4().hex[:8].upper()}"
        label = selected.get('label', f"{selected.get('reward_value')}")
        
        # Enregistrer le jeu
        db.collection('surprise_plays').add({
            "user_id": user_id,
            "user_name": user_name,
            "created_at": firestore.SERVER_TIMESTAMP,
            "result": "win",
            "roll": roll,
            "win_probability": win_probability,
            "reward_type": selected.get('reward_type'),
            "config_id": selected.get('id')
        })
        
        # Vérifier si c'est un cashback (auto-crédité)
        is_cashback = selected.get('reward_type') == 'cashback'
        reward_value = selected.get('reward_value', 0)
        
        # Si CASHBACK : créditer automatiquement sur le solde fidélité
        if is_cashback:
            # Trouver le customer par user_id
            customers = list(db.collection('customers').where('uid', '==', user_id).stream())
            if customers:
                customer_doc = customers[0]
                customer_data = customer_doc.to_dict()
                current_balance = float(customer_data.get('loyalty_balance', 0))
                new_balance = round(current_balance + reward_value, 2)
                
                # Mettre à jour le solde fidélité
                db.collection('customers').document(customer_doc.id).update({
                    'loyalty_balance': new_balance,
                    'updated_at': firestore.SERVER_TIMESTAMP
                })
        
        # Créer la récompense
        reward_data = {
            "user_id": user_id,
            "user_name": user_name,
            "code": code,
            "config_id": selected.get('id'),
            "reward_type": selected.get('reward_type'),
            "reward_value": reward_value,
            "reward_label": label,
            "product_id": selected.get('product_id'),
            "product_name": selected.get('product_name'),
            "is_used": is_cashback,  # Cashback est auto-utilisé
            "used_at": firestore.SERVER_TIMESTAMP if is_cashback else None,
            "created_at": firestore.SERVER_TIMESTAMP,
            "expires_at": now + timedelta(days=exp_days)
        }
        db.collection('surprise_rewards').add(reward_data)
        
        # Message personnalisé selon le type
        if is_cashback:
            message = f"🎉 {label} ont été crédités sur votre compte fidélité !"
        else:
            message = f"🎉 Félicitations ! Vous avez gagné {label} !"
        
        return {
            "success": True,
            "result": "win",
            "message": message,
            "reward": {
                "type": selected.get('reward_type'),
                "value": reward_value,
                "label": label,
                "code": code if not is_cashback else None,  # Pas de code pour cashback
                "product_id": selected.get('product_id'),
                "product_name": selected.get('product_name'),
                "expires_at": (now + timedelta(days=exp_days)).isoformat(),
                "auto_credited": is_cashback
            }
        }
    
    except Exception as e:
        print(f"Error in play_game: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== USE REWARD ====================

@router.post("/use-reward/{code}")
async def use_reward(code: str, order_id: str = None):
    """Utiliser une récompense lors d'une commande"""
    try:
        now = datetime.now(timezone.utc)
        
        # Chercher la récompense
        rewards = list(db.collection('surprise_rewards').where('code', '==', code).stream())
        
        if not rewards:
            return {"success": False, "message": "Code invalide"}
        
        reward_doc = rewards[0]
        reward_data = reward_doc.to_dict()
        
        if reward_data.get('is_used'):
            return {"success": False, "message": "Cette récompense a déjà été utilisée"}
        
        expires_at = reward_data.get('expires_at', now)
        if hasattr(expires_at, 'replace'):
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        if expires_at <= now:
            return {"success": False, "message": "Cette récompense a expiré"}
        
        # Marquer comme utilisée
        db.collection('surprise_rewards').document(reward_doc.id).update({
            "is_used": True,
            "used_at": firestore.SERVER_TIMESTAMP,
            "order_id": order_id
        })
        
        return {
            "success": True,
            "message": "Récompense appliquée !",
            "reward": {
                "type": reward_data.get('reward_type'),
                "value": reward_data.get('reward_value'),
                "label": reward_data.get('reward_label'),
                "product_id": reward_data.get('product_id')
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== VALIDATE REWARD ====================

@router.get("/validate-reward/{code}")
async def validate_reward(code: str):
    """Valider un code récompense (vérifier sans utiliser)"""
    try:
        now = datetime.now(timezone.utc)
        
        rewards = list(db.collection('surprise_rewards').where('code', '==', code).stream())
        
        if not rewards:
            return {"valid": False, "message": "Code invalide"}
        
        reward_data = rewards[0].to_dict()
        
        if reward_data.get('is_used'):
            return {"valid": False, "message": "Déjà utilisée"}
        
        expires_at = reward_data.get('expires_at', now)
        if hasattr(expires_at, 'replace'):
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        if expires_at <= now:
            return {"valid": False, "message": "Expirée"}
        
        return {
            "valid": True,
            "reward": {
                "type": reward_data.get('reward_type'),
                "value": reward_data.get('reward_value'),
                "label": reward_data.get('reward_label'),
                "product_id": reward_data.get('product_id'),
                "product_name": reward_data.get('product_name')
            }
        }
    
    except Exception as e:
        return {"valid": False, "message": str(e)}

"""
Routes Firebase pour Surprise du Jour
"""
from fastapi import APIRouter, HTTPException
from firebase_admin import firestore
from firebase_config import db
from datetime import datetime, timedelta
from typing import Optional
import uuid
import random

router = APIRouter(prefix="/surprise", tags=["Surprise du Jour"])

@router.get("/stats")
async def get_surprise_stats():
    try:
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        plays_ref = db.collection('surprise_plays')
        rewards_ref = db.collection('surprise_rewards')
        
        plays_list = [p.to_dict() for p in plays_ref.stream()]
        rewards_list = [r.to_dict() for r in rewards_ref.stream()]
        
        spins_today = len([p for p in plays_list if p.get('created_at') and p['created_at'].replace(tzinfo=None) >= today_start])
        spins_month = len([p for p in plays_list if p.get('created_at') and p['created_at'].replace(tzinfo=None) >= month_start])
        
        active = len([r for r in rewards_list if not r.get('is_used') and r.get('expires_at', now).replace(tzinfo=None) > now])
        used = len([r for r in rewards_list if r.get('is_used')])
        expired = len([r for r in rewards_list if not r.get('is_used') and r.get('expires_at', now).replace(tzinfo=None) <= now])
        
        monthly_cost = sum(float(r.get('reward_value', 0)) for r in rewards_list if r.get('is_used') and r.get('used_at') and r['used_at'].replace(tzinfo=None) >= month_start)
        
        return {
            "spins_today": spins_today,
            "spins_month": spins_month,
            "active_rewards": active,
            "used_rewards": used,
            "expired_rewards": expired,
            "monthly_cost": round(monthly_cost, 2),
            "conversion_rate": round((used / len(rewards_list) * 100) if rewards_list else 0, 1)
        }
    except Exception as e:
        print(f"Error: {e}")
        return {"spins_today": 0, "spins_month": 0, "active_rewards": 0, "used_rewards": 0, "expired_rewards": 0, "monthly_cost": 0, "conversion_rate": 0}

@router.get("/config")
async def get_configs():
    try:
        configs = [c.to_dict() | {'id': c.id} for c in db.collection('surprise_configs').stream()]
        return {"configs": configs}
    except Exception as e:
        return {"configs": []}

@router.post("/config")
async def create_config(config: dict):
    try:
        config['created_at'] = firestore.SERVER_TIMESTAMP
        config['is_active'] = config.get('is_active', True)
        doc_ref = db.collection('surprise_configs').add(config)
        return {"success": True, "id": doc_ref[1].id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/config/{config_id}")
async def update_config(config_id: str, config: dict):
    try:
        db.collection('surprise_configs').document(config_id).update(config)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/config/{config_id}")
async def delete_config(config_id: str):
    try:
        db.collection('surprise_configs').document(config_id).delete()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/settings")
async def get_settings():
    try:
        doc = db.collection('settings').document('surprise').get()
        if doc.exists:
            return doc.to_dict()
        return {"module_active": True, "reward_expiration_days": 7}
    except:
        return {"module_active": True, "reward_expiration_days": 7}

@router.put("/settings")
async def update_settings(settings: dict):
    try:
        db.collection('settings').document('surprise').set(settings, merge=True)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rewards")
async def get_rewards(status: str = None):
    try:
        rewards = [r.to_dict() | {'id': r.id} for r in db.collection('surprise_rewards').order_by('created_at', direction=firestore.Query.DESCENDING).stream()]
        now = datetime.now()
        if status == 'active':
            rewards = [r for r in rewards if not r.get('is_used') and r.get('expires_at', now).replace(tzinfo=None) > now]
        elif status == 'used':
            rewards = [r for r in rewards if r.get('is_used')]
        elif status == 'expired':
            rewards = [r for r in rewards if not r.get('is_used') and r.get('expires_at', now).replace(tzinfo=None) <= now]
        return {"rewards": rewards}
    except Exception as e:
        return {"rewards": []}

@router.get("/recent-winners")
async def get_recent_winners(limit: int = 5):
    try:
        rewards = list(db.collection('surprise_rewards').order_by('created_at', direction=firestore.Query.DESCENDING).limit(limit).stream())
        winners = []
        now = datetime.now()
        for r in rewards:
            data = r.to_dict()
            created = data.get('created_at', now)
            if hasattr(created, 'replace'):
                created = created.replace(tzinfo=None)
            diff = now - created
            if diff < timedelta(hours=1):
                time_str = f"Il y a {max(1, int(diff.total_seconds() / 60))} min"
            elif diff < timedelta(days=1):
                time_str = f"Il y a {int(diff.total_seconds() / 3600)}h"
            else:
                time_str = "Hier"
            winners.append({"user_name": data.get('user_name', 'Client'), "reward_label": data.get('reward_label', 'Recompense'), "time_ago": time_str})
        return winners
    except:
        return []

@router.get("/status")
async def get_play_status(user_id: str):
    try:
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        plays = list(db.collection('surprise_plays').where('user_id', '==', user_id).stream())
        for p in plays:
            created = p.to_dict().get('created_at', now)
            if hasattr(created, 'replace'):
                created = created.replace(tzinfo=None)
            if created >= today_start:
                return {"can_play": False, "next_play_time": (today_start + timedelta(days=1)).isoformat()}
        return {"can_play": True}
    except:
        return {"can_play": True}

@router.post("/play")
async def play_game(user_id: str):
    try:
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        plays = list(db.collection('surprise_plays').where('user_id', '==', user_id).stream())
        for p in plays:
            created = p.to_dict().get('created_at', now)
            if hasattr(created, 'replace'):
                created = created.replace(tzinfo=None)
            if created >= today_start:
                return {"success": False, "can_play": False, "message": "Vous avez deja joue aujourd'hui !"}
        
        configs = [c.to_dict() | {'id': c.id} for c in db.collection('surprise_configs').where('is_active', '==', True).stream()]
        if not configs:
            return {"success": False, "message": "Aucune recompense configuree"}
        
        total_prob = sum(c.get('probability', 0) for c in configs)
        rand = random.uniform(0, total_prob)
        cumulative = 0
        selected = configs[0]
        for c in configs:
            cumulative += c.get('probability', 0)
            if rand <= cumulative:
                selected = c
                break
        
        db.collection('surprise_plays').add({"user_id": user_id, "created_at": firestore.SERVER_TIMESTAMP, "reward_type": selected.get('reward_type')})
        
        settings = await get_settings()
        exp_days = settings.get('reward_expiration_days', 7)
        code = f"SDJ-{uuid.uuid4().hex[:8].upper()}"
        
        label = selected.get('label', str(selected.get('reward_value')))
        
        reward = {
            "user_id": user_id,
            "code": code,
            "reward_type": selected.get('reward_type'),
            "reward_value": selected.get('reward_value'),
            "reward_label": label,
            "is_used": False,
            "created_at": firestore.SERVER_TIMESTAMP,
            "expires_at": now + timedelta(days=exp_days)
        }
        db.collection('surprise_rewards').add(reward)
        
        return {
            "success": True,
            "message": f"Felicitations ! Vous avez gagne {label} !",
            "reward": {"type": selected.get('reward_type'), "value": selected.get('reward_value'), "label": label, "code": code}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

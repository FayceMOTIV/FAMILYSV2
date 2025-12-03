from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List
import random
from database import db
from models.surprise import SurpriseReward, SurpriseStatus, SurprisePlayResult

router = APIRouter()

POSSIBLE_REWARDS = [
    {"type": "discount_percent", "value": 10, "label": "-10% sur ta prochaine commande 🎉", "probability": 0.30},
    {"type": "discount_percent", "value": 20, "label": "-20% sur ta prochaine commande 🔥", "probability": 0.15},
    {"type": "discount_amount", "value": 5, "label": "5€ de réduction 💰", "probability": 0.25},
    {"type": "cashback", "value": 3, "label": "3€ de cashback ⭐", "probability": 0.20},
    {"type": "product", "value": 0, "label": "Dessert offert 🍰", "probability": 0.10}
]

@router.get("/surprise-du-jour/status", response_model=SurpriseStatus)
async def get_surprise_status(user_id: str):
    try:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        plays_today = await db.surprise_plays.count_documents({"user_id": user_id, "created_at": {"$gte": today_start}})
        can_play = plays_today < 1
        if can_play:
            return SurpriseStatus(can_play=True, plays_today=plays_today, message="Tu peux jouer ! 🎮")
        else:
            next_play = today_start + timedelta(days=1)
            return SurpriseStatus(can_play=False, next_play_time=next_play, plays_today=plays_today, message="Reviens demain pour rejouer ! ⏰")
    except Exception as e:
        print(f"Error checking surprise status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/surprise-du-jour/play", response_model=SurprisePlayResult)
async def play_surprise(user_id: str, user_email: str, user_name: str = None):
    try:
        status = await get_surprise_status(user_id)
        if not status.can_play:
            return SurprisePlayResult(success=False, message=status.message)
        rand = random.random()
        cumulative_prob = 0
        selected_reward_config = None
        for reward_config in POSSIBLE_REWARDS:
            cumulative_prob += reward_config["probability"]
            if rand <= cumulative_prob:
                selected_reward_config = reward_config
                break
        if not selected_reward_config:
            selected_reward_config = POSSIBLE_REWARDS[0]
        reward_id = f"reward_{user_id}_{int(datetime.utcnow().timestamp())}"
        expires_at = datetime.utcnow() + timedelta(days=7)
        reward = SurpriseReward(id=reward_id, user_id=user_id, user_email=user_email, user_name=user_name, reward_type=selected_reward_config["type"], reward_value=selected_reward_config["value"], reward_label=selected_reward_config["label"], claimed=False, expires_at=expires_at)
        await db.surprise_rewards.insert_one(reward.dict())
        await db.surprise_plays.insert_one({"user_id": user_id, "user_email": user_email, "reward_id": reward_id, "created_at": datetime.utcnow()})
        return SurprisePlayResult(success=True, reward=reward, message="Félicitations ! 🎉")
    except Exception as e:
        print(f"Error playing surprise: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/surprise-du-jour/rewards/{user_id}", response_model=List[SurpriseReward])
async def get_user_rewards(user_id: str):
    try:
        rewards = await db.surprise_rewards.find({"user_id": user_id, "expires_at": {"$gte": datetime.utcnow()}}, {"_id": 0}).to_list(100)
        return rewards
    except Exception as e:
        print(f"Error fetching rewards: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/surprise-du-jour/claim")
async def claim_reward(reward_id: str, user_id: str):
    try:
        reward = await db.surprise_rewards.find_one({"id": reward_id, "user_id": user_id, "claimed": False, "expires_at": {"$gte": datetime.utcnow()}})
        if not reward:
            raise HTTPException(status_code=404, detail="Récompense introuvable ou déjà utilisée")
        await db.surprise_rewards.update_one({"id": reward_id}, {"$set": {"claimed": True, "claimed_at": datetime.utcnow()}})
        return {"success": True, "message": "Récompense utilisée avec succès ! 🎉"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error claiming reward: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List
from database import db
from models.surprise import RecentWinner

router = APIRouter()

@router.get("/surprise-du-jour/recent-winners", response_model=List[RecentWinner])
async def get_recent_winners(limit: int = 10):
    try:
        recent_rewards = await db.surprise_rewards.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
        winners = []
        for reward in recent_rewards:
            time_diff = datetime.utcnow() - reward.get("created_at", datetime.utcnow())
            if time_diff < timedelta(hours=1):
                time_str = f"Il y a {int(time_diff.total_seconds() / 60)} min"
            elif time_diff < timedelta(days=1):
                time_str = f"Il y a {int(time_diff.total_seconds() / 3600)}h"
            else:
                time_str = "Hier"
            winners.append(RecentWinner(name=reward.get("user_name", "Anonyme"), reward=reward.get("reward_label", "Récompense"), time=time_str))
        return winners
    except Exception as e:
        print(f"Error fetching recent winners: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/surprise-du-jour/stats")
async def get_surprise_stats():
    try:
        total_plays = await db.surprise_plays.count_documents({})
        total_rewards = await db.surprise_rewards.count_documents({})
        claimed_rewards = await db.surprise_rewards.count_documents({"claimed": True})
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        plays_today = await db.surprise_plays.count_documents({"created_at": {"$gte": today_start}})
        return {"total_plays": total_plays, "total_rewards": total_rewards, "claimed_rewards": claimed_rewards, "plays_today": plays_today}
    except Exception as e:
        print(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

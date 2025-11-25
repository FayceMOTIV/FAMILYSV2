from fastapi import APIRouter, HTTPException, Security, status
from typing import List, Optional
from models.reservation import Reservation, ReservationCreate, ReservationUpdate
from middleware.auth import require_manager_or_admin
from datetime import datetime, timezone, date
from database import db

router = APIRouter(prefix="/reservations", tags=["admin-reservations"])

@router.get("", response_model=List[Reservation])
async def get_reservations(
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    current_user: dict = Security(require_manager_or_admin)
):
    restaurant_id = current_user.get("restaurant_id")
    query = {"restaurant_id": restaurant_id}
    
    if status:
        query["status"] = status
    if date_from:
        query["reservation_date"] = {"$gte": date_from}
    
    reservations = await db.reservations.find(query).sort("reservation_date", 1).to_list(length=None)
    return [Reservation(**r) for r in reservations]

@router.post("", response_model=Reservation, status_code=status.HTTP_201_CREATED)
async def create_reservation(reservation_create: ReservationCreate, current_user: dict = Security(require_manager_or_admin)):
    restaurant_id = current_user.get("restaurant_id")
    reservation = Reservation(restaurant_id=restaurant_id, **reservation_create.model_dump())
    await db.reservations.insert_one(reservation.model_dump())
    return reservation

@router.patch("/{reservation_id}/status", response_model=Reservation)
async def update_reservation_status(reservation_id: str, status_update: ReservationUpdate, current_user: dict = Security(require_manager_or_admin)):
    restaurant_id = current_user.get("restaurant_id")
    existing = await db.reservations.find_one({"id": reservation_id, "restaurant_id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    update_data = status_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    await db.reservations.update_one({"id": reservation_id}, {"$set": update_data})
    
    updated = await db.reservations.find_one({"id": reservation_id})
    return Reservation(**updated)

@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reservation(reservation_id: str, current_user: dict = Security(require_manager_or_admin)):
    restaurant_id = current_user.get("restaurant_id")
    result = await db.reservations.delete_one({"id": reservation_id, "restaurant_id": restaurant_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")

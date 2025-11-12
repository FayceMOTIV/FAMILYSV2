from fastapi import APIRouter, HTTPException, Security, status, Query
from typing import List, Optional
from models.customer import Customer, CustomerCreate, CustomerUpdate
from middleware.auth import require_manager_or_admin
from datetime import datetime, timezone
from database import db

router = APIRouter(prefix="/customers", tags=["admin-customers"])

@router.get("")  # response_model=List[Customer]
async def get_customers(
    segment: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, le=500),
    skip: int = 0
    # current_user: dict = Security(require_manager_or_admin)
):
    restaurant_id = "default"  # current_user.get("restaurant_id")
    query = {"restaurant_id": restaurant_id}
    
    if segment:
        query["segment"] = segment
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    customers = await db.customers.find(query).skip(skip).limit(limit).to_list(length=None)
    for c in customers:
        c.pop("_id", None)
    return {"customers": customers}

@router.post("", response_model=Customer, status_code=status.HTTP_201_CREATED)
async def create_customer(customer_create: CustomerCreate, current_user: dict = Security(require_manager_or_admin)):
    restaurant_id = current_user.get("restaurant_id")
    customer = Customer(restaurant_id=restaurant_id, **customer_create.model_dump())
    await db.customers.insert_one(customer.model_dump())
    return customer

@router.put("/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_update: CustomerUpdate, current_user: dict = Security(require_manager_or_admin)):
    restaurant_id = current_user.get("restaurant_id")
    existing = await db.customers.find_one({"id": customer_id, "restaurant_id": restaurant_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = customer_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    await db.customers.update_one({"id": customer_id}, {"$set": update_data})
    
    updated = await db.customers.find_one({"id": customer_id})
    return Customer(**updated)

@router.get("/stats/segments")
async def get_customer_segments(current_user: dict = Security(require_manager_or_admin)):
    restaurant_id = current_user.get("restaurant_id")
    pipeline = [
        {"$match": {"restaurant_id": restaurant_id}},
        {"$group": {
            "_id": "$segment",
            "count": {"$sum": 1},
            "total_spent": {"$sum": "$total_spent"}
        }}
    ]
    result = await db.customers.aggregate(pipeline).to_list(length=None)
    return {"segments": result}

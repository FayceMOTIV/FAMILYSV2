from fastapi import APIRouter, HTTPException, Security, status, Query
from typing import List, Optional
from models.order import Order, OrderStatusUpdate, OrderStatus
from middleware.auth import require_manager_or_admin
from datetime import datetime, timezone

router = APIRouter(prefix="/orders", tags=["admin-orders"])

from database import db

@router.get("", response_model=List[Order])
async def get_orders(
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    payment_method: Optional[str] = None,
    limit: int = Query(100, le=500),
    skip: int = 0,
    current_user: dict = Security(require_manager_or_admin)
):
    """Get orders with filters."""
    restaurant_id = current_user.get("restaurant_id")
    
    query = {"restaurant_id": restaurant_id}
    
    if status:
        query["status"] = status
    
    if payment_method:
        query["payment_method"] = payment_method
    
    if date_from and date_to:
        query["created_at"] = {
            "$gte": date_from,
            "$lte": date_to
        }
    
    orders = await db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    return [Order(**o) for o in orders]

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str,
    current_user: dict = Security(require_manager_or_admin)
):
    """Get single order."""
    restaurant_id = current_user.get("restaurant_id")
    
    order = await db.orders.find_one({
        "id": order_id,
        "restaurant_id": restaurant_id
    })
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return Order(**order)

@router.patch("/{order_id}/status", response_model=Order)
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_user: dict = Security(require_manager_or_admin)
):
    """Update order status."""
    restaurant_id = current_user.get("restaurant_id")
    
    # Validate status
    valid_statuses = [
        OrderStatus.NEW,
        OrderStatus.IN_PREPARATION,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.READY,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELED
    ]
    
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    # Check if order exists
    existing = await db.orders.find_one({
        "id": order_id,
        "restaurant_id": restaurant_id
    })
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Update status
    await db.orders.update_one(
        {"id": order_id},
        {
            "$set": {
                "status": status_update.status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Get updated order
    updated_order = await db.orders.find_one({"id": order_id})
    return Order(**updated_order)

@router.get("/stats/summary")
async def get_orders_summary(current_user: dict = Security(require_manager_or_admin)):
    """Get orders summary statistics."""
    restaurant_id = current_user.get("restaurant_id")
    
    # Count by status
    pipeline = [
        {"$match": {"restaurant_id": restaurant_id}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_revenue": {"$sum": "$total"}
        }}
    ]
    
    result = await db.orders.aggregate(pipeline).to_list(length=None)
    
    return {
        "by_status": [
            {"status": item["_id"], "count": item["count"], "revenue": item["total_revenue"]}
            for item in result
        ]
    }

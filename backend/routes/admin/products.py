from fastapi import APIRouter, HTTPException, Security, status
from typing import List, Optional
from ...models.product import Product, ProductCreate, ProductUpdate
from ...middleware.auth import require_manager_or_admin
from datetime import datetime, timezone

router = APIRouter(prefix="/products", tags=["admin-products"])

from ...server import db

@router.get("", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    current_user: dict = Security(require_manager_or_admin)
):
    """Get all products for restaurant."""
    restaurant_id = current_user.get("restaurant_id")
    
    query = {"restaurant_id": restaurant_id}
    if category:
        query["category"] = category
    
    products = await db.products.find(query).to_list(length=None)
    return [Product(**p) for p in products]

@router.get("/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    current_user: dict = Security(require_manager_or_admin)
):
    """Get single product."""
    restaurant_id = current_user.get("restaurant_id")
    
    product = await db.products.find_one({
        "id": product_id,
        "restaurant_id": restaurant_id
    })
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return Product(**product)

@router.post("", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_create: ProductCreate,
    current_user: dict = Security(require_manager_or_admin)
):
    """Create new product."""
    restaurant_id = current_user.get("restaurant_id")
    
    # Check if slug already exists
    existing = await db.products.find_one({
        "slug": product_create.slug,
        "restaurant_id": restaurant_id
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this slug already exists"
        )
    
    product = Product(
        restaurant_id=restaurant_id,
        **product_create.model_dump()
    )
    
    await db.products.insert_one(product.model_dump())
    return product

@router.put("/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user: dict = Security(require_manager_or_admin)
):
    """Update product."""
    restaurant_id = current_user.get("restaurant_id")
    
    # Get existing product
    existing = await db.products.find_one({
        "id": product_id,
        "restaurant_id": restaurant_id
    })
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Update fields
    update_data = product_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    # Get updated product
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: dict = Security(require_manager_or_admin)
):
    """Delete product."""
    restaurant_id = current_user.get("restaurant_id")
    
    result = await db.products.delete_one({
        "id": product_id,
        "restaurant_id": restaurant_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

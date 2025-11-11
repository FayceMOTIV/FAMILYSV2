from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import User, UserCreate, UserLogin, UserResponse
from utils.auth import verify_password, get_password_hash, create_access_token
from typing import Optional
import os

router = APIRouter(prefix="/auth", tags=["admin-auth"])

@router.post("/login")
async def login(credentials: UserLogin):
    """Admin login endpoint."""
    from database import db
    
    # Find user by email
    user_dict = await db.users.find_one({"email": credentials.email})
    
    if not user_dict:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    user = User(**user_dict)
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    # Create access token
    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": user.role,
            "restaurant_id": user.restaurant_id
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            restaurant_id=user.restaurant_id,
            is_active=user.is_active
        )
    }

@router.post("/register", response_model=UserResponse)
async def register(user_create: UserCreate):
    """Register new admin user (for initial setup only)."""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_create.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = get_password_hash(user_create.password)
    
    # Create user
    user = User(
        email=user_create.email,
        password_hash=password_hash,
        name=user_create.name,
        role=user_create.role,
        restaurant_id=user_create.restaurant_id
    )
    
    # Store in database
    user_dict = user.model_dump()
    await db.users.insert_one(user_dict)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        restaurant_id=user.restaurant_id,
        is_active=user.is_active
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(lambda: None)):
    """Get current user info."""
    # This will be implemented with proper auth middleware
    pass

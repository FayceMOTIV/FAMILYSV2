"""
Routes d'authentification publiques pour l'app mobile
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import uuid4
import bcrypt
from database import db

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    address: str = ""

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: str
    address: str
    created_at: str

@router.post("/auth/login")
async def login(request: LoginRequest):
    """Connexion utilisateur"""
    try:
        # Chercher l'utilisateur
        user = await db.customers.find_one(
            {"email": request.email.lower()},
            {"_id": 0}
        )
        
        if not user:
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        # Vérifier le mot de passe
        if not bcrypt.checkpw(request.password.encode('utf-8'), user['password'].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        # Retourner les infos utilisateur (sans le password)
        user_data = {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "phone": user.get("phone", ""),
            "address": user.get("address", ""),
            "created_at": user.get("created_at", "")
        }
        
        return {"user": user_data, "message": "Connexion réussie"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur login: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/register")
async def register(request: RegisterRequest):
    """Inscription utilisateur"""
    try:
        # Vérifier si l'email existe déjà
        existing_user = await db.customers.find_one(
            {"email": request.email.lower()},
            {"_id": 0}
        )
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        
        # Hasher le mot de passe
        hashed_password = bcrypt.hashpw(
            request.password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Créer l'utilisateur
        user_id = str(uuid4())
        new_user = {
            "id": user_id,
            "email": request.email.lower(),
            "password": hashed_password,
            "name": request.name,
            "phone": request.phone,
            "address": request.address,
            "loyalty_points": 0,
            "total_orders": 0,
            "total_spent": 0.0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        await db.customers.insert_one(new_user)
        
        # Retourner les infos utilisateur (sans le password)
        user_data = {
            "id": new_user["id"],
            "email": new_user["email"],
            "name": new_user["name"],
            "phone": new_user["phone"],
            "address": new_user["address"],
            "created_at": new_user["created_at"]
        }
        
        return {"user": user_data, "message": "Inscription réussie"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erreur register: {e}")
        raise HTTPException(status_code=500, detail=str(e))

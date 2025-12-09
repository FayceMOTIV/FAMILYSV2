"""
Routes d'authentification Firebase pour l'app mobile
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
from typing import Optional
import bcrypt

from firebase_config import db  # Firebase Firestore

router = APIRouter(prefix="/auth", tags=["firebase-auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str = ""
    address: str = ""


class UserResponse(BaseModel):
    id: str
    uid: str
    email: str
    name: str
    phone: str
    address: str
    loyalty_balance: float
    total_orders: int
    total_spent: float
    created_at: str


@router.post("/login")
def login(request: LoginRequest):
    """Connexion utilisateur via Firebase"""
    try:
        email_lower = request.email.lower().strip()
        
        # Chercher l'utilisateur dans Firebase par email
        customers_ref = db.collection('customers')
        query = customers_ref.where('email', '==', email_lower).limit(1)
        docs = list(query.stream())
        
        if not docs:
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        doc = docs[0]
        user = doc.to_dict()
        user_id = doc.id
        
        # Vérifier le mot de passe
        stored_password = user.get('password', '')
        if not stored_password:
            raise HTTPException(status_code=401, detail="Compte sans mot de passe. Utilisez Firebase Auth.")
        
        if not bcrypt.checkpw(request.password.encode('utf-8'), stored_password.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
        
        # Mettre à jour last_login
        customers_ref.document(user_id).update({
            'last_login': datetime.now(timezone.utc).isoformat()
        })
        
        # Préparer la réponse
        created_at = user.get('created_at', '')
        if hasattr(created_at, 'isoformat'):
            created_at = created_at.isoformat()
        
        user_data = {
            "id": user_id,
            "uid": user_id,
            "email": user.get("email", ""),
            "name": user.get("name", user.get("first_name", "")),
            "first_name": user.get("first_name", user.get("name", "")),
            "last_name": user.get("last_name", ""),
            "phone": user.get("phone", ""),
            "address": user.get("address", ""),
            "loyalty_balance": float(user.get("loyalty_balance", 0)),
            "total_orders": int(user.get("total_orders", 0)),
            "total_spent": float(user.get("total_spent", 0)),
            "created_at": created_at
        }
        
        print(f"✅ Login réussi: {email_lower}")
        return {"user": user_data, "message": "Connexion réussie"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur login: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register")
def register(request: RegisterRequest):
    """Inscription utilisateur via Firebase"""
    try:
        email_lower = request.email.lower().strip()
        
        # Vérifier si l'email existe déjà
        customers_ref = db.collection('customers')
        existing = customers_ref.where('email', '==', email_lower).limit(1).stream()
        
        if any(existing):
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        
        # Hasher le mot de passe
        hashed_password = bcrypt.hashpw(
            request.password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Créer l'utilisateur dans Firebase
        now = datetime.now(timezone.utc).isoformat()
        
        new_user = {
            "email": email_lower,
            "password": hashed_password,
            "name": request.name,
            "first_name": request.name.split()[0] if request.name else "",
            "last_name": " ".join(request.name.split()[1:]) if len(request.name.split()) > 1 else "",
            "phone": request.phone,
            "address": request.address,
            "loyalty_balance": 0.0,
            "total_orders": 0,
            "total_spent": 0.0,
            "is_blocked": False,
            "created_at": now,
            "updated_at": now
        }
        
        # Ajouter à Firebase (génère un ID automatique)
        doc_ref = customers_ref.add(new_user)[1]
        user_id = doc_ref.id
        
        # Préparer la réponse
        user_data = {
            "id": user_id,
            "uid": user_id,
            "email": new_user["email"],
            "name": new_user["name"],
            "first_name": new_user["first_name"],
            "last_name": new_user["last_name"],
            "phone": new_user["phone"],
            "address": new_user["address"],
            "loyalty_balance": 0.0,
            "total_orders": 0,
            "total_spent": 0.0,
            "created_at": now
        }
        
        print(f"✅ Inscription réussie: {email_lower} (ID: {user_id})")
        return {"user": user_data, "message": "Inscription réussie"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur register: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me/{user_id}")
def get_current_user(user_id: str):
    """Récupérer les infos de l'utilisateur connecté"""
    try:
        doc = db.collection('customers').document(user_id).get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        user = doc.to_dict()
        
        created_at = user.get('created_at', '')
        if hasattr(created_at, 'isoformat'):
            created_at = created_at.isoformat()
        
        user_data = {
            "id": doc.id,
            "uid": doc.id,
            "email": user.get("email", ""),
            "name": user.get("name", user.get("first_name", "")),
            "first_name": user.get("first_name", ""),
            "last_name": user.get("last_name", ""),
            "phone": user.get("phone", ""),
            "address": user.get("address", ""),
            "loyalty_balance": float(user.get("loyalty_balance", 0)),
            "total_orders": int(user.get("total_orders", 0)),
            "total_spent": float(user.get("total_spent", 0)),
            "created_at": created_at
        }
        
        return {"user": user_data}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur get_current_user: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/me/{user_id}")
def update_current_user(user_id: str, data: dict):
    """Mettre à jour le profil utilisateur"""
    try:
        doc_ref = db.collection('customers').document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
        
        # Champs autorisés à modifier
        allowed_fields = ['name', 'first_name', 'last_name', 'phone', 'address']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        doc_ref.update(update_data)
        
        # Récupérer les données mises à jour
        updated = doc_ref.get().to_dict()
        
        return {
            "success": True,
            "user": {
                "id": user_id,
                "uid": user_id,
                **{k: updated.get(k, "") for k in allowed_fields},
                "email": updated.get("email", ""),
                "loyalty_balance": float(updated.get("loyalty_balance", 0))
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Erreur update_current_user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

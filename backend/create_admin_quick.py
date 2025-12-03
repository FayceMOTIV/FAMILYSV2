import asyncio
from database import db
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    email = "admin@familys.app"
    password = "admin123"
    
    # Vérifier si admin existe déjà
    existing = await db.users.find_one({"email": email})
    if existing:
        print(f"✅ Admin existe déjà")
        print(f"Email: {email}")
        print(f"Password: {password}")
        return
    
    # Créer admin
    admin = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password": pwd_context.hash(password),
        "name": "Admin",
        "role": "admin",
        "phone": "",
        "is_active": True
    }
    
    await db.users.insert_one(admin)
    print(f"✅ Admin créé!")
    print(f"Email: {email}")
    print(f"Password: {password}")

asyncio.run(create_admin())

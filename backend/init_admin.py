"""
Script to initialize default admin user for Family's Back Office.
Run this once to create the first admin account.
"""
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from models.user import User, UserRole
from utils.auth import get_password_hash
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def init_admin():
    """Initialize default admin user."""
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": "admin@familys.app"})
    
    if existing_admin:
        print("✅ Admin user already exists")
        print(f"   Email: admin@familys.app")
        client.close()
        return
    
    # Create default admin
    default_restaurant_id = "familys-bourg-en-bresse"
    
    admin = User(
        email="admin@familys.app",
        password_hash=get_password_hash("Admin@123456"),
        name="Admin Family's",
        role=UserRole.ADMIN,
        restaurant_id=default_restaurant_id,
        is_active=True
    )
    
    # Insert into database
    await db.users.insert_one(admin.model_dump())
    
    print("✅ Default admin user created successfully!")
    print(f"   Email: admin@familys.app")
    print(f"   Password: Admin@123456")
    print(f"   Restaurant ID: {default_restaurant_id}")
    print("\n⚠️  IMPORTANT: Change the password after first login!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_admin())

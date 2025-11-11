from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# Import admin routes
from routes.admin import auth as admin_auth
from routes.admin import dashboard as admin_dashboard
from routes.admin import products as admin_products
from routes.admin import categories as admin_categories
from routes.admin import orders as admin_orders
from routes.admin import ai as admin_ai
from routes.admin import promos as admin_promos
from routes.admin import customers as admin_customers
from routes.admin import notifications as admin_notifications
from routes.admin import reservations as admin_reservations
from routes.admin import settings as admin_settings

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import shared database
from database import db, close_db

# Create the main app without a prefix
app = FastAPI(title="Family's API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Create admin router with /api/v1/admin prefix
admin_router = APIRouter(prefix="/api/v1/admin")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include admin routes
admin_router.include_router(admin_auth.router)
admin_router.include_router(admin_dashboard.router)
admin_router.include_router(admin_products.router)
admin_router.include_router(admin_categories.router)
admin_router.include_router(admin_orders.router)
admin_router.include_router(admin_ai.router)
admin_router.include_router(admin_promos.router)
admin_router.include_router(admin_customers.router)
admin_router.include_router(admin_notifications.router)
admin_router.include_router(admin_reservations.router)
admin_router.include_router(admin_settings.router)

# Include the routers in the main app
app.include_router(api_router)
app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    close_db()
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
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
from routes.admin import promotions as admin_promotions
from routes.admin import customers as admin_customers
from routes.admin import notifications as admin_notifications
from routes.admin import reservations as admin_reservations
from routes.admin import settings as admin_settings
from routes.admin import ai_marketing as admin_ai_marketing
from routes.admin import choice_library as admin_choice_library
from routes.admin import upload as admin_upload
from routes.admin import options as admin_options
from routes.admin import refunds as admin_refunds
from routes.admin import stock as admin_stock
from routes.admin import ticket_z as admin_ticket_z
from routes.admin import pause as admin_pause
from routes.admin import dashboard_simple as admin_dashboard_simple
from routes import notifications as notifications_routes
from routes import cashback as cashback_routes
from routes import orders as orders_routes
from routes import restaurant as restaurant_routes
from routes import auth as auth_routes
from routes import categories as categories_routes
from routes import products as products_routes
from routes.app import promotions as app_promotions
from routes.app import cart as app_cart
from routes.app import app_settings as app_settings
from routes import surprise as surprise_routes
from routes.admin import surprise as admin_surprise_routes
from routes.admin import popups as admin_popups
from routes import popups as popups_routes

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
    pass

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
admin_router.include_router(admin_promotions.router)
admin_router.include_router(admin_customers.router)
admin_router.include_router(admin_notifications.router)
admin_router.include_router(admin_reservations.router)
admin_router.include_router(admin_settings.router)
admin_router.include_router(admin_ai_marketing.router)
admin_router.include_router(admin_choice_library.router)
admin_router.include_router(admin_upload.router)
admin_router.include_router(admin_options.router)
admin_router.include_router(admin_refunds.router)
admin_router.include_router(admin_stock.router)
admin_router.include_router(admin_ticket_z.router)
admin_router.include_router(admin_pause.router)
admin_router.include_router(admin_dashboard_simple.router)
admin_router.include_router(admin_popups.router)

# Routes publiques pour popups
app.include_router(popups_routes.router, prefix="/api/v1", tags=["popups"])


# Routes publiques pour notifications
app.include_router(notifications_routes.router, prefix="/api/v1", tags=["notifications"])

# Routes publiques pour cashback
app.include_router(cashback_routes.router, prefix="/api/v1", tags=["cashback"])

# Routes publiques pour orders
app.include_router(orders_routes.router, prefix="/api/v1", tags=["orders"])

# Routes publiques pour restaurant info
app.include_router(restaurant_routes.router, prefix="/api/v1", tags=["restaurant"])

# Routes publiques pour auth
app.include_router(auth_routes.router, prefix="/api/v1", tags=["auth"])

# Routes publiques pour categories
app.include_router(categories_routes.router, prefix="/api/v1", tags=["categories"])

# Routes publiques pour products
app.include_router(products_routes.router, prefix="/api/v1", tags=["products"])

# Routes publiques pour promotions (app)
app.include_router(app_promotions.router, prefix="/api/v1", tags=["promotions"])
app.include_router(app_cart.router, prefix="/api/v1", tags=["cart"])
app.include_router(app_settings.router, prefix="/api/v1", tags=["app-settings"])

# Routes Surprise du Jour
app.include_router(surprise_routes.router, prefix="/api/v1", tags=["surprise"])
admin_router.include_router(admin_surprise_routes.router)

# Include the routers in the main app
app.include_router(api_router)
app.include_router(admin_router)

# Serve uploaded files
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

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

@app.on_event("startup")
async def startup_scheduler():
    """Démarre le scheduler IA Marketing au démarrage de l'app"""
    from services.scheduler_service import start_scheduler
    try:
        start_scheduler()
        logger.info("✅ Scheduler IA Marketing démarré avec succès")
    except Exception as e:
        logger.error(f"❌ Erreur démarrage scheduler: {str(e)}")

@app.on_event("shutdown")
async def shutdown_services():
    """Arrête les services au shutdown"""
    from services.scheduler_service import stop_scheduler
    try:
        stop_scheduler()
        logger.info("🛑 Scheduler IA Marketing arrêté")
    except:
        pass
    close_db()

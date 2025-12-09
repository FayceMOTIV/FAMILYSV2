from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# ============================================
# ADMIN ROUTES (MongoDB) - ACTIVES
# ============================================
from routes.admin import auth as admin_auth
from routes.admin import ai_marketing as admin_ai_marketing
from routes.admin import reservations as admin_reservations
from routes.admin import refunds as admin_refunds

# ============================================
# FIREBASE ROUTES (nouvelles)
# ============================================
from routes.firebase import categories as fb_categories
from routes.firebase import products as fb_products
from routes.firebase import promotions as fb_promotions
from routes.firebase import settings as fb_settings
from routes.firebase import popups as fb_popups
from routes.firebase import customers as fb_customers
from routes.firebase import orders as fb_orders
from routes.firebase import upload as fb_upload
from routes.firebase import options as fb_options
from routes.firebase import choice_library as fb_choice_library
from routes.firebase import dashboard as fb_dashboard
from routes.firebase import notifications as fb_notifications
from routes.firebase import ai as fb_ai
from routes.firebase import fb_surprise
from routes.firebase import app_settings as fb_app_settings
from routes.firebase import ticket_z as fb_ticket_z
from routes.firebase import cart as fb_cart
from routes.firebase import stripe_payments as fb_stripe
from routes.firebase import auth as fb_auth
from routes.firebase import ai_marketing as fb_ai_marketing  # NOUVEAU !

# ============================================
# PUBLIC ROUTES
# ============================================
from routes import notifications as notifications_routes
from routes import restaurant as restaurant_routes
from routes import auth as auth_routes
from routes import surprise as surprise_routes

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from database import db, close_db

app = FastAPI(title="Family's API - Firebase", version="2.0.0")

api_router = APIRouter(prefix="/api")
admin_router = APIRouter(prefix="/api/v1/admin")
firebase_router = APIRouter(prefix="/api/v1/fb")

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    pass

@api_router.get("/")
async def root():
    return {"message": "Family's API v2 - Firebase"}

@api_router.get("/health")
async def health():
    return {"status": "ok", "database": "firebase"}

# ============================================
# FIREBASE ROUTES (/api/v1/fb/...)
# ============================================
firebase_router.include_router(fb_categories.router)
firebase_router.include_router(fb_products.router)
firebase_router.include_router(fb_promotions.router)
firebase_router.include_router(fb_settings.router)
firebase_router.include_router(fb_popups.router)
firebase_router.include_router(fb_customers.router)
firebase_router.include_router(fb_orders.router)
firebase_router.include_router(fb_upload.router)
firebase_router.include_router(fb_options.router)
firebase_router.include_router(fb_choice_library.router)
firebase_router.include_router(fb_dashboard.router)
firebase_router.include_router(fb_notifications.router)
firebase_router.include_router(fb_ai.router)
firebase_router.include_router(fb_surprise.router)
firebase_router.include_router(fb_app_settings.router)
firebase_router.include_router(fb_ticket_z.router)
firebase_router.include_router(fb_cart.router)
firebase_router.include_router(fb_auth.router)
firebase_router.include_router(fb_stripe.router)
firebase_router.include_router(fb_ai_marketing.router)  # NOUVEAU !

# ============================================
# ADMIN ROUTES (MongoDB)
# ============================================
admin_router.include_router(admin_auth.router)
admin_router.include_router(admin_ai_marketing.router)
admin_router.include_router(admin_reservations.router)
admin_router.include_router(admin_refunds.router)

# ============================================
# PUBLIC ROUTES
# ============================================
app.include_router(notifications_routes.router, prefix="/api/v1", tags=["notifications"])
app.include_router(restaurant_routes.router, prefix="/api/v1", tags=["restaurant"])
app.include_router(auth_routes.router, prefix="/api/v1", tags=["auth"])
app.include_router(surprise_routes.router, prefix="/api/v1", tags=["surprise"])

app.include_router(api_router)
app.include_router(admin_router)
app.include_router(firebase_router)

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

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_scheduler():
    # Scheduler IA Marketing
    try:
        from services.scheduler_service import start_scheduler
        start_scheduler()
        logger.info("✅ Scheduler IA Marketing démarré")
    except Exception as e:
        logger.warning(f"⚠️ Scheduler IA Marketing non disponible: {str(e)}")
    
    # Scheduler Notifications Programmées
    try:
        from scheduler import start_notification_scheduler
        start_notification_scheduler()
        logger.info("✅ Scheduler Notifications Programmées démarré")
    except Exception as e:
        logger.error(f"❌ Erreur scheduler Notifications: {str(e)}")

@app.on_event("shutdown")
async def shutdown_services():
    try:
        from services.scheduler_service import stop_scheduler
        stop_scheduler()
        logger.info("🛑 Scheduler IA Marketing arrêté")
    except:
        pass
    
    try:
        from scheduler import stop_notification_scheduler
        stop_notification_scheduler()
        logger.info("🛑 Scheduler Notifications arrêté")
    except:
        pass
    
    close_db()

"""
Routes publiques pour les informations du restaurant
"""
from fastapi import APIRouter, HTTPException
from models.settings import PublicRestaurantInfo
from database import db

router = APIRouter()

@router.get("/restaurant/info", response_model=PublicRestaurantInfo)
async def get_restaurant_info():
    """
    Récupérer les informations publiques du restaurant
    """
    try:
        # Récupérer les settings du restaurant
        settings = await db.settings.find_one(
            {"restaurant_id": "default"},
            {"_id": 0}
        )
        
        if not settings:
            raise HTTPException(
                status_code=404,
                detail="Informations du restaurant non trouvées"
            )
        
        # Retourner uniquement les infos publiques
        public_info = PublicRestaurantInfo(
            name=settings.get("name", ""),
            phone=settings.get("phone", ""),
            email=settings.get("email", ""),
            address=settings.get("address", ""),
            city=settings.get("city"),
            postal_code=settings.get("postal_code"),
            latitude=settings.get("latitude"),
            longitude=settings.get("longitude"),
            opening_hours=settings.get("opening_hours", {}),
            social_media=settings.get("social_media", {}),
            legal_entity_name=settings.get("legal_entity_name"),
            siret=settings.get("siret"),
            vat_number=settings.get("vat_number"),
            legal_form=settings.get("legal_form"),
            share_capital=settings.get("share_capital"),
            registration_city=settings.get("registration_city"),
            director_name=settings.get("director_name"),
            host_name=settings.get("host_name"),
            host_address=settings.get("host_address"),
            terms_url=settings.get("terms_url"),
            privacy_url=settings.get("privacy_url"),
            cgv_url=settings.get("cgv_url")
        )
        
        return public_info
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting restaurant info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

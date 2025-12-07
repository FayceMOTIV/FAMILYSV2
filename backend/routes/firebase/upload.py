"""
Routes Upload - Firebase Storage
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional
from datetime import datetime, timezone
import uuid

import sys
sys.path.append('/Users/faicalkriouar/Desktop/FAMILYS-CLEAN/backend')
from firebase_config import bucket

router = APIRouter(prefix="/upload", tags=["firebase-upload"])

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = "images"
):
    """Upload une image vers Firebase Storage"""
    try:
        if not allowed_file(file.filename):
            raise HTTPException(status_code=400, detail="Type de fichier non autorisé")
        
        # Générer un nom unique
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        blob_path = f"{folder}/{unique_name}"
        
        # Lire le contenu
        content = await file.read()
        
        # Upload vers Firebase Storage
        blob = bucket.blob(blob_path)
        blob.upload_from_string(content, content_type=file.content_type)
        
        # Rendre public
        blob.make_public()
        
        return {
            "success": True,
            "url": blob.public_url,
            "path": blob_path
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/product-image")
async def upload_product_image(file: UploadFile = File(...)):
    """Upload une image produit"""
    return await upload_image(file, folder="products")

@router.post("/category-image")
async def upload_category_image(file: UploadFile = File(...)):
    """Upload une image catégorie"""
    return await upload_image(file, folder="categories")

@router.post("/popup-image")
async def upload_popup_image(file: UploadFile = File(...)):
    """Upload une image popup"""
    return await upload_image(file, folder="popups")

@router.post("/branding")
async def upload_branding_image(
    file: UploadFile = File(...),
    type: str = "logo"  # logo, hero
):
    """Upload logo ou hero image"""
    return await upload_image(file, folder=f"branding/{type}")

@router.delete("")
async def delete_image(path: str):
    """Supprimer une image de Firebase Storage"""
    try:
        blob = bucket.blob(path)
        blob.delete()
        return {"success": True, "message": "Image supprimée"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

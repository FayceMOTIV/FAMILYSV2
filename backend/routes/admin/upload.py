from fastapi import APIRouter, File, UploadFile, HTTPException
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/upload", tags=["admin-upload"])

# Dossier pour stocker les images
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# URL publique pour accéder aux images
UPLOAD_URL_BASE = "/uploads"

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload une image et retourne l'URL."""
    
    # Vérifier le type de fichier
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image")
    
    # Générer un nom unique
    extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{extension}"
    filepath = UPLOAD_DIR / filename
    
    # Sauvegarder le fichier
    try:
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload: {str(e)}")
    
    # Retourner l'URL
    image_url = f"{UPLOAD_URL_BASE}/{filename}"
    
    return {
        "success": True,
        "url": image_url,
        "filename": filename
    }

@router.delete("/image/{filename}")
async def delete_image(filename: str):
    """Supprime une image uploadée."""
    filepath = UPLOAD_DIR / filename
    
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Image non trouvée")
    
    try:
        os.remove(filepath)
        return {"success": True, "message": "Image supprimée"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression: {str(e)}")

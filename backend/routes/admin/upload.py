from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid
import os

router = APIRouter(prefix="/upload", tags=["admin-upload"])

# Utiliser un chemin relatif au lieu d'absolu
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload une image et retourne l'URL"""
    try:
        # Vérifier le type de fichier
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Le fichier doit être une image")
        
        # Générer un nom unique
        ext = file.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = UPLOAD_DIR / filename
        
        # Sauvegarder le fichier
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Retourner l'URL relative
        return {
            "success": True,
            "url": f"/uploads/{filename}",
            "filename": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/image/{filename}")
async def delete_image(filename: str):
    """Supprime une image"""
    try:
        file_path = UPLOAD_DIR / filename
        if file_path.exists():
            file_path.unlink()
            return {"success": True, "message": "Image supprimée"}
        else:
            raise HTTPException(status_code=404, detail="Image non trouvée")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

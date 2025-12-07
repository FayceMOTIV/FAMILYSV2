"""
Configuration Firebase pour FAMILYS Backend
"""
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from pathlib import Path
import os

# Chemin vers la clé de service
SERVICE_ACCOUNT_PATH = Path(__file__).parent / "serviceAccountKey.json"

# Initialiser Firebase Admin SDK
if not firebase_admin._apps:
    cred = credentials.Certificate(str(SERVICE_ACCOUNT_PATH))
    firebase_admin.initialize_app(cred, {
        'storageBucket': 'family-2026.firebasestorage.app'
    })

# Clients Firebase
db = firestore.client()
bucket = storage.bucket()

# ============================================
# FONCTIONS UTILITAIRES FIRESTORE
# ============================================

def get_collection(name: str):
    """Récupère une référence de collection"""
    return db.collection(name)

def get_document(collection: str, doc_id: str):
    """Récupère un document par ID"""
    doc = db.collection(collection).document(doc_id).get()
    if doc.exists:
        return {"id": doc.id, **doc.to_dict()}
    return None

def get_all_documents(collection: str, limit: int = 1000):
    """Récupère tous les documents d'une collection"""
    docs = db.collection(collection).limit(limit).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

def create_document(collection: str, data: dict, doc_id: str = None):
    """Crée un document (avec ou sans ID spécifique)"""
    if doc_id:
        db.collection(collection).document(doc_id).set(data)
        return doc_id
    else:
        doc_ref = db.collection(collection).add(data)
        return doc_ref[1].id

def update_document(collection: str, doc_id: str, data: dict):
    """Met à jour un document"""
    db.collection(collection).document(doc_id).update(data)

def delete_document(collection: str, doc_id: str):
    """Supprime un document"""
    db.collection(collection).document(doc_id).delete()

# ============================================
# FONCTIONS UTILITAIRES AUTH
# ============================================

def verify_token(id_token: str):
    """Vérifie un token Firebase Auth et retourne les infos utilisateur"""
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        print(f"Erreur vérification token: {e}")
        return None

def get_user_by_email(email: str):
    """Récupère un utilisateur Firebase Auth par email"""
    try:
        return auth.get_user_by_email(email)
    except:
        return None

def get_user_by_uid(uid: str):
    """Récupère un utilisateur Firebase Auth par UID"""
    try:
        return auth.get_user(uid)
    except:
        return None

# ============================================
# FONCTIONS UTILITAIRES STORAGE
# ============================================

def upload_file(file_data: bytes, destination_path: str, content_type: str = "image/jpeg"):
    """Upload un fichier vers Firebase Storage"""
    blob = bucket.blob(destination_path)
    blob.upload_from_string(file_data, content_type=content_type)
    blob.make_public()
    return blob.public_url

def delete_file(file_path: str):
    """Supprime un fichier de Firebase Storage"""
    blob = bucket.blob(file_path)
    blob.delete()

def get_public_url(file_path: str):
    """Obtient l'URL publique d'un fichier"""
    blob = bucket.blob(file_path)
    blob.make_public()
    return blob.public_url

# ============================================
# TEST DE CONNEXION
# ============================================

def test_connection():
    """Teste la connexion à Firebase"""
    try:
        # Test Firestore
        test_ref = db.collection('_test').document('connection')
        test_ref.set({'test': True, 'timestamp': firestore.SERVER_TIMESTAMP})
        test_ref.delete()
        print("✅ Firestore: Connexion OK")
        
        # Test Storage
        print(f"✅ Storage: Bucket = {bucket.name}")
        
        return True
    except Exception as e:
        print(f"❌ Erreur connexion Firebase: {e}")
        return False

if __name__ == "__main__":
    print("🔥 Test connexion Firebase...")
    test_connection()

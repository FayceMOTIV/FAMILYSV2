"""
Scheduler pour les notifications programmées
Vérifie toutes les minutes les notifications à envoyer
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timezone
import logging
import firebase_admin
from firebase_admin import firestore, messaging

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instance du scheduler
notification_scheduler = BackgroundScheduler()

def get_firestore_db():
    """Récupère l'instance Firestore"""
    try:
        from config.firebase_config import db
        return db
    except:
        # Fallback si import différent
        return firestore.client()

def send_fcm_notification(token: str, title: str, body: str, data: dict = None):
    """Envoie une notification FCM à un device"""
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=token,
        )
        response = messaging.send(message)
        return True, response
    except Exception as e:
        logger.error(f"Erreur envoi FCM: {str(e)}")
        return False, str(e)

def send_fcm_topic(topic: str, title: str, body: str, data: dict = None):
    """Envoie une notification FCM à un topic (all, promo, etc.)"""
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            topic=topic,
        )
        response = messaging.send(message)
        return True, response
    except Exception as e:
        logger.error(f"Erreur envoi FCM topic: {str(e)}")
        return False, str(e)

def check_scheduled_notifications():
    """
    Vérifie et envoie les notifications programmées dont l'heure est passée.
    Appelé toutes les minutes par le scheduler.
    """
    try:
        db = get_firestore_db()
        now = datetime.now(timezone.utc)
        
        logger.info(f"🔍 Vérification notifications programmées - {now.isoformat()}")
        
        # Chercher les notifications programmées dont l'heure est passée
        notifications_ref = db.collection('admin_notifications')
        
        # Query: status = "scheduled" ET scheduled_at <= maintenant
        query = notifications_ref.where('status', '==', 'scheduled')
        scheduled_notifs = query.stream()
        
        sent_count = 0
        
        for doc in scheduled_notifs:
            notif = doc.to_dict()
            notif_id = doc.id
            
            # Vérifier si l'heure programmée est passée
            scheduled_at = notif.get('scheduled_at')
            
            if scheduled_at:
                # Convertir en datetime si nécessaire
                if isinstance(scheduled_at, str):
                    scheduled_at = datetime.fromisoformat(scheduled_at.replace('Z', '+00:00'))
                elif hasattr(scheduled_at, 'timestamp'):
                    # Firestore Timestamp
                    scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)
                
                # Si l'heure est passée, envoyer la notification
                if scheduled_at <= now:
                    logger.info(f"📤 Envoi notification programmée: {notif.get('title', 'Sans titre')}")
                    
                    title = notif.get('title', '')
                    message = notif.get('message', '')
                    target = notif.get('target', 'all')
                    notif_type = notif.get('type', 'marketing')
                    
                    # Données additionnelles pour l'app
                    data = {
                        'type': notif_type,
                        'notification_id': notif_id,
                        'click_action': 'FLUTTER_NOTIFICATION_CLICK'
                    }
                    
                    # Envoyer selon le target
                    success = False
                    if target == 'all':
                        success, response = send_fcm_topic('all', title, message, data)
                    elif target == 'promo':
                        success, response = send_fcm_topic('promotions', title, message, data)
                    elif target == 'loyalty':
                        success, response = send_fcm_topic('loyalty', title, message, data)
                    else:
                        # Target spécifique (customer_id) - récupérer le token
                        customer_ref = db.collection('customers').document(target)
                        customer_doc = customer_ref.get()
                        if customer_doc.exists:
                            customer = customer_doc.to_dict()
                            fcm_token = customer.get('fcm_token')
                            if fcm_token:
                                success, response = send_fcm_notification(fcm_token, title, message, data)
                    
                    # Mettre à jour le status
                    new_status = 'sent' if success else 'failed'
                    doc.reference.update({
                        'status': new_status,
                        'sent_at': datetime.now(timezone.utc),
                        'sent_count': firestore.Increment(1) if success else 0
                    })
                    
                    if success:
                        sent_count += 1
                        logger.info(f"✅ Notification envoyée: {title}")
                    else:
                        logger.error(f"❌ Échec envoi: {title}")
        
        if sent_count > 0:
            logger.info(f"📊 {sent_count} notification(s) programmée(s) envoyée(s)")
            
    except Exception as e:
        logger.error(f"❌ Erreur check_scheduled_notifications: {str(e)}")

def start_notification_scheduler():
    """Démarre le scheduler des notifications"""
    try:
        # Ajouter le job qui vérifie toutes les minutes
        notification_scheduler.add_job(
            check_scheduled_notifications,
            trigger=IntervalTrigger(minutes=1),
            id='check_scheduled_notifications',
            name='Vérification notifications programmées',
            replace_existing=True
        )
        
        # Démarrer le scheduler
        if not notification_scheduler.running:
            notification_scheduler.start()
            logger.info("✅ Scheduler notifications programmées démarré (vérifie chaque minute)")
        
        return True
    except Exception as e:
        logger.error(f"❌ Erreur démarrage scheduler notifications: {str(e)}")
        return False

def stop_notification_scheduler():
    """Arrête le scheduler des notifications"""
    try:
        if notification_scheduler.running:
            notification_scheduler.shutdown(wait=False)
            logger.info("🛑 Scheduler notifications arrêté")
        return True
    except Exception as e:
        logger.error(f"❌ Erreur arrêt scheduler: {str(e)}")
        return False

# Pour test manuel
if __name__ == "__main__":
    print("🧪 Test du scheduler notifications...")
    start_notification_scheduler()
    
    # Garder le script actif pour test
    import time
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        stop_notification_scheduler()
        print("Arrêté.")

# FAMILYS-CLEAN - Contexte Complet pour Claude

## 📱 PRÉSENTATION DU PROJET

**FAMILYS-CLEAN** est une application de commande mobile complète pour le restaurant "Le Family's" à Bourg-en-Bresse, France.

### Stack Technique
- **App Mobile** : React Native / Expo (bundle: `com.fayce.familysnew`)
- **Backend** : FastAPI Python (port 8000)
- **Backoffice Admin** : React (port 3001 ou 3002)
- **Base de données** : Firebase Firestore (migration depuis MongoDB complétée)
- **Auth** : Firebase Authentication
- **Notifications** : Firebase Cloud Messaging (FCM)
- **Paiements** : Stripe (à configurer)

### Chemins sur le Mac
```
~/Desktop/FAMILYS-CLEAN/
├── app/                    # App React Native Expo
├── backend/                # FastAPI Python
│   ├── server.py           # Point d'entrée
│   ├── routes/firebase/    # Routes API Firebase
│   └── config/             # Config Firebase
├── admin/                  # Backoffice React
│   ├── src/pages/          # Pages admin
│   └── src/components/     # Composants modaux
└── constants/              # Config partagée
```

---

## 🔥 MIGRATION FIREBASE - COMPLÉTÉE

### Routes API
- **Base URL** : `/api/v1/fb/` (toutes les routes admin migrées)
- **Anciennes routes MongoDB** : `/api/v1/admin/` → NE PLUS UTILISER

### Collections Firestore
```
products, categories, options, choice_library, promotions, 
orders, customers, loyalty_transactions, popups, settings, 
admin_notifications, customer_notifications, 
surprise_configs, surprise_rewards, surprise_plays
```

### URL Backend
- **Local** : `http://localhost:8000`
- **Ngrok (TestFlight)** : `https://teresita-unspreading-camelia.ngrok-free.dev`

⚠️ **Important** : L'URL ngrok change à chaque redémarrage. Pour tests TestFlight, garder ouvert :
1. Terminal 1 : `ngrok http 8000`
2. Terminal 2 : `uvicorn server:app --host 0.0.0.0 --port 8000`

---

## 🔐 AUTHENTIFICATION

### App Mobile (authStore.js)
Firebase Auth intégré avec :
- `register()` : Crée user Firebase Auth + document `customers`
- `login()` : Authentifie + récupère données Firestore
- `logout()` : signOut Firebase

### Backoffice (PIN)
- **BackOffice** : 1234
- **Commandes** : 1111
- **Livraison** : 2222

---

## 🎁 SYSTÈME PROMOTIONNEL

### 14 Types de Promotions
```
percentage, fixed_amount, free_item, bogo, bundle, 
happy_hour, first_order, minimum_purchase, category_discount,
loyalty_multiplier, conditional, combo_upgrade, 
free_delivery, flash_sale
```

### BOGO (Buy One Get One)
- Champs : `bogo_buy_quantity`, `bogo_get_quantity`
- Respecte `limit_per_customer`

### Fichiers Clés
- `cart.jsx` : Application automatique des promos
- `product/[id].tsx` : Badge + prix promo affiché
- `PromotionWizard.js` : Création/édition dans backoffice

---

## 📦 OPTIONS DYNAMIQUES

### Système
- Options chargées en temps réel depuis Firebase
- Bibliothèque de choix (`choice_library`)
- Sous-options récursives supportées

### Composants
- `OptionModal.jsx` (app) : Affichage pour clients
- `OptionModal.js` (admin) : CRUD options
- `NestedSubOptionsEditor.js` : Gestion sous-options

---

## 🔔 NOTIFICATIONS

### Backend Routes
- `GET /api/v1/fb/notifications` : Liste admin
- `POST /api/v1/fb/notifications` : Créer (status: draft)
- `POST /api/v1/fb/notifications/{id}/send` : Envoyer maintenant
- `GET /api/v1/fb/notifications/client` : Pour l'app

### Frontend (NotificationModal.js)
- API_URL hardcodé : `http://localhost:8000`
- Envoi automatique si pas de date programmée
- IA amélioration avec OpenAI (nécessite clé sk-...)

### Notifications Programmées
**Fichier créé** : `backend/scheduler.py` avec APScheduler
- Vérifie toutes les minutes les notifications à envoyer
- **À intégrer** dans `server.py` au démarrage

---

## 🤖 ASSISTANT IA

### Configuration
- Clé OpenAI stockée dans `settings.openai_api_key`
- Doit commencer par `sk-` pour être valide
- Configurable dans Backoffice → Paramètres → Assistant IA

### Route
`POST /api/v1/fb/ai/chat` - Requiert clé valide

---

## 📋 PAGES APP MOBILE

### Pages Principales
- `/` : Menu principal avec catégories
- `/product/[id]` : Détail produit avec options et promos
- `/cart` : Panier avec promos auto-appliquées
- `/order-confirmation` : Confirmation après commande
- `/profile` : Profil (redirige vers auth si non connecté)

### Fonctionnalités
- **Surprise du Jour** : Roue chance avec récompenses
- **Favoris** : Navigation vers `/product/{id}`
- **Popups** : Système de modales marketing

---

## ⚙️ BACKOFFICE

### Pages Principales
```
/dashboard, /orders, /menu, /categories, /promos,
/customers, /loyalty, /notifications, /settings,
/reservations, /stock, /stats, /ticket-z
```

### Fichiers Corrigés Récemment
- `Settings.js` : Mapping `response.data.settings`
- `NotificationModal.js` : Routes Firebase + isEditMode fix
- `Notifications.js` : Reset editingNotification
- `api.js` : adminApi vers `/api/v1/fb`
- 15+ fichiers : Migration `/api/v1/admin` → `/api/v1/fb`

### Variables d'Environnement (admin/.env)
```
REACT_APP_BACKEND_URL=http://localhost:8000
FAST_REFRESH=false
```

---

## 🚀 BUILD & DÉPLOIEMENT

### EAS Build iOS
```bash
cd ~/Desktop/FAMILYS-CLEAN
eas build --platform ios --profile production --auto-submit
```

### Incrémenter Build Number
```bash
sed -i '' 's/"buildNumber": "80"/"buildNumber": "81"/g' app.json
```

### TestFlight
- Bundle : `com.fayce.familysnew`
- Builds récents : 78, 79, 80

---

## 🐛 PROBLÈMES CONNUS & SOLUTIONS

### URL API Vide dans Composants
**Problème** : `process.env.REACT_APP_BACKEND_URL` vide
**Solution** : Hardcoder `const API_URL = 'http://localhost:8000';`
**Fichiers à vérifier** : NotificationModal.js, PaymentModal.js, PromoModal.js, Promos.js

### Syntaxe axios.post
**Problème** : `axios.post\`` au lieu de `axios.post(\``
**Solution** : Corriger avec Python (sed problématique avec backticks)

### Clé OpenAI
**Problème** : Clé invalide stockée
**Solution** : Entrer vraie clé commençant par `sk-` dans Paramètres

---

## 📝 TODO PRIORITAIRE

### Immédiat
- [ ] Intégrer scheduler.py dans server.py pour notifs programmées
- [ ] Tester build 80 sur TestFlight
- [ ] Configurer Stripe (CB + Apple Pay)
- [ ] Entrer clé OpenAI valide

### Court Terme
- [ ] Déployer backend sur serveur (Railway/Render/VPS)
- [ ] Recréer options perdues lors migration MongoDB
- [ ] Tests complets promotions dans app

### Production
- [ ] Migration soldes fidélité (dev externe)
- [ ] Certificats push production
- [ ] Domain personnalisé API

---

## 🔧 COMMANDES UTILES

### Démarrer l'environnement complet
```bash
# Terminal 1 - Backend
cd ~/Desktop/FAMILYS-CLEAN/backend
uvicorn server:app --host 0.0.0.0 --port 8000

# Terminal 2 - Ngrok (pour TestFlight)
ngrok http 8000

# Terminal 3 - Backoffice
cd ~/Desktop/FAMILYS-CLEAN/admin
npm run dev

# Terminal 4 - App Expo
cd ~/Desktop/FAMILYS-CLEAN
npx expo start
```

### Tests API
```bash
# Settings
curl http://localhost:8000/api/v1/fb/settings

# Créer notification
curl -X POST http://localhost:8000/api/v1/fb/notifications \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","message":"Message test","type":"marketing","target":"all"}'

# Envoyer notification
curl -X POST http://localhost:8000/api/v1/fb/notifications/{ID}/send

# Test IA
curl -X POST http://localhost:8000/api/v1/fb/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Bonjour"}'
```

### Git
```bash
git add .
git commit -m "description"
git push origin main
```

---

## 📞 CONTACTS & INFOS

- **Restaurant** : Le Family's, Bourg-en-Bresse
- **Propriétaire** : Faiçal
- **Autres projets** : AppySolution.fr, Zwin (annuaire halal)

---

*Dernière mise à jour : 8 décembre 2025*

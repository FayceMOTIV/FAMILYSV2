# FAMILYS-CLEAN - Contexte Claude

## Projet
- **App**: React Native/Expo (app mobile restaurant)
- **Backend**: FastAPI (Python) - **100% Firebase**
- **Backoffice**: React (admin panel)
- **Firebase Project**: family-2026 (eur3)
- **Bundle ID**: com.fayce.familysnew
- **GitHub**: https://github.com/FayceMOTIV/FAMILYSV2

## Serveurs
- Backend: `http://localhost:8000` (uvicorn server:app --host 0.0.0.0 --port 8000 --reload)
- Backoffice: `http://localhost:3002` (npm run dev)
- IP locale: 192.168.1.185

## Authentification Backoffice (PIN)
| Mode | PIN par défaut | URL |
|------|----------------|-----|
| Back Office | 1234 | /login |
| Mode Commandes | 1111 | /orders-mode-login |
| Mode Livraison | 2222 | /delivery-mode-login |

- Page sélection: `/select-mode`
- PIN configurables dans Paramètres > Codes PIN
- Session 24h (admin), 8h (modes)

## Routes Firebase (/api/v1/fb/)
- `/categories` - CRUD + reorder + sync produits
- `/products` - CRUD + toggleStock + out_of_stock_until
- `/options` - CRUD + reorder (récursif)
- `/choice-library` - Bibliothèque d'options
- `/promotions` - 14 types de promos
- `/orders` - CRUD + updateStatus + notifications auto
- `/customers` - CRUD + loyalty + export
- `/settings` - Config restaurant + PIN
- `/popups` - Gestion popups
- `/upload` - Images Firebase Storage
- `/surprise` - Jeu Surprise du Jour
- `/dashboard` - Stats + top produits
- `/notifications` - Push notifications
- `/ai` - Marketing IA (OpenAI)
- `/app-settings` - Config app mobile (is_paused, time-slots)

## Fonctionnalités Mode Commandes
- Liste commandes actives (refresh 10s)
- Changement statut → notification auto client
- Gestion ruptures:
  - Rupture 24H (reset à minuit)
  - Rupture indéfinie
- Pause commandes (bloque app mobile)
- Recherche produits

## Fonctionnalités Mode Livraison
- Commandes type "delivery" uniquement
- Statuts: ready → delivering → delivered
- Infos client: nom, téléphone (clic pour appeler)
- Adresse avec lien Google Maps
- Gestion paiement (espèces/CB)
- Interface responsive (mobile-first)

## Notifications Automatiques (FCM)
Déclenchées au changement de statut:
- `new`: "Merci ! 🙏"
- `in_preparation`: "C'est parti ! 👨‍🍳"
- `ready`: "C'est prêt ! 🎉"
- `delivering`: "En route ! 🛵" (si livraison activée)
- `delivered`: "Bon appétit ! 😋" (si livraison activée)
- `completed`: "À très vite ! 💚"
- `cancelled`: "Commande annulée 😔"

## Pause Commandes
- Activable dans Mode Commandes ou Paramètres
- `is_paused: true` → App mobile affiche banner
- `no_more_orders_today: true` → "Plus de commandes aujourd'hui"
- Route: GET /api/v1/fb/app-settings/app-config

## Structure Fichiers Clés
```
backend/
  server.py                 # Point d'entrée FastAPI
  firebase_config.py        # Config Firebase Admin SDK
  routes/firebase/          # Toutes les routes Firebase
    orders.py              # + notifications auto
    products.py            # + out_of_stock_until
    settings.py            # + admin_pin, pin_orders_mode, pin_delivery_mode
    app_settings.py        # Config app mobile

admin/
  src/
    pages/
      ModeSelector.js      # Sélection des modes
      Login.js             # PIN admin
      ModeLogin.js         # PIN modes
      OrdersMode.js        # Gestion commandes + ruptures
      DeliveryMode.js      # Gestion livraisons
      Settings.js          # Config + PIN
    contexts/
      AuthContext.js       # Gestion session PIN
    services/
      api.js               # Toutes les API Firebase

app/
  (tabs)/
    cart.jsx               # Panier + gestion pause
```

## Collections Firebase
- `categories` - Catégories menu
- `products` - Produits (avec is_out_of_stock, out_of_stock_until)
- `options` - Options produits
- `choice_library` - Bibliothèque choix
- `promotions` - Promotions
- `orders` - Commandes
- `customers` - Clients
- `settings/restaurant` - Config globale
- `popups` - Popups marketing
- `admin_notifications` - Notifs marketing
- `customer_notifications` - Notifs clients
- `surprise_config` - Config jeu
- `surprise_rewards` - Récompenses jeu

## Variables Importantes
- `API_BASE_URL` (app): depuis constants/config.js
- `API_URL` (admin): process.env.REACT_APP_BACKEND_URL
- Firebase Storage: gs://family-2026.firebasestorage.app

## Commandes Utiles
```bash
# Backend
cd ~/Desktop/FAMILYS-CLEAN/backend
python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Backoffice
cd ~/Desktop/FAMILYS-CLEAN/admin
npm run dev

# Tester routes
curl http://localhost:8000/api/v1/fb/settings
curl http://localhost:8000/api/v1/fb/app-settings/app-config

# Set PIN
curl -X PUT http://localhost:8000/api/v1/fb/settings \
  -H "Content-Type: application/json" \
  -d '{"admin_pin": "1234", "pin_orders_mode": "1111", "pin_delivery_mode": "2222"}'
```

## TODO
- [ ] Configurer Stripe (CB + Apple Pay)
- [ ] TestFlight deployment
- [ ] Tests complets promotions

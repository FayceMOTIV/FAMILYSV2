# FAMILYS-CLEAN - Contexte Claude

## 🎯 Projet
Application mobile restaurant "Le Family's" (Bourg-en-Bresse) avec backoffice admin.

## 🏗️ Architecture

### Stack Technique
- **App Mobile**: React Native / Expo (TypeScript)
- **Backend**: FastAPI (Python) avec Firebase
- **Backoffice**: React.js
- **Base de données**: Firebase Firestore (migré depuis MongoDB)
- **Storage**: Firebase Storage pour images
- **Bundle ID**: `com.fayce.familysnew`

### Structure des dossiers
```
FAMILYS-CLEAN/
├── app/                    # App mobile Expo
│   ├── (tabs)/            # Pages principales (index.tsx, menu.jsx, cart.jsx, etc.)
│   ├── product/[id].tsx   # Page détail produit
│   └── surprise-du-jour/  # Module jeu
├── admin/                  # Backoffice React
│   ├── src/pages/         # Pages admin
│   └── src/services/      # Services API
├── backend/               # API FastAPI
│   ├── routes/firebase/   # Routes Firebase (fb_*)
│   ├── routes/admin/      # Routes admin
│   └── firebase_config.py # Config Firebase
└── stores/                # Zustand stores
```

## 🔥 Firebase - Routes API

### Préfixe: `/api/v1/fb/`

| Route | Description |
|-------|-------------|
| `/fb/products` | Produits (CRUD) |
| `/fb/categories` | Catégories |
| `/fb/settings` | Paramètres restaurant |
| `/fb/orders` | Commandes |
| `/fb/customers` | Clients |
| `/fb/promotions` | Promotions |
| `/fb/popups` | Popups marketing |
| `/fb/upload/branding` | Upload images |
| `/fb/surprise/*` | Module Surprise du Jour |

## 🎰 Module Surprise du Jour (Simplifié)

### 3 onglets seulement:
1. **Dashboard** - Stats + Coût mensuel
2. **Configuration** - Probabilités + Paramètres (fusionnés)
3. **Récompenses** - Liste des gains clients

### Types de récompenses:
- `discount_percent` - Réduction % sur panier
- `discount_amount` - Réduction € fixe
- `cashback` - Crédit fidélité
- `product` - Produit offert (lié au menu)
- `menu` - Menu offert (lié au menu)

### Routes backend:
- `GET /api/v1/fb/surprise/stats` - Statistiques
- `GET/POST/PUT/DELETE /api/v1/fb/surprise/config` - Configuration récompenses
- `GET/PUT /api/v1/fb/surprise/settings` - Paramètres module
- `GET /api/v1/fb/surprise/rewards` - Liste récompenses
- `POST /api/v1/fb/surprise/play` - Jouer (app mobile)
- `GET /api/v1/fb/surprise/status` - Statut joueur

## 🛒 Système de Promotions

### 14 types supportés:
- BOGO (Buy One Get One)
- Réductions pourcentage/montant
- Happy Hour
- Offres conditionnelles
- Threshold discounts
- etc.

### Fichiers clés:
- `admin/src/components/PromotionWizard.js`
- `app/(tabs)/cart.jsx` - Application des promos
- `backend/routes/firebase/promotions.py`

## 📱 App Mobile - Pages principales

| Fichier | Description |
|---------|-------------|
| `(tabs)/index.tsx` | Accueil avec image hero Firebase |
| `(tabs)/menu.jsx` | Menu avec catégories |
| `(tabs)/cart.jsx` | Panier avec promos |
| `product/[id].tsx` | Détail produit + options |
| `surprise-du-jour/` | Jeu roue |

## ⚙️ Commandes de démarrage
```bash
# Backend
cd ~/Desktop/FAMILYS-CLEAN/backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Backoffice
cd ~/Desktop/FAMILYS-CLEAN/admin
npm start  # Port 3003

# App Mobile (dev)
cd ~/Desktop/FAMILYS-CLEAN
npx expo start
```

## 📋 TODO Restants

1. [ ] Créer le menu complet (catégories + produits)
2. [ ] Configurer les récompenses Surprise du Jour
3. [ ] Tester le jeu sur l'app mobile
4. [ ] Configurer Stripe (paiement CB + Apple Pay)
5. [ ] Build EAS pour TestFlight
6. [ ] Tester cycle complet commande

## 🔧 Notes techniques

- **Settings Firebase**: Collection `settings`, document `restaurant`
- **Image hero**: Champ `hero_image_url` dans settings
- **Produits**: Supportent options dynamiques avec sous-options
- **Panier**: Applique automatiquement les promos actives

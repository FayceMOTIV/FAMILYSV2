# 🍔 FAMILYS-CLEAN

Application mobile de commande pour **Le Family's** - Restaurant à Bourg-en-Bresse.

## 📍 Infos Restaurant

| Info | Valeur |
|------|--------|
| Nom | Le Family's |
| Adresse | 59 rue du 14 Juillet 1789, 01000 Bourg-en-Bresse |
| Téléphone | 04 74 52 60 82 |

---

## 🏗️ Architecture du Projet

```
FAMILYS-CLEAN/
├── app/                          # 📱 App Mobile (Expo Router V3)
│   ├── (tabs)/                   # Navigation principale
│   │   ├── index.tsx             # Home (hero image + catégories)
│   │   ├── cart.jsx              # Panier + checkout
│   │   ├── orders.jsx            # Historique commandes (polling 30s)
│   │   └── account.jsx           # Compte client
│   ├── surprise-du-jour/         # 🎰 Jeu fidélité quotidien
│   │   ├── index.tsx             # Page du jeu
│   │   └── result.tsx            # Résultat (gain/perdu)
│   ├── order/                    # Commander
│   ├── product/[id].tsx          # Fiche produit dynamique
│   └── order-confirmation.jsx    # Confirmation commande
│
├── backend/                      # ⚙️ API FastAPI
│   ├── server.py                 # Point d'entrée uvicorn
│   ├── database.py               # Connexion MongoDB
│   ├── models/                   # Modèles Pydantic
│   │   ├── order.py
│   │   ├── product.py
│   │   ├── promotion.py
│   │   ├── customer.py
│   │   ├── surprise.py
│   │   └── settings.py
│   ├── routes/
│   │   ├── app/                  # Routes app mobile
│   │   │   ├── products.py
│   │   │   ├── categories.py
│   │   │   ├── cart.py
│   │   │   ├── promotions.py
│   │   │   └── app_settings.py
│   │   ├── admin/                # Routes backoffice
│   │   │   ├── orders.py
│   │   │   ├── products.py
│   │   │   ├── promotions.py
│   │   │   ├── customers.py
│   │   │   ├── ai.py
│   │   │   └── notifications.py
│   │   ├── orders.py
│   │   ├── customers.py
│   │   ├── cashback.py
│   │   ├── surprise.py
│   │   └── notifications.py
│   └── services/                 # Services métier
│       ├── notification_service.py
│       ├── cashback_service.py
│       ├── promotion_engine.py
│       └── ai_service.py
│
├── admin/                        # 🖥️ Backoffice React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── OrdersManagement.js
│   │   │   ├── ProductsManagement.js
│   │   │   ├── PromotionsManagement.js
│   │   │   ├── CustomersManagement.js
│   │   │   ├── Settings.js
│   │   │   └── AIMarketing.js
│   │   └── components/
│   └── package.json
│
└── assets/                       # Images, fonts
```

---

## 🛠️ Stack Technique

### App Mobile
| Techno | Version |
|--------|---------|
| Expo SDK | ~52 |
| Expo Router | ~4 |
| React Native | 0.76+ |
| NativeWind | 4.x |
| Axios | latest |
| Expo Notifications | latest |

### Backend
| Techno | Version |
|--------|---------|
| Python | 3.11+ |
| FastAPI | latest |
| Uvicorn | latest |
| Motor | latest |
| MongoDB | 6.x |
| Pydantic | 2.x |

### Backoffice
| Techno | Version |
|--------|---------|
| React | 18.x |
| Tailwind CSS | 3.x |
| Craco | latest |

---

## 🚀 Démarrage Rapide

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Backoffice
```bash
cd admin
npm install
npm run dev
# → http://localhost:3001
```

### 3. App Mobile
```bash
npm install
npx expo start
```

---

## 📱 Fonctionnalités Implémentées

### ✅ Commande
- [x] Catégories de produits
- [x] Produits avec options dynamiques (récursives)
- [x] Panier avec calcul temps réel
- [x] Modes : À emporter / Sur place / Livraison
- [x] Créneaux horaires dynamiques
- [x] Confirmation de commande

### ✅ Promotions (14 types)
- [x] Pourcentage (-10%, -20%, etc.)
- [x] Montant fixe (-5€)
- [x] BOGO (1 acheté = 1 offert)
- [x] Produit gratuit
- [x] Livraison gratuite
- [x] Happy Hour
- [x] Menu du jour
- [x] Code promo
- [x] Et plus...

### ✅ Fidélité
- [x] Cashback automatique (X% configurable)
- [x] Utilisation du solde au checkout
- [x] Historique des transactions

### ✅ Surprise du Jour
- [x] Jeu quotidien (1 tentative/jour)
- [x] 25% chance de "pas de chance"
- [x] Récompenses : produit gratuit, réduction, cashback
- [x] Expiration 3 jours
- [x] Coût estimé : 400-600€/mois

### ✅ Notifications
- [x] Push notifications (Expo)
- [x] Changement de statut commande
- [x] Fidélité créditée

### ✅ Backoffice
- [x] Gestion commandes + impression ticket 80mm
- [x] Gestion produits/catégories/options
- [x] Gestion promotions
- [x] Gestion clients
- [x] Paramètres restaurant
- [x] IA Marketing (assistant + génération)

### 🔜 À faire
- [ ] Paiement Stripe (CB + Apple Pay)
- [ ] Livraison avec suivi GPS
- [ ] Programme parrainage

---

## 🍎 Apple / Expo

| Info | Valeur |
|------|--------|
| Bundle ID | `com.fayce.familysnew` |
| Team ID | `5ZR87TPM89` |
| Provider | 2k (ARA) |
| Apple ID | lefamilys01@gmail.com |
| Compte Expo | @fayce |

### Build & Deploy
```bash
# Build preview (Ad Hoc)
eas build --platform ios --profile preview

# Build production
eas build --platform ios --profile production

# Soumettre à TestFlight
eas submit --platform ios
```

---

## 🔗 URLs

| Environnement | URL |
|---------------|-----|
| Backend local | http://192.168.10.102:8000 |
| Backoffice local | http://localhost:3001 |
| API Docs | http://localhost:8000/docs |

---

## 📁 GitHub

**Repository** : https://github.com/FayceMOTIV/FAMILYSV2

---

## 👤 Auteur

**Faiçal** - Entrepreneur, propriétaire du Family's et développeur de l'app.

Autres projets :
- AppySolution.fr (apps white-label pour restaurants)
- Zwin (plateforme halal)

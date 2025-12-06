# 🤖 CLAUDE CONTEXT - FAMILYS-CLEAN

> **Ce fichier est destiné à Claude AI pour recharger le contexte du projet en 1 lecture.**

---

## 🎯 RÉSUMÉ PROJET

**FAMILYS-CLEAN** est l'application mobile de commande du restaurant **Le Family's** à Bourg-en-Bresse (01000), développée par **Faiçal**.

| Info | Valeur |
|------|--------|
| Type | App de commande restaurant |
| Stack | Expo Router V3 + FastAPI + MongoDB |
| État | En développement actif, TestFlight en cours |
| GitHub | https://github.com/FayceMOTIV/FAMILYSV2 |

---

## 🏢 INFOS RESTAURANT

```
Nom      : Le Family's
Adresse  : 59 rue du 14 Juillet 1789, 01000 Bourg-en-Bresse
Téléphone: 04 74 52 60 82
```

---

## 🔑 IDENTIFIANTS APPLE/EXPO

```
Bundle ID    : com.fayce.familysnew
Team ID      : 5ZR87TPM89
Provider     : 2k (ARA) (126758747)
Apple ID     : lefamilys01@gmail.com
Compte Expo  : @fayce
Projet Expo  : familys-new
```

---

## 📁 STRUCTURE FICHIERS CLÉS

### App Mobile (Expo Router V3)
```
app/(tabs)/index.tsx      → Home (hero image + catégories)
app/(tabs)/cart.jsx       → Panier (promos, cashback, checkout)
app/(tabs)/orders.jsx     → Historique (polling 30s, statut temps réel)
app/(tabs)/account.jsx    → Compte client
app/surprise-du-jour/     → Jeu fidélité quotidien
app/product/[id].tsx      → Fiche produit avec options dynamiques
app/order-confirmation.jsx→ Confirmation commande
```

### Backend (FastAPI)
```
backend/server.py                    → Point d'entrée (uvicorn server:app)
backend/database.py                  → MongoDB connection
backend/models/                      → Pydantic V2 models
backend/routes/app/                  → API pour l'app mobile
backend/routes/admin/                → API pour le backoffice
backend/services/notification_service.py → Push notifications Expo
backend/services/cashback_service.py     → Gestion fidélité
backend/services/promotion_engine.py     → Calcul des promos
```

### Backoffice (React)
```
admin/src/pages/OrdersManagement.js  → Gestion commandes + impression ticket
admin/src/pages/ProductsManagement.js→ Produits/catégories
admin/src/pages/Settings.js          → Paramètres restaurant
```

---

## 🌐 URLS & PORTS

| Service | URL Local |
|---------|-----------|
| Backend | http://192.168.10.102:8000 |
| Backend (localhost) | http://localhost:8000 |
| Backoffice | http://localhost:3001 |
| API Docs | http://localhost:8000/docs |

**⚠️ IMPORTANT** : L'app mobile utilise `192.168.10.102:8000`, le backoffice utilise `localhost:8000`.

---

## ✅ FONCTIONNALITÉS IMPLÉMENTÉES

### Système de Commande
- Catégories → Produits → Options (récursives, dynamiques)
- Panier avec calcul temps réel
- Modes : À emporter / Sur place / Livraison
- Créneaux horaires configurables
- Confirmation avec numéro de commande

### Système de Promotions (14 types)
- `percentage` : Réduction en %
- `fixed_amount` : Réduction montant fixe
- `bogo` : Buy One Get One
- `free_product` : Produit offert
- `free_delivery` : Livraison gratuite
- `happy_hour` : Plage horaire
- `loyalty_multiplier` : x2, x3 points
- `min_order_discount` : À partir de X€
- `category_discount` : Sur une catégorie
- `new_customer` : Nouveaux clients
- `comeback` : Clients inactifs
- `bundle` : Menu/formule
- `flash_sale` : Vente flash
- `birthday` : Anniversaire

### Fidélité / Cashback
- X% automatique sur chaque commande (configurable)
- Utilisation au checkout
- Affichage solde en temps réel

### Surprise du Jour
- 1 tentative par jour par client
- 25% "pas de chance" (rien gagné)
- Récompenses : produit, réduction %, montant fixe, cashback
- Expiration : 3 jours
- Montant minimum configurable par récompense
- Coût estimé : 400-600€/mois

### Notifications Push
- Expo Push Notifications
- Statut commande : préparation, prête, en livraison, terminée
- Fidélité créditée
- Marketing (optionnel)

### Historique Commandes
- Liste avec statut coloré
- Polling automatique 30 secondes (commandes actives)
- Badge "Mise à jour en temps réel"
- Détail promos et économies

### Ticket d'Impression (80mm)
- ESC/POS pour imprimante thermique
- Articles avec options
- Promotions détaillées
- BOGO avec articles offerts
- Récompenses utilisées
- Récapitulatif économies
- Fidélité gagnée

### Backoffice
- Dashboard
- Gestion commandes + changement statut + impression
- Gestion produits/catégories/options
- Gestion promotions
- Gestion clients
- Paramètres (logo, horaires, fidélité %)
- IA Marketing (assistant + génération auto)

---

## 🔜 À IMPLÉMENTER

| Priorité | Fonctionnalité |
|----------|----------------|
| HIGH | Paiement Stripe (CB + Apple Pay) |
| MEDIUM | Livraison avec suivi GPS |
| LOW | Programme parrainage |

---

## 🛠️ COMMANDES UTILES

### Démarrage local
```bash
# Backend
cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Backoffice
cd admin && npm run dev

# App mobile
npx expo start
```

### Build & Deploy iOS
```bash
# Build preview (test)
eas build --platform ios --profile preview

# Build production
eas build --platform ios --profile production

# Soumettre TestFlight
eas submit --platform ios
```

### Git
```bash
git add .
git commit -m "feat: description"
git push origin main
```

---

## 📝 CONVENTIONS CODE

### Fichiers
- `.tsx` : Composants TypeScript avec JSX
- `.jsx` : Composants JavaScript avec JSX
- `.py` : Python (backend)
- `.js` : JavaScript (backoffice)

### API Endpoints
- `/app/*` : Routes pour l'app mobile
- `/admin/*` : Routes pour le backoffice
- `/orders`, `/customers`, etc. : Routes partagées

### Modèles Backend
- Pydantic V2 (`model_dump()` au lieu de `.dict()`)
- MongoDB avec Motor (async)
- Champs: `id`, `restaurant_id`, `created_at`, `updated_at`

---

## ⚠️ POINTS D'ATTENTION

1. **Deux backoffices** : `/admin` (actif) et `/src` (legacy, à ignorer)
2. **server.py** pas main.py pour le backend
3. **Port 3001** pour backoffice, pas 3000
4. **IP 192.168.10.102** dans l'app mobile (réseau local Faiçal)
5. **Pydantic V2** : utiliser `model_dump()` pas `.dict()`

---

## 🔄 DERNIÈRES MODIFICATIONS (06/12/2025)

- ✅ Services backend créés (notification, cashback, promotion_engine)
- ✅ Polling temps réel commandes (30s)
- ✅ Ticket impression avec promos détaillées
- ✅ Build production soumis à TestFlight
- ✅ Surprise du Jour optimisé (25% rien, 3 jours expiration)

---

## 💬 COMMENT UTILISER CE CONTEXTE

Au début d'une nouvelle conversation avec Claude, envoyer :

```
📂 Projet : FAMILYS-CLEAN
🔗 GitHub : https://github.com/FayceMOTIV/FAMILYSV2
📄 Contexte : Lis le fichier CLAUDE_CONTEXT.md à la racine du repo

🎯 Objectif aujourd'hui : [décrire la tâche]
```

Claude pourra alors fetch le contexte et reprendre exactement là où on s'était arrêté.

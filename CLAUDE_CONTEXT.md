# FAMILYS-CLEAN - Contexte Complet pour Claude

> ⚠️ **IMPORTANT** : MongoDB n'est PLUS utilisé. Toutes les données sont sur **Firebase Firestore**.
> Dernière mise à jour : 9 décembre 2025 - Build 83

---

## 📱 PRÉSENTATION DU PROJET

**FAMILYS-CLEAN** est une application de commande mobile complète pour le restaurant "Le Family's" à Bourg-en-Bresse, France.

### Stack Technique
| Composant | Technologie | Notes |
|-----------|-------------|-------|
| App Mobile | React Native / Expo | Bundle: `com.fayce.familysnew` |
| Backend | FastAPI Python | Port 8000 |
| Backoffice | React | Port 3001/3002 |
| Base de données | **Firebase Firestore** | ⚠️ Plus de MongoDB ! |
| Auth | Firebase Authentication | |
| Notifications | Firebase Cloud Messaging | |
| Paiements | Stripe | À configurer |

### Chemins sur le Mac
```
~/Desktop/FAMILYS-CLEAN/
├── app/                    # App React Native Expo
│   ├── (tabs)/             # Pages principales (cart, menu, profile, orders)
│   ├── (auth)/             # Authentification
│   ├── surprise-du-jour/   # Module Surprise du Jour
│   └── product/            # Page produit [id].tsx
├── backend/                # FastAPI Python
│   ├── server.py           # Point d'entrée
│   ├── routes/firebase/    # ⚠️ TOUTES les routes utilisent Firebase
│   │   ├── fb_surprise.py  # Surprise du Jour
│   │   ├── orders.py       # Commandes
│   │   ├── customers.py    # Clients
│   │   ├── promotions.py   # Promotions
│   │   └── ...
│   └── config/             # Config Firebase
├── admin/                  # Backoffice React
│   ├── src/pages/          # Dashboard, Promotions, SurpriseDuJour...
│   └── src/components/     # PromotionWizard, PromotionCalendar...
├── services/               # Services app mobile
│   ├── promotions.js       # Validation promos + codes SDJ
│   ├── surpriseDuJourService.js # API Surprise du Jour
│   └── ...
└── stores/                 # Zustand stores
    ├── authStore.js        # Auth + user data
    └── cartStore.js        # Panier + promos
```

---

## 🔥 FIREBASE - CONFIGURATION

### ⚠️ PLUS DE MONGODB !
Toute la base de données a été migrée sur Firebase Firestore. Ne plus utiliser les anciennes routes `/api/v1/admin/`.

### Collections Firestore
```
products          # Produits du menu
categories        # Catégories de produits
options           # Options des produits
choice_library    # Bibliothèque de choix pour options
promotions        # Promotions (14 types)
orders            # Commandes
customers         # Clients (uid, loyalty_balance, etc.)
loyalty_transactions  # Historique fidélité
popups            # Popups promotionnels
settings          # Paramètres globaux (dont surprise)
admin_notifications    # Notifs admin
customer_notifications # Notifs clients
surprise_configs  # Config récompenses SDJ
surprise_rewards  # Récompenses gagnées
surprise_plays    # Historique des jeux
```

### URLs Backend
- **Local** : `http://localhost:8000`
- **Ngrok (TestFlight)** : Variable - lancer `ngrok http 8000`

### Routes API
- **Base URL Firebase** : `/api/v1/fb/`
- **Surprise du Jour** : `/api/v1/fb/surprise/`
- **Promotions** : `/api/v1/fb/promotions/`
- **Commandes** : `/api/v1/fb/orders/`

---

## 🎰 SURPRISE DU JOUR - SYSTÈME COMPLET

### Configuration
- **1 jeu par jour** par utilisateur (reset minuit)
- **75% de chance de GAGNER** (configurable via `settings/surprise.win_probability`)
- **25% de chance de PERDRE**
- **Expiration** : 7 jours (configurable)

### Types de Récompenses

| Type | Comportement | Code | Auto-crédité |
|------|--------------|------|--------------|
| `discount_percent` | Réduction X% sur panier | SDJ-XXXX | ❌ |
| `discount_amount` | Réduction X€ fixe | SDJ-XXXX | ❌ |
| `cashback` | Crédite fidélité | null | ✅ |
| `product` | Produit gratuit | SDJ-XXXX | ❌ |

### Cashback - Fonctionnement Spécial
- **Auto-crédité** immédiatement sur `loyalty_balance`
- **Pas de code** à utiliser (code = null)
- `is_used: true` dès la création
- Le client voit son solde fidélité augmenter instantanément

### Récompenses Configurées
```
5% de réduction   - 35% prob - max 50/jour
10% de réduction  - 25% prob - max 30/jour
+2€ fidélité      - 10% prob - max 20/jour (CASHBACK)
+5€ fidélité      - 4% prob  - max 5/jour  (CASHBACK RARE)
SUNDAE gratuit    - 1% prob  - max 3/jour  (PRODUIT)
```

### Routes API Surprise
```
GET  /surprise/status?user_id=XXX        # Peut jouer ?
POST /surprise/play?user_id=XXX&user_name=YYY  # Jouer
GET  /surprise/rewards?user_id=XXX       # Mes récompenses
GET  /surprise/validate-reward/SDJ-XXX   # Valider un code
POST /surprise/use-reward/SDJ-XXX        # Utiliser un code
GET  /surprise/stats                     # Stats globales
GET  /surprise/config                    # Configs actives
PUT  /surprise/settings                  # Modifier settings
```

### Fichiers Clés
- `backend/routes/firebase/fb_surprise.py` - API complète
- `services/surpriseDuJourService.js` - Service app mobile
- `services/promotions.js` - Validation codes SDJ dans panier
- `app/surprise-du-jour/index.tsx` - Page du jeu
- `app/surprise-du-jour/rewards.tsx` - Mes récompenses
- `admin/src/pages/SurpriseDuJour*.js` - Backoffice

---

## 💎 SYSTÈME DE FIDÉLITÉ

### Fonctionnement
- **Gagner** : X% du montant PAYÉ (après toutes réductions)
- **Utiliser** : Déduit du total (ne peut pas dépasser le total)
- **Paramètre** : `settings.loyalty_percentage` (défaut 5%)

### Calcul dans cart.jsx
```javascript
// Cashback utilisable = ne peut pas dépasser le sous-total après promos
const maxCashbackUsable = Math.max(0, subtotal - cartPromoDiscount - promoCodeDiscount);
const cashbackUsed = useCashback ? Math.min(loyaltyBalance, maxCashbackUsable) : 0;

// Total final
const total = Math.max(0, subtotal - cartPromoDiscount - promoCodeDiscount - cashbackUsed);

// Fidélité gagnée = calculée sur le prix PAYÉ
const loyaltyEarned = total > 0 ? parseFloat((total * (loyaltyPercentage / 100)).toFixed(2)) : 0;
```

### Exemple
- Client a **10€** de fidélité
- Commande = **4€**
- → Utilise **4€** (pas 10€)
- → Reste **6€** sur la carte
- → Total à payer = **0€**

### Annulation de Commande
- La fidélité utilisée est **restituée** automatiquement
- Code dans `orders.py` route `cancel_order`

---

## 🎁 SYSTÈME PROMOTIONNEL

### 14 Types de Promotions
```
percentage, fixed_amount, free_item, bogo, bundle,
happy_hour, first_order, minimum_purchase, category_discount,
loyalty_multiplier, conditional, combo_upgrade,
free_delivery, flash_sale
```

### Codes Promo dans le Panier
Le champ "Code promo" accepte :
1. **Codes promo classiques** → Validés via `/promotions/validate`
2. **Codes Surprise du Jour (SDJ-XXXX)** → Validés via `/surprise/validate-reward`

### Fichiers Clés
- `services/promotions.js` - Validation (gère les 2 types)
- `stores/cartStore.js` - Application automatique
- `app/(tabs)/cart.jsx` - Affichage + utilisation
- `admin/src/pages/PromotionsV2.js` - Gestion backoffice
- `admin/src/components/PromotionWizard.js` - Création/édition

---

## 🔐 AUTHENTIFICATION

### App Mobile (authStore.js)
- `register()` : Crée user Firebase Auth + document `customers`
- `login()` : Authentifie + récupère données Firestore
- `logout()` : signOut Firebase
- `refreshUser()` : Rafraîchit les données (loyalty_balance, etc.)

### Backoffice (PIN)
| Mode | PIN | Usage |
|------|-----|-------|
| BackOffice | 1234 | Gestion complète |
| Commandes | 1111 | Vue commandes uniquement |
| Livraison | 2222 | Vue livreur |

---

## 📦 COMMANDES

### Flux de Commande
1. Client remplit panier (promos auto-appliquées)
2. Choisit mode (emporter/sur place/livraison)
3. Choisit créneau horaire
4. Optionnel : utilise fidélité / code promo
5. Valide → Commande créée avec statut `new`
6. Notification push envoyée

### Statuts
```
new → in_preparation → ready → completed
                    ↘ delivering → completed
cancelled (à tout moment)
```

### Données Sauvegardées
```javascript
{
  customer_uid, customer_email, customer_name, customer_phone,
  items: [{ product_id, name, quantity, unit_price, options, from_reward, has_promo }],
  subtotal, original_total, product_promo_savings,
  cart_promo_discount, promo_code, promo_code_discount,
  promotions_applied: [],
  loyalty_used, loyalty_earned,
  total, vat_amount,
  payment_method, consumption_mode, pickup_date, pickup_time,
  notes, status
}
```

---

## 🛠️ COMMANDES UTILES

### Démarrage
```bash
# Backend
cd ~/Desktop/FAMILYS-CLEAN/backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload

# Backoffice
cd ~/Desktop/FAMILYS-CLEAN/admin
npm start  # ou: npx serve -s build -l 3002

# App Mobile
cd ~/Desktop/FAMILYS-CLEAN
npx expo start

# Ngrok (pour TestFlight)
ngrok http 8000
```

### Build TestFlight
```bash
cd ~/Desktop/FAMILYS-CLEAN
# Incrémenter le buildNumber dans app.json
eas build --platform ios --profile production --auto-submit
```

### Tests API
```bash
# Stats dashboard
curl http://localhost:8000/api/v1/fb/dashboard/stats

# Jouer Surprise du Jour
curl -X POST "http://localhost:8000/api/v1/fb/surprise/play?user_id=XXX&user_name=YYY"

# Valider code SDJ
curl http://localhost:8000/api/v1/fb/surprise/validate-reward/SDJ-XXXXX

# Récompenses d'un user
curl "http://localhost:8000/api/v1/fb/surprise/rewards?user_id=XXX"
```

---

## ⚠️ POINTS D'ATTENTION

### Ne PAS faire
- ❌ Utiliser les routes `/api/v1/admin/` (anciennes routes MongoDB)
- ❌ Utiliser `api.get\`template\`` (syntaxe cassée, utiliser concaténation)
- ❌ Créer des index composites Firestore sans tester (filtrer côté Python)

### À vérifier avant build
- ✅ URL backend correcte dans `constants/config.js`
- ✅ buildNumber incrémenté dans `app.json`
- ✅ Backend accessible (ngrok si TestFlight)

### Structure Customer Firebase
```javascript
{
  uid: "xxx",           // ID du document = ID auth Firebase
  email, name, phone,
  loyalty_balance: 0,   // Solde fidélité actuel
  total_orders: 0,
  total_spent: 0,
  // ...
}
```

---

## 📝 HISTORIQUE DES MODIFICATIONS (Session 9 déc 2025)

### Corrections Appliquées
1. **promotions.js** - Syntaxe corrigée + gestion codes SDJ-XXXX
2. **surpriseDuJourService.js** - URLs corrigées (`/surprise/*`)
3. **cart.jsx** - Syntaxe axios.post corrigée
4. **fb_surprise.py** - Cashback auto-crédité + filtre user_id

### Validations Effectuées
- ✅ Dashboard : Stats correctes
- ✅ Promotions : Analytics + calendrier navigable
- ✅ Surprise du Jour : 75% gagner, cashback auto, codes fonctionnels
- ✅ Fidélité : Calcul correct (min entre solde et total)
- ✅ Historique commandes : Tout affiché (promos, offerts, économies)

### Build Actuel
- **Numéro** : 83
- **Status** : Prêt à builder

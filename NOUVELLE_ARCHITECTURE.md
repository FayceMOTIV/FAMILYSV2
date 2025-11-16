# 🚀 Nouvelle Architecture Family's - Clean & Scalable

## Vue d'ensemble

Architecture **100% neuve** sans dépendances à l'ancien frontend corrompu.

```
/app/
├── mobile-app/       # 📱 React Native + Expo (iOS/Android)
├── admin-web/        # 💼 React + Vite + TailwindCSS
├── backend/          # 🧠 FastAPI (EXISTANT - non modifié)
└── frontend/         # ⚠️ ANCIEN - DÉSACTIVÉ
```

---

## 📱 Mobile App (mobile-app/)

### Stack Technique
- **Framework**: React Native + Expo SDK 54
- **Navigation**: Expo Router (file-based)
- **State**: Zustand
- **Styling**: NativeWind (Tailwind for RN)
- **API**: Axios

### Écrans Disponibles
✅ **Tabs Navigation**:
1. Home (`app/(tabs)/index.jsx`)
2. Menu (`app/(tabs)/menu.jsx`)
3. Cart (`app/(tabs)/cart.jsx`)
4. Loyalty/Cashback (`app/(tabs)/loyalty.jsx`)
5. Profile (`app/(tabs)/profile.jsx`)

✅ **Autres écrans**:
6. Product Detail (`app/product/[id].jsx`)
7. Login (`app/auth/login.jsx`)
8. Signup (`app/auth/signup.jsx`)
9. Checkout (`app/checkout.jsx`)

### API Client
Configuré et prêt : `services/api.js`
- Products API
- Categories API
- Orders API
- Cashback API
- Auth API
- Promotions API

### State Stores
- `stores/authStore.js` - Authentication
- `stores/cartStore.js` - Cart management
- `stores/loyaltyStore.js` - Loyalty/Cashback

### Commandes
```bash
cd mobile-app
npm install
npx expo start           # Dev server
npx expo start --android # Android
npx expo start --ios     # iOS (macOS only)
npx expo start --web     # Web preview
```

---

## 💼 Admin Backoffice (admin-web/)

### Stack Technique
- **Framework**: React 18 + Vite
- **Routing**: React Router 6
- **State**: Zustand
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **API**: Axios

### Pages Disponibles
✅ **Navigation principale**:
1. Dashboard (`src/pages/Dashboard.jsx`)
2. Products (`src/pages/Products.jsx`)
3. Categories (`src/pages/Categories.jsx`)
4. Orders (`src/pages/Orders.jsx`)
5. Customers (`src/pages/Customers.jsx`)
6. Promotions V2 (`src/pages/Promotions.jsx`)
7. AI Marketing (`src/pages/AIMarketing.jsx`)
8. Settings (`src/pages/Settings.jsx`)

✅ **Auth**:
- Login (`src/pages/Login.jsx`)

### Layout
- Sidebar navigation (`src/components/Layout.jsx`)
- Responsive design
- Auth guard sur toutes les routes

### API Client
Configuré et prêt : `src/services/api.js`
- Dashboard API
- Products API (CRUD)
- Categories API (CRUD)
- Orders API (GET + status + payment)
- Customers API
- Promotions V2 API (CRUD + simulate + analytics)
- AI Marketing API (campaigns + validation)

### Commandes
```bash
cd admin-web
npm install
npm run dev      # Dev (port 3001)
npm run build    # Production build
npm run preview  # Preview prod build
```

### Authentication
```
Email: admin@familys.app
Password: Admin@123456
```

---

## 🧠 Backend (backend/)

### Status
✅ **Conservé tel quel - aucune modification**

### API Base URL
```
https://react-reborn.preview.emergentagent.com/api/v1
```

### Endpoints Disponibles
Tous les endpoints existants sont fonctionnels :
- ✅ Products & Categories
- ✅ Orders & Customers
- ✅ Cashback System V3 (5% loyalty)
- ✅ Promotions V2 (15 types)
- ✅ AI Marketing
- ✅ Stock Management
- ✅ Notifications
- ✅ Auth (admin + customer)

---

## 🎨 Design System

### Couleurs
```css
Primary (Rouge Family's): #C62828
Secondary (Or):           #FFD54F
White:                    #FFFFFF
```

### Typographie
- Sans-serif system fonts
- Font weights: 400, 500, 600, 700

---

## 📊 État Actuel

### Mobile App
- ✅ Projet créé et configuré
- ✅ Navigation Expo Router fonctionnelle
- ✅ 9 écrans vides mais navigables
- ✅ API client configuré
- ✅ Zustand stores créés
- 🔜 À développer : contenu des écrans

### Admin Web
- ✅ Projet créé et configuré
- ✅ Layout avec sidebar
- ✅ 8 pages vides mais navigables
- ✅ Login page fonctionnelle
- ✅ API client configuré
- ✅ Zustand store créé
- 🔜 À développer : contenu des pages

### Backend
- ✅ 100% fonctionnel
- ✅ Tous les endpoints opérationnels
- ✅ Aucune modification nécessaire

---

## 🚀 Prochaines Étapes

### Mobile App
1. Développer la page Home avec promos
2. Implémenter la liste des produits
3. Créer la page Product Detail avec options
4. Développer le panier et le checkout
5. Intégrer le système de cashback
6. Implémenter l'authentification
7. Ajouter l'historique des commandes
8. Créer les favoris

### Admin Web
1. Compléter le Dashboard avec stats temps réel
2. CRUD Produits complet (avec options/variants)
3. CRUD Catégories avec réordonnancement
4. Page Commandes (filtres, status, paiement)
5. Liste clients avec détails
6. CRUD Promotions V2 (wizard multi-steps)
7. IA Marketing (validation de campagnes)
8. Page Paramètres restaurant
9. Ajouter graphiques avec Recharts

---

## 🛠️ Maintenance

### Ancien Frontend
```bash
# Services désactivés dans supervisor
frontend: stopped
frontend-prod: stopped
```

### Nouveau Frontend
```bash
# Mobile app (dev)
cd /app/mobile-app && npx expo start

# Admin web (dev)
cd /app/admin-web && npm run dev
```

---

## ✅ Points Clés

1. **Architecture propre** : Aucun code hérité de l'ancien front
2. **Séparation claire** : Mobile et Admin complètement séparés
3. **Backend intact** : Aucune modification du backend
4. **Production ready** : Structure professionnelle et scalable
5. **État global** : Zustand pour simplicité et performance
6. **Styling moderne** : TailwindCSS partout
7. **Navigation fluide** : Expo Router (mobile) + React Router (admin)
8. **API centralisée** : Services API bien organisés

---

## 📝 Notes Importantes

- ⚠️ L'ancien frontend (`/app/frontend`) est **désactivé** mais conservé pour référence
- ✅ Tous les nouveaux composants sont créés **from scratch**
- ✅ Aucune dépendance aux anciens layouts, CSS ou handlers
- ✅ Architecture **mobile-first** pour l'app mobile
- ✅ Architecture **desktop-first** pour l'admin
- ✅ Aucun problème d'overlay, de pointer-events ou de handlers touch/click

---

**Date de création** : 16 Novembre 2025
**Status** : ✅ Architecture créée - Prête pour développement

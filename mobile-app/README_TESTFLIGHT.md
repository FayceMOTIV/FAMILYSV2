# 📱 Family's Mobile App - Guide TestFlight

## 🎯 INSTALLATION RAPIDE

### **1. Installer les dépendances**
```bash
cd mobile-app
yarn install
```

### **2. Se connecter à Expo**
```bash
npx eas-cli login
# Email: lefamilys01@gmail.com
# Token: s80VZOWC7GuGwVPgcSqUP7A1VHbjk4ME5GweRUMA
```

### **3. Configurer les credentials Apple (UNE SEULE FOIS)**
```bash
npx eas credentials
```
**Choisis :**
- Platform: **iOS**
- Action: **Set up new credentials**
- Suis les instructions

### **4. Lancer le build TestFlight**
```bash
npx eas build --platform ios --profile production
```

⏳ **Attends 10-15 minutes**, tu recevras un email quand le build sera prêt !

### **5. Soumettre à TestFlight (Optionnel)**
```bash
npx eas submit --platform ios
```

---

## 🔑 INFORMATIONS DU PROJET

- **Bundle ID**: com.familys.app
- **Apple Team ID**: 5ZR87TPM89
- **ASC App ID**: 6755365400
- **Apple ID**: lefamilys01@gmail.com
- **Expo Project**: @faical001/familys-app
- **Project ID**: 03d04e04-c52a-4c16-a85b-8ee5533f3747

---

## 📱 TESTER EN LOCAL (Sans Build)

### **Option A : iPhone Simulator (Mac uniquement)**
```bash
npx expo start
# Appuie sur 'i' pour ouvrir le simulateur iOS
```

### **Option B : Ton iPhone avec Expo Go**
```bash
npx expo start --tunnel
# Scanne le QR code avec Expo Go
```

---

## 🏗️ STRUCTURE DU PROJET

```
mobile-app/
├── app/                    # Écrans (Expo Router)
│   ├── (tabs)/            # Navigation tabs
│   │   ├── index.jsx      # Accueil
│   │   ├── menu.jsx       # Menu
│   │   ├── cart.jsx       # Panier
│   │   ├── loyalty.jsx    # Fidélité
│   │   └── profile.jsx    # Profil
│   ├── auth/              # Authentification
│   ├── product/[id].jsx   # Détail produit
│   ├── favorites.jsx      # Favoris
│   ├── orders.jsx         # Historique
│   ├── order-detail/[id].jsx
│   ├── order-success.jsx
│   ├── checkout.jsx
│   └── notifications.jsx
├── components/            # Composants réutilisables
├── stores/               # State management (Zustand)
│   ├── authStore.js
│   ├── cartStore.js
│   ├── orderStore.js
│   ├── notificationStore.js
│   └── favoriteStore.js
├── hooks/                # Custom hooks
├── services/             # API client
├── constants/            # Theme & config
├── app.json             # Config Expo
└── eas.json             # Config EAS Build

```

---

## ✅ FONCTIONNALITÉS IMPLÉMENTÉES

### **Navigation & Auth**
- ✅ 5 tabs (Accueil, Menu, Panier, Fidélité, Profil)
- ✅ Login / Signup
- ✅ Gestion session

### **Produits & Catalogue**
- ✅ Liste produits par catégorie
- ✅ Détail produit avec options (tailles, extras)
- ✅ Notes spéciales
- ✅ Recherche
- ✅ Favoris ❤️

### **Panier & Checkout**
- ✅ Ajout/modification quantité
- ✅ Calcul prix avec options
- ✅ Preview cashback
- ✅ Multi-paiement (CB + Fidélité)
- ✅ 3 modes: Sur place, À emporter, Livraison

### **Carte Fidélité**
- ✅ Affichage solde
- ✅ Historique transactions
- ✅ Utilisation cashback au checkout
- ✅ Calcul cashback gagné

### **Commandes**
- ✅ Historique complet
- ✅ Filtres (Toutes, En cours, Terminées)
- ✅ Détail commande
- ✅ Bouton "Recommander"
- ✅ Page Order Success avec animation

### **Notifications**
- ✅ Liste notifications
- ✅ Badge unread count
- ✅ Auto-refresh
- ✅ Pull-to-refresh

---

## 🔧 DÉPANNAGE

### **Erreur: "Cannot find module"**
```bash
rm -rf node_modules
yarn install
```

### **Erreur: "Port already in use"**
```bash
killall node
npx expo start
```

### **Problème de credentials**
```bash
npx eas credentials --clear-credentials
npx eas credentials
```

---

## 📞 SUPPORT

- **Expo Docs**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **TestFlight**: https://developer.apple.com/testflight/

---

## 🚀 PRÊT À DÉPLOYER !

Tout est configuré et prêt. Tu as juste à :
1. Installer les dépendances
2. Configurer les credentials Apple (une seule fois)
3. Lancer le build

**Bonne chance ! 🎉**

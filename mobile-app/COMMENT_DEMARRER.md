# 📱 Comment Démarrer l'App Mobile Family's sur iPhone

## 🚀 Méthode Rapide (5 minutes)

### 1️⃣ Installe Expo Go sur ton iPhone
- Ouvre l'**App Store**
- Cherche **"Expo Go"**
- Installe (gratuit)

### 2️⃣ Démarre le serveur
Dans le terminal :
```bash
cd /app/mobile-app
npx expo start --tunnel
```

### 3️⃣ Scanne le QR Code
- Ouvre l'app **Appareil Photo** sur ton iPhone
- Scanne le QR code affiché dans le terminal
- Appuie sur la notification
- L'app s'ouvre dans Expo Go ! 🎉

---

## 🔧 Options Avancées

### **Mode Tunnel (Recommandé)**
Permet d'accéder depuis n'importe où :
```bash
npx expo start --tunnel
```

### **Mode Local**
Fonctionne uniquement sur le même réseau WiFi :
```bash
npx expo start
```

### **Mode Développement**
Active le hot-reload :
```bash
npx expo start --dev-client
```

---

## 📲 Comptes de Test

### **Utilisateur Client**
- Email : `test@familys.app`
- Mot de passe : `Test@123`

### **Admin (pour tester via Admin Web)**
- Email : `admin@familys.app`
- Mot de passe : `Admin@123456`

---

## 🎯 Fonctionnalités à Tester

### **Navigation**
- [ ] 5 tabs (Accueil, Menu, Panier, Fidélité, Profil)
- [ ] Badge panier avec compteur articles
- [ ] Badge notifications sur profil

### **Produits**
- [ ] Liste produits avec images
- [ ] Détail produit
- [ ] Bouton ❤️ favoris
- [ ] Sélection options (taille, extras)
- [ ] Notes spéciales
- [ ] Quantité +/-

### **Panier & Checkout**
- [ ] Ajout/suppression articles
- [ ] Preview cashback
- [ ] 3 modes : Sur place, À emporter, Livraison
- [ ] Passer commande

### **Commandes**
- [ ] Historique commandes
- [ ] Filtres (Toutes, En cours, Terminées)
- [ ] Détail commande
- [ ] Bouton "Recommander"

### **Cashback**
- [ ] Affichage solde
- [ ] Historique transactions
- [ ] Utilisation lors du paiement

### **Notifications**
- [ ] Liste notifications
- [ ] Badge unread count
- [ ] Pull-to-refresh

### **Favoris**
- [ ] Liste favoris
- [ ] Grille 2 colonnes
- [ ] Heart icon sur cards

---

## 🐛 Dépannage

### **Le QR Code ne fonctionne pas**
1. Assure-toi que ton iPhone et ton ordinateur sont sur le même réseau WiFi
2. Ou utilise le mode tunnel : `npx expo start --tunnel`

### **L'app ne charge pas**
1. Redémarre le serveur : Ctrl+C puis `npx expo start --tunnel`
2. Vide le cache : `npx expo start --clear`

### **Erreur "Metro Bundler"**
```bash
rm -rf node_modules
yarn install
npx expo start --clear
```

### **Erreur "Cannot connect to server"**
Vérifie que le backend est actif :
```bash
curl https://react-reborn.preview.emergentagent.com/api/v1/products
```

---

## 📚 Documentation Expo

- [Expo Go](https://expo.dev/client)
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)

---

## ✅ Checklist Avant de Tester

- [ ] Backend actif (vérifié avec curl)
- [ ] Expo Go installé sur iPhone
- [ ] Terminal ouvert dans `/app/mobile-app`
- [ ] Commande `npx expo start --tunnel` lancée
- [ ] QR code visible dans le terminal
- [ ] Appareil Photo prêt à scanner

**C'est parti ! 🚀**

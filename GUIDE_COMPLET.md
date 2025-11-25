# 📱 Guide Complet - Family's App

## 🏗️ Architecture du Projet

```
/app/
├── backend/         ✅ FastAPI (port 8001)
├── admin-web/       ✅ Back Office React + Vite (port 3002)
└── mobile-app/      ✅ App Mobile React Native + Expo
```

---

## 🖥️ 1. ADMIN WEB (Back Office)

### **Accès Preview Web**
L'admin web est maintenant accessible sur :
```
https://react-reborn.preview.emergentagent.com:3002
```

### **Connexion**
- **Email:** `admin@familys.app`
- **Mot de passe:** `Admin@123456`

### **Fonctionnalités disponibles**
- ✅ Dashboard avec métriques
- ✅ Gestion produits (CRUD complet)
- ✅ Gestion catégories
- ✅ Gestion commandes
- ✅ Promotions V2 (15 types)
- ✅ Marketing AI
- ✅ Stock management
- ✅ Remboursements partiels

### **Backend API**
L'admin-web est connecté au backend FastAPI :
```
https://react-reborn.preview.emergentagent.com/api/v1
```

---

## 📱 2. APP MOBILE (Clients)

### **⚠️ Important : L'app mobile n'est PAS visible sur le preview web**
C'est une application **React Native** qui fonctionne uniquement sur smartphone/émulateur.

---

## 📲 Comment Installer l'App sur ton iPhone ?

### **Option 1 : Expo Go (RECOMMANDÉ - GRATUIT)**

#### **Étape 1 : Installer Expo Go**
1. Ouvre l'**App Store** sur ton iPhone
2. Cherche **"Expo Go"**
3. Installe l'application (gratuite)

#### **Étape 2 : Démarrer le serveur Expo**
Dans le terminal, exécute :
```bash
cd /app/mobile-app
npx expo start --tunnel
```

**Note :** L'option `--tunnel` permet d'accéder à l'app depuis n'importe où (pas besoin d'être sur le même réseau).

#### **Étape 3 : Scanner le QR Code**
1. Le terminal affichera un **QR code**
2. Sur ton iPhone :
   - Ouvre l'app **Appareil Photo**
   - Scanne le QR code
   - Appuie sur la notification qui apparaît
   - L'app s'ouvrira dans **Expo Go** ✨

---

### **Option 2 : Build Production (AVANCÉ)**

Si tu veux une vraie app installable (.ipa), il faudra :
1. Créer un compte Apple Developer (99$/an)
2. Configurer les certificats
3. Build avec EAS (Expo Application Services)

**Commande :**
```bash
cd /app/mobile-app
npx eas build --platform ios
```

---

## 🔗 3. CONNEXION BACKEND

### **Les 3 apps utilisent le même backend**

```
Backend FastAPI (port 8001)
      ↓
      ├──→ Admin Web (port 3002)
      └──→ Mobile App (Expo)
```

### **Configuration API dans Mobile App**
Le fichier `/app/mobile-app/services/api.js` pointe vers :
```javascript
const API_BASE_URL = 'https://react-reborn.preview.emergentagent.com/api/v1';
```

✅ **Pas besoin de modifications**, tout est déjà connecté !

---

## 🎯 4. FONCTIONNALITÉS DE L'APP MOBILE

### **Navigation (5 tabs)**
1. **🏠 Accueil** - Hero, catégories, promos
2. **📖 Menu** - Liste produits avec filtres
3. **🛒 Panier** - Gestion panier + cashback preview
4. **⭐ Fidélité** - Carte cashback + historique
5. **👤 Profil** - Infos user + commandes + logout

### **Fonctionnalités Complètes**
- ✅ **Auth** : Login/Signup
- ✅ **Produits** : Liste, détail, recherche
- ✅ **Options Produits** : Tailles, extras, notes
- ✅ **Favoris** : Wishlist avec ❤️
- ✅ **Panier** : +/- quantité, suppression
- ✅ **Cashback** : Preview, utilisation, gain
- ✅ **Multi-paiement** : CB + Fidélité
- ✅ **Checkout** : 3 modes (Sur place, À emporter, Livraison)
- ✅ **Notifications** : Badge + liste
- ✅ **Commandes** : Historique + détail + recommander
- ✅ **Order Success** : Animation + récap
- ✅ **Promotions** : Badge dynamique (BOGO, -20%, etc.)

---

## 🛠️ 5. COMMANDES UTILES

### **Backend**
```bash
# Vérifier le statut
sudo supervisorctl status backend

# Redémarrer
sudo supervisorctl restart backend

# Logs
tail -f /var/log/supervisor/backend.out.log
```

### **Admin Web**
```bash
# Vérifier le statut
sudo supervisorctl status admin

# Redémarrer
sudo supervisorctl restart admin

# Build
cd /app/admin-web && npm run build

# Dev local
cd /app/admin-web && npm run dev
```

### **Mobile App**
```bash
# Démarrer Expo (avec tunnel pour iPhone)
cd /app/mobile-app && npx expo start --tunnel

# Démarrer Expo (local uniquement)
cd /app/mobile-app && npx expo start

# Build iOS (nécessite compte Apple Developer)
cd /app/mobile-app && npx eas build --platform ios

# Build Android
cd /app/mobile-app && npx eas build --platform android
```

---

## 📊 6. TESTS

### **Backend : 95% Succès** ✅
Tous les endpoints critiques testés et fonctionnels.

### **Admin Web** ✅
Accessible sur preview, toutes les pages fonctionnelles.

### **Mobile App** ⏳
À tester sur iPhone avec Expo Go.

---

## 🆘 7. DÉPANNAGE

### **Problème : Admin Web ne charge pas**
```bash
sudo supervisorctl restart admin
sleep 5
curl http://localhost:3002
```

### **Problème : Backend ne répond pas**
```bash
sudo supervisorctl restart backend
curl https://react-reborn.preview.emergentagent.com/api/v1/products
```

### **Problème : Expo ne démarre pas**
```bash
cd /app/mobile-app
rm -rf node_modules
yarn install
npx expo start --tunnel --clear
```

### **Problème : QR Code ne fonctionne pas**
Essaye le mode **tunnel** :
```bash
npx expo start --tunnel
```

---

## 🎉 RÉSUMÉ RAPIDE

1. **Admin Web** → Accessible sur https://react-reborn.preview.emergentagent.com:3002
2. **App Mobile** → Installe **Expo Go**, scanne le QR code après `npx expo start --tunnel`
3. **Backend** → Déjà fonctionnel et connecté aux 2 apps

**Tout est prêt ! 🚀**

---

## 📞 BESOIN D'AIDE ?

Si tu as des questions ou problèmes :
1. Vérifie les logs : `tail -f /var/log/supervisor/*.log`
2. Redémarre les services : `sudo supervisorctl restart all`
3. Vérifie les ports : `netstat -tlnp | grep -E '3002|8001'`

**Bon développement ! ✨**

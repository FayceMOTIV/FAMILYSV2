# 📱 GUIDE COMPLET EXPO GO

## 🎯 CE QU'IL TE FAUT

### **1. Installer Expo Go sur ton iPhone**
- Ouvre l'**App Store**
- Cherche **"Expo Go"**
- Installe (gratuit, ~50MB)
- Ouvre l'app une fois pour vérifier qu'elle fonctionne

### **2. Avoir le code de l'app**
Le code est dans `/app/mobile-app/`

---

## 🚀 MÉTHODE 1 : Via le Terminal (Si tu as accès)

### **Étape 1 : Lance Expo**
```bash
cd /app/mobile-app
npx expo start --tunnel
```

### **Étape 2 : Attends le QR Code**
Après 30-60 secondes, tu verras :
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (iOS)

█████████████████████████████████
█████████████████████████████████
████ ▄▄▄▄▄ █▀▄ ▄▄▀█ ▄▄▄▄▄ ████
...
```

### **Étape 3 : Scanne avec l'iPhone**
1. Ouvre l'app **Appareil Photo** (pas Expo Go !)
2. Pointe vers le QR code
3. Une notification apparaît : "Ouvrir dans Expo Go"
4. Appuie dessus
5. L'app se charge ! 🎉

---

## 🌐 MÉTHODE 2 : Via un Lien Direct (Alternative)

Si le QR code ne fonctionne pas, Expo génère aussi un **lien direct** :

```
exp://u.expo.dev/update/[id]
```

Tu peux :
1. Copier le lien
2. L'envoyer par email/message sur ton iPhone
3. Ouvrir le lien sur iPhone
4. Ça ouvre automatiquement dans Expo Go

---

## 🔧 MÉTHODE 3 : Expo Snack (En ligne, SANS terminal)

Si tu n'as pas accès au terminal :

### **Étape 1 : Créer un Snack**
1. Va sur **https://snack.expo.dev**
2. Connecte-toi avec ton compte Expo (gratuit)
3. Créer un nouveau Snack

### **Étape 2 : Copier le code**
Upload les fichiers de `/app/mobile-app/` sur Snack

### **Étape 3 : Scanner**
Snack génère automatiquement un QR code et un lien

---

## ⚙️ CONFIGURATION DE L'APP

### **Backend API**
L'app est déjà configurée pour pointer vers :
```
https://react-reborn.preview.emergentagent.com/api/v1
```

Dans `/app/mobile-app/services/api.js`

### **Credentials Expo**
- **Project ID** : `03d04e04-c52a-4c16-a85b-8ee5533f3747`
- **Slug** : `familys-app`
- **Owner** : `@faical001`

---

## 🐛 DÉPANNAGE

### **Problème : Le QR code n'apparaît pas**
Solution :
```bash
# Augmente les file watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Nettoie le cache
cd /app/mobile-app
rm -rf .expo node_modules/.cache
npx expo start --tunnel --clear
```

### **Problème : "Metro bundler failed"**
Solution :
```bash
# Utilise moins de workers
cd /app/mobile-app
npx expo start --tunnel --max-workers 1
```

### **Problème : "Cannot connect to Metro"**
Solution :
```bash
# Utilise le mode LAN au lieu de tunnel
cd /app/mobile-app
npx expo start --lan
```

### **Problème : "Module not found"**
Solution :
```bash
cd /app/mobile-app
rm -rf node_modules
yarn install
npx expo start --clear
```

---

## 📱 COMPTES DE TEST

### **Compte Client (pour tester l'app)**
- Email : `test@familys.app`
- Mot de passe : `Test@123`

### **Compte Admin (back office)**
- Email : `admin@familys.app`
- Mot de passe : `Admin@123456`

---

## ✅ CHECKLIST AVANT DE COMMENCER

- [ ] Expo Go installé sur iPhone
- [ ] Code app dans `/app/mobile-app/`
- [ ] `node_modules` installés (`yarn install`)
- [ ] Backend actif (vérifie : https://react-reborn.preview.emergentagent.com/api/v1/products)
- [ ] Terminal accessible pour lancer `npx expo start`

---

## 🎯 COMMANDE FINALE À LANCER

```bash
cd /app/mobile-app && \
rm -rf .expo node_modules/.cache && \
EXPO_NO_DOTENV=1 npx expo start --tunnel --clear
```

**Attends 60 secondes max, le QR code va apparaître !**

---

## 💡 ASTUCE PRO

Si tu veux que l'app reste ouverte sur ton iPhone même après fermeture d'Expo Go :
1. Une fois l'app chargée dans Expo Go
2. Va dans les paramètres iPhone → Général → VPN et gestion de périphériques
3. Fais confiance à l'app Expo Go
4. L'app restera accessible

---

## 🆘 BESOIN D'AIDE ?

Si rien ne fonctionne :
1. Envoie-moi le message d'erreur exact
2. Screenshot de ce qui s'affiche
3. Je t'aide en temps réel !

**PRÊT ? LANCE LA COMMANDE ET SCANNE LE QR CODE ! 🚀**

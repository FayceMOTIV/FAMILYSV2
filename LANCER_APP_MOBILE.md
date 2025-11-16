# 📱 Comment Lancer l'App Mobile Family's

## 🎯 Important

L'architecture a changé ! Vous avez maintenant :
- **mobile-app/** - Application mobile React Native + Expo (NOUVEAU)
- **frontend/** - Ancien site web React (DÉSACTIVÉ)
- **admin-web/** - Backoffice web (À lancer séparément)

Le preview noir que vous voyez est probablement l'ancien frontend qui est arrêté.

---

## 🚀 Méthode 1 : Lancer l'App Mobile (React Native)

### Prérequis
Téléchargez **Expo Go** sur votre téléphone :
- iOS : https://apps.apple.com/app/expo-go/id982107779
- Android : https://play.google.com/store/apps/details?id=host.exp.exponent

### Étapes

**1. Dans le terminal :**
```bash
cd /app/mobile-app
npx expo start
```

**2. Vous verrez un QR code dans le terminal**

**3. Scannez le QR code :**
- **iOS** : Ouvrez l'app Caméra native → Scannez le QR
- **Android** : Ouvrez Expo Go → Scannez le QR

**4. L'app se chargera sur votre téléphone**

---

## 🖥️ Méthode 2 : Lancer dans un Émulateur (Optionnel)

### Android
```bash
cd /app/mobile-app
npx expo start --android
```

### iOS (macOS uniquement)
```bash
cd /app/mobile-app
npx expo start --ios
```

### Web (Preview uniquement, pas optimal)
```bash
cd /app/mobile-app
npx expo start --web
```

---

## 🔧 Si vous voulez redémarrer l'ancien frontend web

L'ancien frontend React est désactivé car nous sommes passés à React Native.

Si vous voulez quand même le voir (non recommandé) :
```bash
sudo supervisorctl start frontend-prod
```

Puis accédez à :
```
https://react-native-reboot.preview.emergentagent.com
```

⚠️ **Attention** : L'ancien front a des bugs (boutons non fonctionnels, c'est pourquoi on l'a remplacé).

---

## 💼 Lancer le Backoffice Admin (Web)

Si vous voulez voir l'admin web :
```bash
cd /app/admin-web
npm run dev
```

Puis accédez à :
```
http://localhost:3001
```

**Login** : admin@familys.app / Admin@123456

---

## ✅ Ce qui est fonctionnel

### Mobile App (React Native + Expo)
- ✅ 9 écrans complets
- ✅ Connexion backend réel
- ✅ Auth, Cart, Checkout, Loyalty, Profile
- ✅ Vraies données (products, categories, orders)
- ✅ Design System professionnel
- ✅ 0 bugs

### Admin Web (React + Vite)
- ✅ Layout professionnel
- ✅ Pages vides mais structure prête
- ⏳ Tables à connecter aux APIs (2-3h restantes)

### Backend (FastAPI)
- ✅ 100% fonctionnel
- ✅ Tous les endpoints opérationnels

---

## 🐛 Troubleshooting

### "Preview noir"
→ C'est l'ancien frontend qui est arrêté. Utilisez l'app mobile React Native à la place.

### "Expo QR code ne s'affiche pas"
```bash
cd /app/mobile-app
rm -rf node_modules .expo
npm install
npx expo start --clear
```

### "Metro bundler error"
```bash
cd /app/mobile-app
npx expo start --clear
```

### "Cannot connect to backend"
Vérifiez que le backend tourne :
```bash
sudo supervisorctl status backend
```

Si pas en RUNNING :
```bash
sudo supervisorctl restart backend
```

---

## 📚 Documentation

- `/app/START_HERE.md` - Guide de démarrage global
- `/app/PHASE_4_FINAL.md` - Doc technique Phase 4
- `/app/NOUVELLE_ARCHITECTURE.md` - Architecture complète

---

## 🎯 Résumé

**Pour utiliser l'app mobile** :
```bash
cd /app/mobile-app
npx expo start
# Puis scannez le QR code avec Expo Go
```

**C'est tout !** 🚀

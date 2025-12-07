# 🍔 FAMILYS-CLEAN

Application mobile restaurant **Le Family's** (Bourg-en-Bresse) avec backoffice d'administration.

## 🚀 Démarrage rapide

### Backend (API)
```bash
cd backend
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Backoffice Admin
```bash
cd admin
npm start
# Accès: http://localhost:3003
```

### App Mobile
```bash
npx expo start
# Scanner le QR code avec Expo Go
```

## 📁 Structure
```
├── app/                 # App Mobile (Expo/React Native)
├── admin/               # Backoffice (React.js)
├── backend/             # API (FastAPI + Firebase)
├── assets/              # Images, fonts
├── components/          # Composants partagés
├── stores/              # État global (Zustand)
└── constants/           # Configuration
```

## 🔥 Firebase

L'application utilise Firebase pour :
- **Firestore** : Base de données
- **Storage** : Images produits/branding
- **Auth** : Authentification (à venir)

### Collections Firestore
- `products` - Produits du menu
- `categories` - Catégories
- `orders` - Commandes
- `users` - Clients
- `settings/restaurant` - Paramètres
- `promotions` - Promotions actives
- `popups` - Popups marketing
- `surprise_configs` - Config récompenses jeu
- `surprise_plays` - Historique parties
- `surprise_rewards` - Récompenses gagnées

## 🎰 Modules

### Surprise du Jour
Jeu quotidien avec roue de récompenses :
- Dashboard avec stats et coût mensuel
- Configuration des probabilités
- Suivi des récompenses clients

### Promotions
14 types de promotions supportés :
- BOGO, réductions, happy hour, etc.

### Fidélité
Système de cashback automatique (5% par défaut)

## 📱 Build Production
```bash
# iOS TestFlight
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## 📞 Contact

**Le Family's**
- 📍 59 rue du 14 Juillet 1789, 01000 Bourg-en-Bresse
- 📞 04 74 52 60 82
- 📧 lefamilys01@gmail.com

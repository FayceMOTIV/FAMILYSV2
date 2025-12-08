# 🍔 FAMILYS-CLEAN

Application mobile de commande pour le restaurant **Le Family's** à Bourg-en-Bresse, France.

## 📱 Stack Technique

| Composant | Technologie |
|-----------|-------------|
| App Mobile | React Native / Expo |
| Backend | FastAPI (Python) |
| Backoffice | React |
| Base de données | Firebase Firestore |
| Auth | Firebase Authentication |
| Push | Firebase Cloud Messaging |
| Paiements | Stripe |

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- Python 3.10+
- Expo CLI
- Firebase project configuré

### Installation

```bash
# Clone
git clone https://github.com/[repo]/FAMILYS-CLEAN.git
cd FAMILYS-CLEAN

# App Mobile
npm install

# Backend
cd backend
pip install -r requirements.txt

# Backoffice
cd ../admin
npm install
```

### Lancement

```bash
# Backend (port 8000)
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000

# Backoffice (port 3001)
cd admin
npm run dev

# App Mobile
npx expo start
```

## 📂 Structure

```
FAMILYS-CLEAN/
├── app/                    # Pages React Native (Expo Router)
├── components/             # Composants réutilisables
├── constants/              # Config (API URLs, Firebase)
├── stores/                 # État global (Zustand)
├── services/               # Appels API
├── backend/
│   ├── server.py           # Point d'entrée FastAPI
│   ├── routes/firebase/    # Routes API
│   └── config/             # Config Firebase Admin
└── admin/
    ├── src/pages/          # Pages admin
    └── src/components/     # Modaux et composants
```

## 🔥 API Routes

Base URL: `/api/v1/fb/`

| Route | Description |
|-------|-------------|
| `/settings` | Configuration restaurant |
| `/products` | Catalogue produits |
| `/categories` | Catégories menu |
| `/options` | Options personnalisation |
| `/orders` | Gestion commandes |
| `/customers` | Clients |
| `/promotions` | Promotions actives |
| `/notifications` | Notifications push |
| `/ai/chat` | Assistant IA |

## 🎁 Fonctionnalités

- ✅ Commande mobile avec options personnalisables
- ✅ 14 types de promotions (BOGO, réductions, happy hour...)
- ✅ Programme fidélité avec points
- ✅ Notifications push marketing
- ✅ Surprise du Jour (roue de la chance)
- ✅ Backoffice complet pour gestion
- ✅ Assistant IA pour améliorer les textes
- ✅ Impression tickets thermiques

## 🔐 Authentification Backoffice

- **Mode BackOffice** : PIN 1234
- **Mode Commandes** : PIN 1111
- **Mode Livraison** : PIN 2222

## 📱 Build iOS

```bash
# Incrémenter version
sed -i '' 's/"buildNumber": "X"/"buildNumber": "Y"/g' app.json

# Build + Submit TestFlight
eas build --platform ios --profile production --auto-submit
```

Bundle ID: `com.fayce.familysnew`

## 📝 Documentation

Voir [CLAUDE_CONTEXT.md](./CLAUDE_CONTEXT.md) pour le contexte complet de développement.

## 📄 License

Propriétaire - Le Family's Restaurant

---

*Développé pour Le Family's, Bourg-en-Bresse*

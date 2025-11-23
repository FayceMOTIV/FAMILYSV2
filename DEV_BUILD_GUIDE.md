# 📱 Guide Development Build iOS - Family's App

## 🎯 Pourquoi un Development Build ?

Expo Go ne supporte pas:
- Expo Router v3 avec certaines configurations
- Nativewind v4 (nécessite des modules natifs custom)
- Modules natifs personnalisés

**Solution**: Development Build = App custom avec tous vos modules natifs + hot reload Metro

## 🚀 Lancer le Build iOS

### 1. Vérifier EAS CLI

```bash
# Installer EAS CLI globalement (si pas déjà fait)
npm install -g eas-cli

# Se connecter à votre compte Expo
eas login
```

### 2. Configurer le projet

```bash
cd /app/mobile-new

# Configurer EAS (si première fois)
eas build:configure
```

### 3. Lancer le Development Build

```bash
# Build pour iOS (device physique)
eas build --profile development --platform ios

# OU utiliser le script npm
yarn build:dev:ios
```

**Note**: Le build prend environ 10-15 minutes sur les serveurs EAS.

## 📲 Installation sur iPhone

### Option 1: Via URL direct (recommandé)
1. Une fois le build terminé, EAS vous donne une URL
2. Ouvrez cette URL sur votre iPhone
3. Installez l'app (il faut accepter le certificat de développement)

### Option 2: Via TestFlight
1. Ajoutez votre Apple ID dans les paramètres EAS
2. Le build sera automatiquement envoyé sur TestFlight

## 🔥 Développement avec Metro Tunnel

### 1. Démarrer le serveur Metro avec Tunnel

```bash
cd /app/mobile-new

# Démarrer avec tunnel (recommandé pour connexion iPhone)
yarn start:tunnel

# OU
expo start --dev-client --tunnel
```

**Le tunnel Ngrok va automatiquement démarrer et créer une URL publique**

### 2. Connecter votre iPhone

1. Ouvrez l'app Development Build sur votre iPhone
2. L'app va automatiquement détecter le serveur Metro via le tunnel
3. Ou scannez le QR code affiché dans le terminal

### 3. Hot Reload Activé ✅

- Modification de code → Sauvegarde → L'app se recharge automatiquement
- Shake l'iPhone pour ouvrir le menu développeur
- Activer "Fast Refresh" dans les paramètres

## ⚙️ Configuration Actuelle

### eas.json
```json
{
  "build": {
    "development": {
      "developmentClient": true,     // ✅ Active le dev client
      "distribution": "internal",    // ✅ Installation directe
      "ios": {
        "simulator": false           // ✅ Build pour device réel
      }
    }
  }
}
```

### app.json
```json
{
  "expo": {
    "scheme": "familys",             // ✅ Deep linking
    "plugins": [
      "expo-router",
      "expo-build-properties"        // ✅ Config natifs
    ]
  }
}
```

## 🔧 Commandes Utiles

### Développement
```bash
# Metro avec tunnel (pour iPhone)
yarn start:tunnel

# Metro sans tunnel (même réseau WiFi)
yarn start

# Clear cache si problèmes
expo start --dev-client --clear
```

### Build & Test
```bash
# Development build iOS
yarn build:dev:ios

# Preview build (pour tester avant prod)
yarn build:preview:ios

# Voir l'état des builds
eas build:list
```

### Debug
```bash
# Voir les logs Metro
# Les logs s'affichent directement dans le terminal

# Voir les logs device
# Shake l'iPhone → "Show Element Inspector"

# Reload manuel
# Shake l'iPhone → "Reload"
```

## 🐛 Troubleshooting

### Le build échoue
```bash
# Vérifier les credentials Apple
eas credentials

# Rebuild propre
eas build --profile development --platform ios --clear-cache
```

### L'iPhone ne se connecte pas au Metro
1. **Vérifier le tunnel**: Le QR code doit montrer une URL `exp://...`
2. **Firewall**: Autoriser Expo dans votre firewall
3. **Redémarrer Metro**: Ctrl+C puis `yarn start:tunnel`

### Hot reload ne fonctionne pas
1. Shake l'iPhone
2. "Enable Fast Refresh"
3. "Reload"

### Erreur de certificat sur iPhone
1. iPhone → Réglages → Général → Gestion des profils
2. Approuver le certificat de développement

## 📊 Workflow Recommandé

### Premier Build (une fois)
```bash
cd /app/mobile-new
eas build --profile development --platform ios
# Attendre 10-15 min
# Installer l'app sur iPhone via URL fournie
```

### Développement Quotidien
```bash
# 1. Démarrer Metro avec tunnel
yarn start:tunnel

# 2. Ouvrir l'app sur iPhone
# L'app se connecte automatiquement

# 3. Coder normalement
# Sauvegarder → L'app se recharge automatiquement ✨
```

### Quand Rebuild ?
Vous devez refaire un build SEULEMENT si:
- ❌ Ajout de nouveaux modules natifs (ex: react-native-camera)
- ❌ Modification de app.json (plugins, permissions)
- ❌ Modification de package.json (nouvelles dépendances natives)

Vous N'AVEZ PAS besoin de rebuild pour:
- ✅ Modifications de code JS/JSX
- ✅ Modifications de styles
- ✅ Ajout de pages/composants
- ✅ Modifications de logique

## 🎯 Avantages du Development Build

✅ **Hot Reload**: Changements instantanés
✅ **Debugging**: Toutes les fonctionnalités natives
✅ **Performance**: Identique à la prod
✅ **Modules Custom**: Nativewind, Expo Router v3, etc.
✅ **Tunnel**: Pas besoin du même réseau WiFi

## 📱 API Backend

L'app pointe actuellement vers:
```
http://localhost:8001/api/v1
```

**Pour tester depuis iPhone**, le backend doit être accessible:

### Option 1: Ngrok Backend (recommandé)
```bash
# Dans un autre terminal
ngrok http 8001

# Copier l'URL https (ex: https://abc123.ngrok.io)
# Modifier /app/mobile-new/constants/api.js
export const API_BASE_URL = 'https://abc123.ngrok.io/api/v1';
```

### Option 2: Utiliser l'API de production
```javascript
// /app/mobile-new/constants/api.js
export const API_BASE_URL = 'https://api-overhaul-2.preview.emergentagent.com/api/v1';
```

## 🎉 Résultat Final

Une fois configuré:
1. **Build une fois** (~15 min) → Installer sur iPhone
2. **Développer normalement** → Metro Tunnel + Hot Reload
3. **Tester en temps réel** sur votre iPhone physique
4. **Zero friction** pour le développement quotidien

**Bonne dev! 🚀**

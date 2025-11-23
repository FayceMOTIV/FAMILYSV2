# 🚀 LANCER LE BUILD IOS MAINTENANT

## Étapes Rapides

### 1️⃣ Se connecter à Expo (une seule fois)

```bash
eas login
```

Entrez vos identifiants Expo (créez un compte sur expo.dev si besoin).

---

### 2️⃣ Lancer le Development Build iOS

```bash
cd /app/mobile-new

# Lancer le build
eas build --profile development --platform ios

# OU utiliser le script npm
yarn build:dev:ios
```

**Temps estimé**: 10-15 minutes

---

### 3️⃣ Pendant le build...

EAS va:
1. ✅ Upload votre code
2. ✅ Installer les dépendances
3. ✅ Compiler le code natif iOS
4. ✅ Créer l'IPA (fichier d'installation)
5. ✅ Vous donner une URL de téléchargement

Vous verrez la progression en temps réel dans le terminal.

---

### 4️⃣ Installer sur votre iPhone

Une fois le build terminé, vous recevrez:

```
✔ Build finished

📱 Install the build:
https://expo.dev/artifacts/eas/xxxxx.ipa

Or open this URL on your iPhone:
https://expo.dev/accounts/[votre-compte]/projects/familys-new/builds/xxxxx
```

**Sur votre iPhone**:
1. Ouvrez l'URL dans Safari
2. Appuyez sur "Install"
3. Allez dans Réglages → Général → Gestion des profils
4. Approuvez le certificat de développement
5. L'app "Family's" apparaît sur votre écran d'accueil ✨

---

### 5️⃣ Démarrer Metro avec Tunnel

```bash
cd /app/mobile-new

# Démarrer le serveur de développement
yarn start:tunnel

# OU utiliser le script
./start-dev.sh
```

Un QR code va apparaître dans votre terminal.

---

### 6️⃣ Connecter l'app

1. Ouvrez l'app "Family's" sur votre iPhone
2. Elle va automatiquement se connecter au serveur Metro via le tunnel
3. OU scannez le QR code si nécessaire

**C'est tout!** Vous pouvez maintenant développer et voir les changements en temps réel sur votre iPhone 🎉

---

## 🔥 Hot Reload Activé

Maintenant:
- ✅ Modifiez du code JS/JSX
- ✅ Sauvegardez le fichier
- ✅ L'app se recharge automatiquement sur votre iPhone
- ✅ Zero délai, développement ultra-rapide!

---

## 🐛 Si vous avez des problèmes

### Problème: "No Apple Devices registered"
```bash
# Enregistrer votre iPhone
eas device:create
# Suivez les instructions pour ajouter votre UDID
```

### Problème: Build échoue avec erreur de credentials
```bash
# Configurer les credentials Apple
eas credentials
# Choisissez iOS → Development → Laissez EAS gérer
```

### Problème: L'app ne se connecte pas au Metro
```bash
# Relancer avec clear cache
expo start --dev-client --tunnel --clear

# Vérifier que le tunnel est actif (vous devez voir exp://... dans l'URL)
```

---

## 📝 Informations Importantes

### Quand refaire un build?

**OUI - Rebuild nécessaire** si vous ajoutez:
- ❌ Nouveaux modules natifs (ex: camera, biometric)
- ❌ Nouveaux plugins dans app.json
- ❌ Changement de permissions iOS

**NON - Rebuild PAS nécessaire** pour:
- ✅ Modifications de code JavaScript/JSX
- ✅ Modifications de styles/UI
- ✅ Ajout de pages React
- ✅ Changements de logique métier
- ✅ 99% du développement quotidien!

### API Backend

Par défaut, l'app pointe vers `localhost:8001`.

**Pour tester depuis iPhone**, vous devez exposer votre backend:

#### Option 1: Ngrok (recommandé)
```bash
# Dans un terminal séparé
ngrok http 8001

# Copier l'URL https (ex: https://abc123.ngrok-free.app)
# Modifier /app/mobile-new/constants/api.js:
export const API_BASE_URL = 'https://abc123.ngrok-free.app/api/v1';
```

#### Option 2: API de préproduction
```javascript
// /app/mobile-new/constants/api.js
export const API_BASE_URL = 'https://api-overhaul-2.preview.emergentagent.com/api/v1';
```

**Après modification, sauvegardez → Hot reload fera le reste!**

---

## ✅ Checklist Complète

- [ ] `eas login` → Connecté à Expo
- [ ] `eas build --profile development --platform ios` → Build lancé
- [ ] Attendre 10-15 min → Build terminé
- [ ] Ouvrir URL sur iPhone → App installée
- [ ] Réglages → Approuver certificat → App autorisée
- [ ] `yarn start:tunnel` → Metro démarré
- [ ] Ouvrir app sur iPhone → Connecté à Metro
- [ ] Modifier du code → Hot reload fonctionne ✨

---

## 🎉 Vous êtes prêt!

Vous avez maintenant un environnement de développement professionnel:
- Development Build custom avec tous vos modules
- Metro Tunnel pour connexion à distance
- Hot Reload instantané
- Debugging complet
- Performance production

**Bon développement! 🚀**

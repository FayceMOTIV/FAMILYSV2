# 📱 GUIDE TESTFLIGHT - Family's App

## 🎯 Pour mettre l'app sur TestFlight, voici ce dont on a besoin :

### **ÉTAPE 1 : Compte Apple Developer** 💳
- Tu dois avoir un compte Apple Developer (99$/an)
- Va sur https://developer.apple.com
- Inscris-toi si ce n'est pas déjà fait

### **ÉTAPE 2 : Créer l'app sur App Store Connect** 🍎
1. Va sur https://appstoreconnect.apple.com
2. Clique sur "Mes Apps" → "+" → "Nouvelle App"
3. Remplis les infos :
   - **Nom** : Family's
   - **Langue principale** : Français
   - **Bundle ID** : com.familys.app (créé dans le compte Developer)
   - **SKU** : FAMILYS001 (identifiant unique)

### **ÉTAPE 3 : Obtenir les identifiants nécessaires** 🔑

Je vais avoir besoin de :
1. **Apple ID** : ton email Apple Developer
2. **ASC App ID** : L'ID de l'app dans App Store Connect (10 chiffres)
3. **Apple Team ID** : Dans Account → Membership (10 caractères)

### **ÉTAPE 4 : Créer un compte Expo** (GRATUIT) 🆓
1. Va sur https://expo.dev
2. Crée un compte gratuit
3. Obtiens ton token d'accès :
   - Va sur Account Settings → Access Tokens
   - Clique "Create Token"
   - Copie le token

---

## 🚀 CE QUE JE VAIS FAIRE ENSUITE :

Une fois que tu me donnes :
- ✅ Ton token Expo
- ✅ Ton Apple ID
- ✅ L'ASC App ID
- ✅ Le Team ID

**Je lance :**
```bash
export EXPO_TOKEN="ton-token"
cd /app/mobile-app
eas build --platform ios --profile production
eas submit --platform ios
```

**Résultat :**
- 🎉 Build créé (~10-15 minutes)
- 🎉 App soumise à TestFlight automatiquement
- 🎉 Tu reçois un email d'Apple
- 🎉 Tu peux inviter des testeurs dans TestFlight

---

## 💡 ALTERNATIVE RAPIDE (Sans TestFlight)

Si tu n'as pas de compte Developer, je peux créer un **build .ipa** que tu installes via :
1. **AltStore** (gratuit, pas besoin de compte Developer)
2. **Sideloadly** (gratuit)
3. **Xcode** (si tu as un Mac)

---

## 🎯 CHOISIS TON OPTION :

**A** - J'ai un compte Apple Developer → Donne-moi les infos ci-dessus
**B** - Pas de compte Developer → Je crée un .ipa pour AltStore/Sideloadly
**C** - Je vais créer un compte Developer maintenant → Attends 24h puis option A

**QUE VEUX-TU FAIRE ?**

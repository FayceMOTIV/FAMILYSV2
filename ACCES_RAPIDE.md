# ⚡ Accès Rapide - Family's

## 🌐 Admin Web (Back Office)

**URL Preview :**
```
https://react-reborn.preview.emergentagent.com:3002
```

**Identifiants :**
- Email : `admin@familys.app`
- Mot de passe : `Admin@123456`

**Status :**
```bash
sudo supervisorctl status admin
```

---

## 📱 App Mobile (iPhone)

**1. Installe Expo Go** (App Store)

**2. Lance le serveur :**
```bash
cd /app/mobile-app
npx expo start --tunnel
```

**3. Scanne le QR Code** avec l'appareil photo

---

## 🔧 Backend API

**URL :**
```
https://react-reborn.preview.emergentagent.com/api/v1
```

**Test rapide :**
```bash
curl https://react-reborn.preview.emergentagent.com/api/v1/products
```

**Status :**
```bash
sudo supervisorctl status backend
```

---

## 📊 Services Status

```bash
# Voir tous les services
sudo supervisorctl status

# Redémarrer tout
sudo supervisorctl restart all

# Logs backend
tail -f /var/log/supervisor/backend.out.log

# Logs admin
tail -f /var/log/supervisor/admin.out.log
```

---

## 🎯 Architecture

```
Backend (port 8001) ─┬─→ Admin Web (port 3002) ✅ Preview Web
                     └─→ Mobile App (Expo)     ✅ iPhone via Expo Go
```

---

## 📁 Fichiers Importants

- `/app/GUIDE_COMPLET.md` - Guide détaillé complet
- `/app/mobile-app/COMMENT_DEMARRER.md` - Instructions app mobile
- `/app/COMPLETE_IMPLEMENTATION_SUMMARY.md` - Résumé technique implémentation
- `/app/VERIFICATION_FONCTIONNALITES.md` - Liste fonctionnalités migrées

---

## ✅ Tout est Prêt !

1. **Admin Web** → Accessible immédiatement sur preview
2. **Mobile App** → Installe Expo Go + scanne QR code
3. **Backend** → Déjà actif et connecté

**Bonne utilisation ! 🚀**

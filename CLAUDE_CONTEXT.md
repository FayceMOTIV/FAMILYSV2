# FAMILYS-CLEAN - Contexte Claude

## Projet
- **App**: React Native/Expo (app mobile restaurant)
- **Backend**: FastAPI (Python) - **100% Firebase**
- **Backoffice**: React (admin panel)
- **Firebase Project**: family-2026 (eur3)
- **Bundle ID**: com.fayce.familysnew
- **GitHub**: https://github.com/FayceMOTIV/FAMILYSV2

## Serveurs
- Backend: `http://localhost:8000`
- Backoffice: `http://localhost:3002`
- IP locale: 192.168.1.185

## Authentification Backoffice (PIN)
| Mode | PIN | URL |
|------|-----|-----|
| Back Office | 1234 | /login |
| Mode Commandes | 1111 | /orders-mode-login |
| Mode Livraison | 2222 | /delivery-mode-login |

Page sélection: /select-mode

## Routes Firebase (/api/v1/fb/)
categories, products, options, choice-library, promotions, orders, customers, settings, popups, upload, surprise, dashboard, notifications, ai, app-settings

## Fonctionnalités
- Mode Commandes: ruptures 24H/indéfinie, pause, notifications auto
- Mode Livraison: responsive, paiement, GPS
- Notifications FCM auto sur changement statut
- Pause commandes visible dans app mobile

## Commandes
Backend: cd ~/Desktop/FAMILYS-CLEAN/backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload
Backoffice: cd ~/Desktop/FAMILYS-CLEAN/admin && npm run dev

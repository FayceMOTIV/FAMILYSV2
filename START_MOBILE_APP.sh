#!/bin/bash

echo "========================================="
echo "📱 LANCEMENT DE L'APP MOBILE FAMILY'S"
echo "========================================="
echo ""
echo "⏳ Démarrage du serveur Expo..."
echo ""

cd /app/mobile-app

# Tuer les instances existantes
pkill -f "expo start" 2>/dev/null
pkill -f "metro" 2>/dev/null

sleep 2

echo "🚀 Expo démarre... (attends 30-60 secondes)"
echo ""
echo "📸 INSTRUCTIONS:"
echo ""
echo "1. Installe 'Expo Go' sur ton iPhone (App Store, gratuit)"
echo "2. Attends que le QR code apparaisse ci-dessous"
echo "3. Ouvre l'app 'Appareil Photo' de ton iPhone"
echo "4. Scanne le QR code"
echo "5. Appuie sur la notification"
echo "6. L'app s'ouvre dans Expo Go !"
echo ""
echo "========================================="
echo ""

# Lancer Expo
npx expo start --tunnel

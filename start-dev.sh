#!/bin/bash

echo "🚀 Starting Family's Mobile App Development Server"
echo ""
echo "================================================"
echo "  Development Mode with Metro Tunnel"
echo "================================================"
echo ""
echo "📱 Instructions:"
echo "1. Install the Development Build on your iPhone first"
echo "   (run: yarn build:dev:ios or eas build --profile development --platform ios)"
echo ""
echo "2. Wait for the QR code to appear below"
echo ""
echo "3. Open the Family's Development app on your iPhone"
echo "   - It will automatically detect the tunnel"
echo "   - OR scan the QR code"
echo ""
echo "4. Enjoy hot reload! Your changes will appear instantly ⚡"
echo ""
echo "================================================"
echo ""

cd /app/mobile-new

# Start Metro with tunnel
expo start --dev-client --tunnel

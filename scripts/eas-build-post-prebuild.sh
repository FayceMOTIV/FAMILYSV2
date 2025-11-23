#!/bin/bash

# Script exécuté après le prebuild EAS pour patcher le Podfile
# Supprime la ligne :privacy_file_aggregation_enabled qui cause des erreurs

echo "🔧 Post-prebuild: Patching iOS Podfile..."

PODFILE="ios/Podfile"

if [ -f "$PODFILE" ]; then
  echo "📄 Found Podfile at: $PODFILE"
  
  # Supprimer la ligne contenant :privacy_file_aggregation_enabled
  sed -i.bak '/:privacy_file_aggregation_enabled/d' "$PODFILE"
  
  echo "✅ Podfile patched successfully!"
  echo "   Removed :privacy_file_aggregation_enabled parameter"
else
  echo "⚠️  Podfile not found at $PODFILE"
  exit 1
fi

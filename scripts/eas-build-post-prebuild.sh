#!/bin/bash

# Script exécuté après le prebuild EAS pour patcher le Podfile
# Supprime la ligne :privacy_file_aggregation_enabled qui cause des erreurs

echo "🔧 Post-prebuild: Patching iOS Podfile..."

PODFILE="ios/Podfile"

if [ -f "$PODFILE" ]; then
  echo "📄 Found Podfile at: $PODFILE"
  
  # Supprimer la ligne contenant :privacy_file_aggregation_enabled
  sed -i.bak '/:privacy_file_aggregation_enabled
cat > ~/Desktop/FAMILYS\ V3/mobile-new/eas.json << 'EOF'
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "resourceClass": "m-medium",
        "autoIncrement": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "postPrebuildCommand": "bash scripts/eas-build-post-prebuild.sh"
    },
    "production": {
      "ios": {
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {}
  }
}

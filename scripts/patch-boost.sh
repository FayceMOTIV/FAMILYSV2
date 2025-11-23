#!/bin/bash

# Script pour patcher boost.podspec avec un miroir stable
# Ce script est exécuté automatiquement après yarn install

BOOST_PODSPEC="node_modules/react-native/third-party-podspecs/boost.podspec"

if [ -f "$BOOST_PODSPEC" ]; then
  echo "🔧 Patching boost.podspec to use stable mirror..."
  
  # Remplacer l'URL JFrog par le miroir stable archives.boost.io
  sed -i.bak 's|https://boostorg.jfrog.io/artifactory/main/release/1.83.0/source/boost_1_83_0.tar.bz2|https://archives.boost.io/release/1.83.0/source/boost_1_83_0.tar.bz2|g' "$BOOST_PODSPEC"
  
  echo "✅ boost.podspec patched successfully!"
  echo "   Using mirror: https://archives.boost.io/release/1.83.0/source/boost_1_83_0.tar.bz2"
else
  echo "⚠️  boost.podspec not found, skipping patch"
fi

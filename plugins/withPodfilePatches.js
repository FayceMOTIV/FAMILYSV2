const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withPodfilePatches(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf-8');
        
        // Supprimer les lignes privacy_file_aggregation_enabled
        podfileContent = podfileContent.replace(
          /.*:privacy_file_aggregation_enabled.*\n?/g,
          ''
        );
        
        podfileContent = podfileContent.replace(
          /.*\['apple\.privacyManifestAggregationEnabled'\].*\n?/g,
          ''
        );
        
        // Ajouter use_modular_headers! après require_relative
        if (!podfileContent.includes('use_modular_headers!')) {
          podfileContent = podfileContent.replace(
            /(require_relative.*?\n)/,
            '$1\nuse_modular_headers!\n'
          );
        }
        
        fs.writeFileSync(podfilePath, podfileContent);
        console.log('✅ Podfile patched: removed privacy flags and added use_modular_headers!');
      }
      
      return config;
    },
  ]);
};

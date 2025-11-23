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
        
        // Supprimer la ligne complète contenant privacy_file_aggregation_enabled
        podfileContent = podfileContent.replace(
          /.*:privacy_file_aggregation_enabled.*\n?/g,
          ''
        );
        
        // Supprimer aussi la version avec crochets
        podfileContent = podfileContent.replace(
          /.*\['apple\.privacyManifestAggregationEnabled'\].*\n?/g,
          ''
        );
        
        fs.writeFileSync(podfilePath, podfileContent);
        console.log('✅ Podfile patched successfully');
      }
      
      return config;
    },
  ]);
};

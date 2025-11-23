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
        
        podfileContent = podfileContent.replace(
          /:privacy_file_aggregation_enabled\s*=>\s*\w+,?\s*\n?/g,
          ''
        );
        
        fs.writeFileSync(podfilePath, podfileContent);
        console.log('✅ Podfile patched: removed :privacy_file_aggregation_enabled');
      }
      
      return config;
    },
  ]);
};

const { withEntitlementsPlist } = require('@expo/config-plugins');

module.exports = function withRemoveAPSEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    // Supprimer l'entitlement aps-environment
    if (config.modResults['aps-environment']) {
      delete config.modResults['aps-environment'];
      console.log('✅ Removed aps-environment entitlement');
    }
    
    return config;
  });
};

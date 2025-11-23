const { withEntitlementsPlist } = require('@expo/config-plugins');

module.exports = function withRemoveAPSEntitlement(config) {
  return withEntitlementsPlist(config, (modConfig) => {
    const entitlements = modConfig.modResults;
    
    // Supprimer l'entitlement aps-environment
    if (entitlements['aps-environment']) {
      delete entitlements['aps-environment'];
      console.log('✅ Removed aps-environment entitlement');
    }
    
    return modConfig;
  });
};

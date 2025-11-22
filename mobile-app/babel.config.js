module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin', // PAS DE TABLEAU NI D'OPTIONS POUR ÉVITER LE CONFLIT
    ],
  };
};

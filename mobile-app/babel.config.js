module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // RETIREZ LA LIGNE 'react-native-reanimated/plugin' POUR VOIR SI C'EST LA CAUSE DE LA DUPLICATION
    ],
  };
};

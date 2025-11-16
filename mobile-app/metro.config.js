const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('web.js', 'web.jsx', 'web.ts', 'web.tsx');

module.exports = config;

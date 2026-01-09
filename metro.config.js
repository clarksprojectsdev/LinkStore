const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude expo-router from web builds to prevent htmlRoutes errors
if (process.env.EXPO_PUBLIC_PLATFORM === 'web' || process.env.PLATFORM === 'web') {
  config.resolver = {
    ...config.resolver,
    blockList: [
      ...(config.resolver?.blockList || []),
      /node_modules\/expo-router/,
    ],
  };
}

module.exports = config;

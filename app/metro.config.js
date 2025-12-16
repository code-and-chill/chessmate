// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const os = require('os');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure SVG transformer for chess piece assets
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  // Enable minification in production for smaller bundles
  minifierConfig: {
    mangle: {
      toplevel: true,
    },
    compress: {
      // Remove console.* in production (reduces bundle size)
      drop_console: process.env.NODE_ENV === 'production',
      // Remove debugger statements
      drop_debugger: true,
    },
  },
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  // Resolve platform-specific modules (helps with tree-shaking)
  resolverMainFields: ['react-native', 'browser', 'main'],
};

// Performance optimizations for bundling
// Calculate 50% of available CPUs as a number (Metro requires a number, not a string)
const cpuCount = os.cpus().length;
config.maxWorkers = process.env.CI ? 2 : Math.max(1, Math.floor(cpuCount * 0.5));
config.resetCache = false; // Don't reset cache by default (faster rebuilds)

module.exports = withNativeWind(config, { input: './global.css' });

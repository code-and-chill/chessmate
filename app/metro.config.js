// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Set the app root for Expo Router
process.env.EXPO_ROUTER_APP_ROOT = './app';

module.exports = config;

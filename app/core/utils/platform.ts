/**
 * Platform utilities for detecting environment
 */

/**
 * Check if code is running in a browser or React Native environment
 * (not in Node.js SSR)
 */
export const isClient = (): boolean => {
  if (typeof window !== 'undefined') {
    return true;
  }
  // React Native environment
  if (typeof global !== 'undefined' && global.navigator?.product === 'ReactNative') {
    return true;
  }
  return false;
};

/**
 * Check if code is running in a browser
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Check if code is running in React Native
 */
export const isReactNative = (): boolean => {
  return typeof global !== 'undefined' && global.navigator?.product === 'ReactNative';
};

/**
 * Check if code is running in Node.js (SSR)
 */
export const isServer = (): boolean => {
  return !isClient();
};

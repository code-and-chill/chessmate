/**
 * Safe Styles Utility
 * app/ui/utilities/safeStyles.ts
 * 
 * Handles conditional styles safely for React Native Web compatibility.
 * Filters out falsy values from style arrays to prevent runtime errors.
 */

import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;
type StyleInput = Style | false | undefined | null;

/**
 * Safely combines style objects and conditionals
 * 
 * Usage:
 *   style={safeStyles(baseStyle, condition && conditionalStyle, anotherStyle)}
 * 
 * Instead of:
 *   style={[baseStyle, condition && conditionalStyle]} // May cause issues on RN-Web
 */
export const safeStyles = (...styles: StyleInput[]): Style => {
  return Object.assign({}, ...styles.filter(Boolean) as Style[]);
};

/**
 * Safely combines style arrays
 * 
 * Usage:
 *   style={safeStyleArray([baseStyle, condition && conditionalStyle])}
 */
export const safeStyleArray = (styles: StyleInput[]): Style => {
  return safeStyles(...styles);
};

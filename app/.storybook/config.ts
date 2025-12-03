/**
 * Storybook Configuration Toggle
 * 
 * Storybook can be enabled in two ways:
 * 1. Run: pnpm start:storybook (recommended)
 * 2. Manually set ENABLE_STORYBOOK = true below
 * 
 * For production, this should always be false.
 */

export const ENABLE_STORYBOOK = __DEV__ && (
  process.env.STORYBOOK_ENABLED === '1' || false
);

/**
 * Usage:
 * 
 * Quick Start (Recommended):
 *   pnpm start:storybook   # Starts app with Storybook
 *   pnpm start             # Starts normal app
 * 
 * Manual Toggle:
 *   1. Change the "false" above to "true"
 *   2. Reload the app
 *   3. Change back to "false" to return to main app
 */

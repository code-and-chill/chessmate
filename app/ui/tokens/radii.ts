/**
 * Radius Tokens
 * app/ui/tokens/radii.ts
 * 
 * Scale: 4px (sm) | 8px (md) | 12px (lg)
 */

export const radiusTokens = {
  none: 0,
  sm: 4,     // Small elements (badges, tags)
  md: 8,     // Buttons, inputs
  lg: 12,    // Cards, panels
  xl: 16,    // Modals, drawers
  '2xl': 20, // Hero cards
  full: 9999, // Circular avatars
} as const;

/**
 * Semantic radius scale for consistent component styling
 */
export const radiusScale = {
  button: radiusTokens.md,      // 8px
  card: radiusTokens.lg,        // 12px
  modal: radiusTokens.lg,       // 12px
  panel: radiusTokens.lg,       // 12px
  badge: radiusTokens.sm,       // 4px
  tag: radiusTokens.sm,         // 4px
  input: radiusTokens.md,       // 8px
  avatar: radiusTokens.full,    // circular
  image: radiusTokens.md,       // 8px
} as const;

export type RadiusToken = typeof radiusTokens[keyof typeof radiusTokens];

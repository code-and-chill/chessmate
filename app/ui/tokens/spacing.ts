/**
 * Spacing Tokens
 * app/ui/tokens/spacing.ts
 * 
 * Scale: 4/8/12/16/24/32 (Production-grade spacing system)
 */

export const spacingTokens = {
  0: 0,
  1: 4,   // xs - tight spacing
  2: 8,   // sm - compact spacing
  3: 12,  // md - comfortable spacing
  4: 16,  // lg - relaxed spacing
  5: 24,  // xl - spacious
  6: 32,  // 2xl - very spacious
  7: 40,  // 3xl - generous
  8: 48,  // 4xl - large gaps
  9: 64,  // 5xl - section dividers
  10: 80, // 6xl - hero spacing
  12: 96, // 7xl - mega spacing
} as const;

/**
 * Semantic spacing scale for consistent component spacing
 */
export const spacingScale = {
  // Component internal spacing
  xs: spacingTokens[1],      // 4px - minimal internal padding
  sm: spacingTokens[2],      // 8px - compact spacing
  md: spacingTokens[3],      // 12px - default gap
  lg: spacingTokens[4],      // 16px - comfortable padding
  xl: spacingTokens[5],      // 24px - spacious
  xxl: spacingTokens[6],     // 32px - section padding
  
  // Common use cases
  gutter: spacingTokens[4],        // 16px - screen edge padding
  gap: spacingTokens[3],           // 12px - default gap between items
  cardPadding: spacingTokens[4],   // 16px - card internal padding
  sectionGap: spacingTokens[5],    // 24px - gap between sections
  
  // Component heights
  rowHeight: 56,
  buttonHeight: 44,
  inputHeight: 44,
  iconSize: 24,
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 48,

  // Semantic sizes for board preview (avoid local magic numbers)
  boardPreviewLarge: 400,
  boardPreviewSmall: 360,
  previewMinWidth: 300,
  // Layout width tokens
  previewContentMaxWidth: 480,
  settingsPanelMaxWidth: 500,
} as const;

/**
 * Semantic spacing groups for Gestalt proximity principles
 * Groups related elements with consistent spacing to establish visual relationships
 */
export const spacingGroups = {
  // Tight: Related elements that form a single unit (e.g., icon + label)
  tight: {
    gap: spacingTokens[1],      // 4px
    padding: spacingTokens[1],  // 4px
  },
  // Comfortable: Standard spacing for related items (e.g., list items)
  comfortable: {
    gap: spacingTokens[3],       // 12px
    padding: spacingTokens[4],   // 16px
  },
  // Spacious: Section-level spacing (e.g., between card sections)
  spacious: {
    gap: spacingTokens[5],       // 24px
    padding: spacingTokens[6],   // 32px
  },
  // Generous: Major section dividers (e.g., between page sections)
  generous: {
    gap: spacingTokens[7],       // 40px
    padding: spacingTokens[8],   // 48px
  },
} as const;

/**
 * Layout-specific spacing constants
 * Replaces hardcoded magic numbers with semantic tokens
 */
export const layoutSpacing = {
  // Player info height (compact display at board edges)
  playerInfoHeight: spacingTokens[6],      // 32px
  // Header bar height (compact header)
  headerBarHeight: spacingTokens[7],        // 40px
  // Board size constraints
  minBoardSize: 280,
  maxBoardSize: 800,
  // Badge internal padding
  badgePadding: spacingTokens[1] + spacingTokens[1], // 8px (4px + 4px)
} as const;

/**
 * Fitts' Law compliance: Minimum touch target sizes
 * iOS HIG: 44x44 points minimum
 * Material Design: 48x48 dp minimum
 * We use 44px as the minimum for cross-platform compatibility
 */
export const touchTargets = {
  minimum: 44,        // Minimum touch target size (iOS standard)
  comfortable: 48,    // Comfortable touch target (Material standard)
  icon: {
    small: 16,        // Icon visual size
    medium: 20,       // Icon visual size
    large: 24,        // Icon visual size
  },
  // Hit area expansion for small icons
  iconHitArea: 44,    // Minimum hit area for icon-only buttons
} as const;

export type SpacingToken = typeof spacingTokens[keyof typeof spacingTokens];
export type SpacingScale = typeof spacingScale[keyof typeof spacingScale];
export type SpacingGroup = keyof typeof spacingGroups;

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
  sm: spacingTokens[2],      // 8px - compact components
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
} as const;

export type SpacingToken = typeof spacingTokens[keyof typeof spacingTokens];
export type SpacingScale = typeof spacingScale[keyof typeof spacingScale];

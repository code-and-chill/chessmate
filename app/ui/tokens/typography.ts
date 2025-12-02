/**
 * Typography Tokens
 * app/ui/tokens/typography.ts
 * 
 * Hierarchy: Display → Title → Body → Caption
 */

export const typographyTokens = {
  fontFamily: {
    primary: 'Inter',
    mono: 'Monaco',
    display: 'Inter',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  fontWeight: {
    thin: '100' as const,
    extralight: '200' as const,
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

/**
 * Production-grade text variants following audit hierarchy:
 * Display (700, 28-32px) → Title (600, 20-24px) → Body (400, 14-16px) → Caption (400, 12-13px)
 */
export const textVariants = {
  // Display level - Hero text, page headers
  display: { 
    fontSize: 32, 
    fontWeight: '700' as const, 
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  displayLarge: { 
    fontSize: 28, 
    fontWeight: '700' as const, 
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  
  // Title level - Section headers, card titles
  title: { 
    fontSize: 24, 
    fontWeight: '600' as const, 
    lineHeight: 1.3 
  },
  titleMedium: { 
    fontSize: 20, 
    fontWeight: '600' as const, 
    lineHeight: 1.3 
  },
  titleSmall: { 
    fontSize: 18, 
    fontWeight: '600' as const, 
    lineHeight: 1.4 
  },
  
  // Body level - Primary content
  body: { 
    fontSize: 16, 
    fontWeight: '400' as const, 
    lineHeight: 1.5 
  },
  bodyMedium: { 
    fontSize: 14, 
    fontWeight: '400' as const, 
    lineHeight: 1.5 
  },
  
  // Caption level - Secondary content, metadata
  caption: { 
    fontSize: 13, 
    fontWeight: '400' as const, 
    lineHeight: 1.4 
  },
  captionSmall: { 
    fontSize: 12, 
    fontWeight: '400' as const, 
    lineHeight: 1.4 
  },
  
  // Utility variants
  label: { 
    fontSize: 14, 
    fontWeight: '600' as const, 
    lineHeight: 1.4 
  },
  hint: { 
    fontSize: 12, 
    fontWeight: '400' as const, 
    lineHeight: 1.4,
    letterSpacing: 0.3,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 1.2,
  },
} as const;

export type TextVariant = keyof typeof textVariants;

/**
 * Typography Tokens
 * app/ui/tokens/typography.ts
 * 
 * Hierarchy: Display → Title → Body → Caption
 */

/**
 * Premium Font Stack:
 * - Outfit: Display/Titles (geometric, modern, excellent for headings)
 * - Inter: Body text (perfect readability, OpenType features)
 * - JetBrains Mono: Code/Notation (clear, readable monospace)
 * 
 * Fallback: System fonts ensure graceful degradation
 */
export const typographyTokens = {
  fontFamily: {
    // Display & Headings - Geometric, modern aesthetic
    display: 'Outfit_700Bold',
    displayMedium: 'Outfit_600SemiBold',
    displayLight: 'Outfit_500Medium',
    
    // Body & UI - Exceptional readability
    primary: 'Inter_400Regular',
    primaryMedium: 'Inter_500Medium',
    primarySemiBold: 'Inter_600SemiBold',
    primaryBold: 'Inter_700Bold',
    
    // Code & Notation - Chess moves, technical content
    mono: 'JetBrainsMono_400Regular',
    monoMedium: 'JetBrainsMono_500Medium',
    monoBold: 'JetBrainsMono_700Bold',
    
    // Legacy/Fallback
    system: 'System',
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
  // Display level - Hero text, page headers (Outfit - geometric, modern)
  display: { 
    fontFamily: 'Outfit_700Bold',
    fontSize: 32, 
    fontWeight: '700' as const, 
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  displayLarge: { 
    fontFamily: 'Outfit_700Bold',
    fontSize: 28, 
    fontWeight: '700' as const, 
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },
  
  // Title level - Section headers, card titles (Outfit - modern hierarchy)
  title: { 
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 24, 
    fontWeight: '600' as const, 
    lineHeight: 1.3 
  },
  titleMedium: { 
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20, 
    fontWeight: '600' as const, 
    lineHeight: 1.3 
  },
  titleSmall: { 
    fontFamily: 'Outfit_500Medium',
    fontSize: 18, 
    fontWeight: '500' as const, 
    lineHeight: 1.4 
  },
  subheading: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 1.4,
  },

  // Body level - Primary content (Inter - optimal readability)
  body: { 
    fontFamily: 'Inter_400Regular',
    fontSize: 16, 
    fontWeight: '400' as const, 
    lineHeight: 1.5 
  },
  bodyMedium: { 
    fontFamily: 'Inter_400Regular',
    fontSize: 14, 
    fontWeight: '400' as const, 
    lineHeight: 1.5 
  },
  
  // Caption level - Secondary content, metadata (Inter)
  caption: { 
    fontFamily: 'Inter_400Regular',
    fontSize: 13, 
    fontWeight: '400' as const, 
    lineHeight: 1.4 
  },
  captionSmall: { 
    fontFamily: 'Inter_400Regular',
    fontSize: 12, 
    fontWeight: '400' as const, 
    lineHeight: 1.4 
  },
  
  // Utility variants
  label: { 
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14, 
    fontWeight: '600' as const, 
    lineHeight: 1.4 
  },
  hint: { 
    fontFamily: 'Inter_400Regular',
    fontSize: 12, 
    fontWeight: '400' as const, 
    lineHeight: 1.4,
    letterSpacing: 0.3,
  },
  button: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 1.2,
  },
} as const;

export type TextVariant = keyof typeof textVariants;

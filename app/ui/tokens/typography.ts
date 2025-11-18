/**
 * Typography Tokens
 * app/ui/tokens/typography.ts
 */

export const typographyTokens = {
  fontFamily: {
    primary: 'Inter',
    mono: 'Monaco',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
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
};

export const textVariants = {
  heading: { fontSize: 30, fontWeight: '700' as const, lineHeight: 1.2 },
  subheading: { fontSize: 20, fontWeight: '600' as const, lineHeight: 1.4 },
  title: { fontSize: 18, fontWeight: '600' as const, lineHeight: 1.4 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 1.5 },
  caption: { fontSize: 14, fontWeight: '400' as const, lineHeight: 1.5 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 1.4 },
  hint: { fontSize: 12, fontWeight: '400' as const, lineHeight: 1.4 },
};

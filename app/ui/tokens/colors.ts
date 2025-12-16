/**
 * Color Tokens – ShadCN-Inspired AI Aesthetic
 * app/ui/tokens/colors.ts
 */

export type ColorToken = {
  light: string;
  dark: string;
};

export const colorTokens = {
  neutral: {
    // Slate Palette (Cooler, Tech/AI Feel)
    50: { light: '#F8FAFC', dark: '#020617' } as ColorToken,
    100: { light: '#F1F5F9', dark: '#0F172A' } as ColorToken,
    200: { light: '#E2E8F0', dark: '#1E293B' } as ColorToken,
    300: { light: '#CBD5E1', dark: '#334155' } as ColorToken,
    400: { light: '#94A3B8', dark: '#475569' } as ColorToken,
    500: { light: '#64748B', dark: '#94A3B8' } as ColorToken,
    600: { light: '#475569', dark: '#CBD5E1' } as ColorToken,
    700: { light: '#334155', dark: '#E2E8F0' } as ColorToken,
    800: { light: '#1E293B', dark: '#F1F5F9' } as ColorToken,
    900: { light: '#0F172A', dark: '#F8FAFC' } as ColorToken,
  },
  blue: {
    50: { light: '#F0F9FF', dark: '#082F49' } as ColorToken,
    100: { light: '#E0F2FE', dark: '#0C4A6E' } as ColorToken,
    200: { light: '#BAE6FD', dark: '#075985' } as ColorToken,
    300: { light: '#7DD3FC', dark: '#0369A1' } as ColorToken,
    400: { light: '#38BDF8', dark: '#0284C7' } as ColorToken, // Sky Blue - More Electric
    500: { light: '#0EA5E9', dark: '#38BDF8' } as ColorToken,
    600: { light: '#0284C7', dark: '#7DD3FC' } as ColorToken,
    700: { light: '#0369A1', dark: '#BAE6FD' } as ColorToken,
    800: { light: '#075985', dark: '#E0F2FE' } as ColorToken,
    900: { light: '#0C4A6E', dark: '#F0F9FF' } as ColorToken,
  },
  purple: {
    50: { light: '#F5F3FF', dark: '#2E1065' } as ColorToken,
    100: { light: '#EDE9FE', dark: '#4C1D95' } as ColorToken,
    200: { light: '#DDD6FE', dark: '#5B21B6' } as ColorToken,
    300: { light: '#C4B5FD', dark: '#6D28D9' } as ColorToken,
    400: { light: '#A78BFA', dark: '#7C3AED' } as ColorToken, // Violet - More Neon
    500: { light: '#8B5CF6', dark: '#A78BFA' } as ColorToken,
    600: { light: '#7C3AED', dark: '#C4B5FD' } as ColorToken,
    700: { light: '#6D28D9', dark: '#DDD6FE' } as ColorToken,
    800: { light: '#5B21B6', dark: '#EDE9FE' } as ColorToken,
    900: { light: '#4C1D95', dark: '#F5F3FF' } as ColorToken,
  },
  green: {
    // Emerald (Slightly cooler green)
    50: { light: '#ECFDF5', dark: '#022C22' } as ColorToken,
    100: { light: '#D1FAE5', dark: '#064E3B' } as ColorToken,
    200: { light: '#A7F3D0', dark: '#065F46' } as ColorToken,
    300: { light: '#6EE7B7', dark: '#047857' } as ColorToken,
    400: { light: '#34D399', dark: '#059669' } as ColorToken,
    500: { light: '#10B981', dark: '#34D399' } as ColorToken,
    600: { light: '#059669', dark: '#6EE7B7' } as ColorToken,
    700: { light: '#047857', dark: '#A7F3D0' } as ColorToken,
    800: { light: '#065F46', dark: '#D1FAE5' } as ColorToken,
    900: { light: '#064E3B', dark: '#ECFDF5' } as ColorToken,
  },
  red: {
    50: { light: '#FEF2F2', dark: '#3D0F0F' } as ColorToken,
    100: { light: '#FEE2E2', dark: '#5A1A1A' } as ColorToken,
    200: { light: '#FEC2C2', dark: '#8B2C2C' } as ColorToken,
    300: { light: '#FCA5A5', dark: '#DC2626' } as ColorToken,
    400: { light: '#F87171', dark: '#EF4444' } as ColorToken,
    500: { light: '#EF4444', dark: '#F87171' } as ColorToken,
    600: { light: '#DC2626', dark: '#FCA5A5' } as ColorToken,
    700: { light: '#B91C1C', dark: '#F08080' } as ColorToken,
    800: { light: '#7F1D1D', dark: '#FF6B6B' } as ColorToken,
    900: { light: '#450A0A', dark: '#FFB5B5' } as ColorToken,
  },
  amber: {
    50: { light: '#FFFBEB', dark: '#3F2F0F' } as ColorToken,
    100: { light: '#FEF3C7', dark: '#5F4613' } as ColorToken,
    200: { light: '#FDE68A', dark: '#92640B' } as ColorToken,
    300: { light: '#FCD34D', dark: '#CAAD00' } as ColorToken,
    400: { light: '#FBBF24', dark: '#FBBF24' } as ColorToken,
    500: { light: '#F59E0B', dark: '#F59E0B' } as ColorToken,
    600: { light: '#D97706', dark: '#D97706' } as ColorToken,
    700: { light: '#B45309', dark: '#B45309' } as ColorToken,
    800: { light: '#92400E', dark: '#92400E' } as ColorToken,
    900: { light: '#6F3007', dark: '#6F3007' } as ColorToken,
  },
  cyan: {
    50: { light: '#F0F9FB', dark: '#0C2B33' } as ColorToken,
    100: { light: '#D8F3F5', dark: '#154754' } as ColorToken,
    200: { light: '#B0E6EA', dark: '#1E6B78' } as ColorToken,
    300: { light: '#88DADF', dark: '#2FA6B0' } as ColorToken,
    400: { light: '#60CDD4', dark: '#3DD6E0' } as ColorToken,
    500: { light: '#38BCC6', dark: '#48C6D4' } as ColorToken,
    600: { light: '#06B6D4', dark: '#06B6D4' } as ColorToken,
    700: { light: '#0891B2', dark: '#0891B2' } as ColorToken,
    800: { light: '#0E7490', dark: '#0E7490' } as ColorToken,
    900: { light: '#164E63', dark: '#164E63' } as ColorToken,
  },
  orange: {
    50: { light: '#FFF7ED', dark: '#2A1208' } as ColorToken,
    100: { light: '#FFEDD5', dark: '#4A2410' } as ColorToken,
    200: { light: '#FED7AA', dark: '#7A3A15' } as ColorToken,
    300: { light: '#FDBA74', dark: '#C05621' } as ColorToken,
    400: { light: '#FB923C', dark: '#F97316' } as ColorToken,
    500: { light: '#F97316', dark: '#FB923C' } as ColorToken,
    600: { light: '#EA580C', dark: '#FB923C' } as ColorToken,
    700: { light: '#C2410C', dark: '#F97316' } as ColorToken,
    800: { light: '#9A3412', dark: '#EA580C' } as ColorToken,
    900: { light: '#7C2D12', dark: '#FFEDD5' } as ColorToken,
  },
};

export const getColor = (token: ColorToken | string, isDark: boolean): string => {
  if (typeof token === 'string') return token;
  return isDark ? token.dark : token.light;
};
export const semanticColors = (isDark: boolean) => ({
  background: {
    primary: getColor(colorTokens.neutral[50], isDark),
    secondary: getColor(colorTokens.neutral[100], isDark),
    tertiary: getColor(colorTokens.neutral[200], isDark),
    card: getColor(colorTokens.neutral[100], isDark),
    elevated: getColor(colorTokens.neutral[200], isDark),
    accentSubtle: isDark ? getColor(colorTokens.blue[100], isDark) : getColor(colorTokens.blue[50], isDark),
  },
  foreground: {
    primary: getColor(colorTokens.neutral[900], isDark),
    secondary: getColor(colorTokens.neutral[700], isDark),
    tertiary: getColor(colorTokens.neutral[600], isDark),
    muted: getColor(colorTokens.neutral[500], isDark),
    onAccent: isDark ? getColor(colorTokens.neutral[50], isDark) : '#FFFFFF',
  },
  accent: {
    primary: isDark ? getColor(colorTokens.blue[400], isDark) : getColor(colorTokens.blue[600], isDark), // Sky Blue in dark mode
    secondary: isDark ? getColor(colorTokens.purple[400], isDark) : getColor(colorTokens.purple[600], isDark), // Violet in dark mode
  },
  accentForeground: {
    primary: getColor(colorTokens.neutral[50], isDark),
    secondary: getColor(colorTokens.neutral[50], isDark),
  },
  success: getColor(colorTokens.green[600], isDark),
  error: getColor(colorTokens.red[600], isDark),
  warning: getColor(colorTokens.amber[500], isDark),
  info: getColor(colorTokens.cyan[600], isDark),
  interactive: {
    default: isDark ? getColor(colorTokens.blue[500], isDark) : getColor(colorTokens.blue[600], isDark),
    hover: isDark ? getColor(colorTokens.blue[400], isDark) : getColor(colorTokens.blue[700], isDark),
    active: isDark ? getColor(colorTokens.blue[300], isDark) : getColor(colorTokens.blue[800], isDark),
    disabled: getColor(colorTokens.neutral[300], isDark),
  },
  button: {
    shadow: isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(102, 126, 234, 0.25)', // More vibrant blue shadow
  },
  translucent: {
    light: isDark ? 'rgba(2, 6, 23, 0.7)' : 'rgba(255, 255, 255, 0.8)', // Slate 950 base
    medium: isDark ? 'rgba(2, 6, 23, 0.5)' : 'rgba(255, 255, 255, 0.6)',
    dark: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  },
  overlay: isDark ? 'rgba(2, 6, 23, 0.85)' : 'rgba(0, 0, 0, 0.7)', // Slate 950 base
  border: getColor(colorTokens.neutral[300], isDark),
});

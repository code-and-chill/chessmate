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
    50: { light: '#FAFAFA', dark: '#0A0A0A' } as ColorToken,
    100: { light: '#F3F3F3', dark: '#161616' } as ColorToken,
    200: { light: '#E8E8E8', dark: '#262626' } as ColorToken,
    300: { light: '#D4D4D4', dark: '#404040' } as ColorToken,
    400: { light: '#A1A1A1', dark: '#7C7C7C' } as ColorToken,
    500: { light: '#737373', dark: '#A3A3A3' } as ColorToken,
    600: { light: '#525252', dark: '#D4D4D4' } as ColorToken,
    700: { light: '#404040', dark: '#E4E4E7' } as ColorToken,
    800: { light: '#262626', dark: '#F4F4F5' } as ColorToken,
    900: { light: '#171717', dark: '#FAFAFA' } as ColorToken,
  },
  blue: {
    50: { light: '#F0F9FF', dark: '#0C1929' } as ColorToken,
    100: { light: '#E1F4FE', dark: '#132748' } as ColorToken,
    200: { light: '#B3E5FC', dark: '#1E5A8E' } as ColorToken,
    300: { light: '#81D4FA', dark: '#2896D3' } as ColorToken,
    400: { light: '#4FC3F7', dark: '#3A82F7' } as ColorToken,
    500: { light: '#29B6F6', dark: '#60A5FA' } as ColorToken,
    600: { light: '#03A9F4', dark: '#3B82F6' } as ColorToken,
    700: { light: '#0288D1', dark: '#1D4ED8' } as ColorToken,
    800: { light: '#0277BD', dark: '#1E40AF' } as ColorToken,
    900: { light: '#01579B', dark: '#1E3A8A' } as ColorToken,
  },
  purple: {
    50: { light: '#F5F3FF', dark: '#2D1B4E' } as ColorToken,
    100: { light: '#EDE9FE', dark: '#3D1F5C' } as ColorToken,
    200: { light: '#DDD6FE', dark: '#5E2FB5' } as ColorToken,
    300: { light: '#C4B5FD', dark: '#7C3AED' } as ColorToken,
    400: { light: '#A78BFA', dark: '#8B5CF6' } as ColorToken,
    500: { light: '#8B5CF6', dark: '#A78BFA' } as ColorToken,
    600: { light: '#7C3AED', dark: '#9333EA' } as ColorToken,
    700: { light: '#6D28D9', dark: '#7E22CE' } as ColorToken,
    800: { light: '#5B21B6', dark: '#6B21A8' } as ColorToken,
    900: { light: '#3F0F5C', dark: '#4C0519' } as ColorToken,
  },
  green: {
    50: { light: '#F0FDF4', dark: '#0C2612' } as ColorToken,
    100: { light: '#DCFCE7', dark: '#162E1B' } as ColorToken,
    200: { light: '#BBF7D0', dark: '#236B3E' } as ColorToken,
    300: { light: '#86EFAC', dark: '#34A853' } as ColorToken,
    400: { light: '#4ADE80', dark: '#52CC6D' } as ColorToken,
    500: { light: '#22C55E', dark: '#5FDD8E' } as ColorToken,
    600: { light: '#16A34A', dark: '#34D399' } as ColorToken,
    700: { light: '#15803D', dark: '#10B981' } as ColorToken,
    800: { light: '#166534', dark: '#059669' } as ColorToken,
    900: { light: '#0B4F1C', dark: '#047857' } as ColorToken,
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
    primary: isDark ? getColor(colorTokens.blue[500], isDark) : getColor(colorTokens.blue[600], isDark),
    secondary: isDark ? getColor(colorTokens.purple[500], isDark) : getColor(colorTokens.purple[600], isDark),
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
    shadow: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(102, 126, 234, 0.25)',
  },
  translucent: {
    light: isDark ? 'rgba(15, 15, 15, 0.7)' : 'rgba(255, 255, 255, 0.8)',
    medium: isDark ? 'rgba(15, 15, 15, 0.5)' : 'rgba(255, 255, 255, 0.6)',
    dark: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
  },
  overlay: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
  border: getColor(colorTokens.neutral[300], isDark),
});

import { createContext, useContext } from 'react';
import { semanticColors, type ColorPalette } from '../tokens/colors';
import type { typographyTokens } from '../tokens/typography';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
  colors: ReturnType<typeof semanticColors>;
  typography: typeof typographyTokens;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeTokens = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeTokens must be used within ThemeProvider');
  }
  return context;
};

export const useColors = () => {
  const context = useContext(ThemeContext);
  if (context && context.colors) return context.colors;
  return semanticColors(false, 'orange');
};

export const useIsDark = () => {
  const { isDark } = useThemeTokens();
  return isDark;
};

export const useTypography = () => {
  const { typography } = useThemeTokens();
  return typography;
};

export const useFonts = () => {
  const { typography } = useThemeTokens();
  return typography.fontFamily;
};

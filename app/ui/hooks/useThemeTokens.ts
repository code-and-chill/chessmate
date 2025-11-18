/**
 * useThemeTokens Hook
 * app/ui/hooks/useThemeTokens.ts
 */

import { createContext, useContext } from 'react';
import type { semanticColors } from '../tokens/colors';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type ThemeContextType = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  colors: ReturnType<typeof semanticColors>;
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
  const { colors } = useThemeTokens();
  return colors;
};

export const useIsDark = () => {
  const { isDark } = useThemeTokens();
  return isDark;
};

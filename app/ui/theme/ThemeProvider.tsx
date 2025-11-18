/**
 * ThemeProvider Component
 * app/ui/theme/ThemeProvider.tsx
 */

import { useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from '../hooks/useThemeTokens';
import type { ThemeMode } from '../hooks/useThemeTokens';
import { semanticColors } from '../tokens/colors';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'auto',
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(defaultMode);

  const isDark = useMemo(() => {
    if (mode === 'auto') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const colors = useMemo(() => semanticColors(isDark), [isDark]);

  const value = {
    mode,
    isDark,
    setMode,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';

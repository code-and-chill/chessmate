import React, {useEffect, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';
import {ThemeContext, ThemeMode} from '../hooks/useThemeTokens';
import {semanticColors} from '../tokens/colors';
import {typographyTokens} from '../tokens/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'themeMode';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'auto',
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);

  useEffect(() => {
    // load persisted mode if available
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'auto') {
          setModeState(stored as ThemeMode);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // ignore
      }
    })();
  }, [mode]);

  const setMode = (m: ThemeMode) => setModeState(m);

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
    typography: typographyTokens,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';

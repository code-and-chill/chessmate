import React, {useEffect, useMemo, useState} from 'react';
import {useColorScheme} from 'react-native';
import {ThemeContext, ThemeMode} from '../hooks/useThemeTokens';
import {semanticColors, type ColorPalette} from '../tokens/colors';
import {typographyTokens} from '../tokens/typography';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {isClient} from '@/core/utils/platform';

const STORAGE_KEY = 'themeMode';
const PALETTE_STORAGE_KEY = 'themePalette';

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
  const [palette, setPaletteState] = useState<ColorPalette>('orange');

  useEffect(() => {
    // load persisted mode and palette if available (only on client-side)
    if (!isClient()) return;
    
    (async () => {
      try {
        const storedMode = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedMode === 'light' || storedMode === 'dark' || storedMode === 'auto') {
          setModeState(storedMode as ThemeMode);
        }
        const storedPalette = await AsyncStorage.getItem(PALETTE_STORAGE_KEY);
        if (storedPalette === 'blue' || storedPalette === 'orange' || storedPalette === 'purple') {
          setPaletteState(storedPalette as ColorPalette);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!isClient()) return;
    
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // ignore
      }
    })();
  }, [mode]);

  useEffect(() => {
    if (!isClient()) return;
    
    (async () => {
      try {
        await AsyncStorage.setItem(PALETTE_STORAGE_KEY, palette);
      } catch {
        // ignore
      }
    })();
  }, [palette]);

  const setMode = (m: ThemeMode) => setModeState(m);
  const setPalette = (p: ColorPalette) => setPaletteState(p);

  const isDark = useMemo(() => {
    if (mode === 'auto') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const colors = useMemo(() => semanticColors(isDark, palette), [isDark, palette]);

  const value = {
    mode,
    isDark,
    setMode,
    palette,
    setPalette,
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

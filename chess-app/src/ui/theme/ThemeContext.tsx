import React, { createContext, useState, useCallback, useMemo } from 'react';
import { BoardTheme, ThemeColors, ThemeMode, lightColors, darkColors, applyBoardTheme } from '../tokens/themes';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  boardTheme: BoardTheme;
  setBoardTheme: (theme: BoardTheme) => void;
  colors: ThemeColors;
  customColors?: Partial<ThemeColors>;
  setCustomColors: (colors: Partial<ThemeColors>) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  defaultMode?: ThemeMode;
  defaultBoardTheme?: BoardTheme;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  defaultMode = 'light',
  defaultBoardTheme = 'green',
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [boardTheme, setBoardTheme] = useState<BoardTheme>(defaultBoardTheme);
  const [customColors, setCustomColors] = useState<Partial<ThemeColors> | undefined>();

  const colors = useMemo(() => {
    const baseColors = mode === 'light' ? lightColors : darkColors;
    const withBoardTheme = applyBoardTheme(baseColors, boardTheme);
    return customColors ? { ...withBoardTheme, ...customColors } : withBoardTheme;
  }, [mode, boardTheme, customColors]);

  const value: ThemeContextValue = {
    mode,
    setMode,
    boardTheme,
    setBoardTheme,
    colors,
    customColors,
    setCustomColors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Board Theme Context
 * app/contexts/BoardThemeContext.tsx
 * 
 * Manages board theme selection with AsyncStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BoardTheme,
  ThemeMode,
  PieceTheme,
  getBoardColors,
  defaultThemeConfig,
  BoardColors,
} from '@/features/board/config/themeConfig';

const STORAGE_KEY = '@chessmate:board_theme';

type BoardThemeContextType = {
  mode: ThemeMode;
  boardTheme: BoardTheme;
  pieceTheme: PieceTheme;
  setMode: (mode: ThemeMode) => void;
  setBoardTheme: (theme: BoardTheme) => void;
  setPieceTheme: (theme: PieceTheme) => void;
  getBoardColors: () => BoardColors;
  isLoading: boolean;
};

const BoardThemeContext = createContext<BoardThemeContextType | undefined>(undefined);

interface BoardThemeProviderProps {
  children: ReactNode;
}

export const BoardThemeProvider: React.FC<BoardThemeProviderProps> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(defaultThemeConfig.mode);
  const [boardTheme, setBoardThemeState] = useState<BoardTheme>(defaultThemeConfig.boardTheme);
  const [pieceTheme, setPieceThemeState] = useState<PieceTheme>(defaultThemeConfig.pieceTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  const loadThemeFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        setModeState(config.mode || defaultThemeConfig.mode);
        setBoardThemeState(config.boardTheme || defaultThemeConfig.boardTheme);
        setPieceThemeState(config.pieceTheme || defaultThemeConfig.pieceTheme);
      }
    } catch (error) {
      console.error('Failed to load board theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemeToStorage = async (config: { mode: ThemeMode; boardTheme: BoardTheme; pieceTheme: PieceTheme }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save board theme:', error);
    }
  };

  const setMode = (newMode: ThemeMode) => {
    console.log('Setting mode:', newMode);
    setModeState(newMode);
    saveThemeToStorage({ mode: newMode, boardTheme, pieceTheme });
  };

  const setBoardTheme = (newTheme: BoardTheme) => {
    console.log('Setting board theme:', newTheme);
    setBoardThemeState(newTheme);
    saveThemeToStorage({ mode, boardTheme: newTheme, pieceTheme });
  };

  const setPieceTheme = (newTheme: PieceTheme) => {
    console.log('Setting piece theme:', newTheme);
    setPieceThemeState(newTheme);
    saveThemeToStorage({ mode, boardTheme, pieceTheme: newTheme });
  };

  const getColors = () => getBoardColors(boardTheme, mode);

  return (
    <BoardThemeContext.Provider
      value={{
        mode,
        boardTheme,
        pieceTheme,
        setMode,
        setBoardTheme,
        setPieceTheme,
        getBoardColors: getColors,
        isLoading,
      }}
    >
      {children}
    </BoardThemeContext.Provider>
  );
};

export const useBoardTheme = (): BoardThemeContextType => {
  const context = useContext(BoardThemeContext);
  if (context === undefined) {
    throw new Error('useBoardTheme must be used within a BoardThemeProvider');
  }
  return context;
};

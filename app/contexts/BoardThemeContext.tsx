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
    let mounted = true;
    
    const loadThemeFromStorage = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && mounted) {
          const config = JSON.parse(stored);
          setModeState(config.mode || defaultThemeConfig.mode);
          setBoardThemeState(config.boardTheme || defaultThemeConfig.boardTheme);
          setPieceThemeState(config.pieceTheme || defaultThemeConfig.pieceTheme);
        }
      } catch (error) {
        console.error('Failed to load board theme:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadThemeFromStorage();
    
    return () => {
      mounted = false;
    };
  }, []);

  const saveThemeToStorage = async (config: { mode: ThemeMode; boardTheme: BoardTheme; pieceTheme: PieceTheme }) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save board theme:', error);
    }
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    saveThemeToStorage({ mode: newMode, boardTheme, pieceTheme });
  };

  const setBoardTheme = (newTheme: BoardTheme) => {
    setBoardThemeState(newTheme);
    saveThemeToStorage({ mode, boardTheme: newTheme, pieceTheme });
  };

  const setPieceTheme = (newTheme: PieceTheme) => {
    setPieceThemeState(newTheme);
    saveThemeToStorage({ mode, boardTheme, pieceTheme: newTheme });
  };

  const getColors = () => {
    const safeBoardTheme = boardTheme || defaultThemeConfig.boardTheme;
    const safeMode = mode || defaultThemeConfig.mode;
    return getBoardColors(safeBoardTheme, safeMode);
  };

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

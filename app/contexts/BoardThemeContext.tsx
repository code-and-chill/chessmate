import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BoardTheme,
  getBoardColors,
  defaultThemeConfig,
  BoardColors,
} from '@/features/board/config/themeConfig';
import type { PieceTheme } from '@/features/board/types/pieces';

const STORAGE_KEY = '@chessmate:board_theme';

type BoardThemeContextType = {
  boardTheme: BoardTheme;
  pieceTheme: PieceTheme;
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
  const [boardTheme, setBoardThemeState] = useState<BoardTheme>(defaultThemeConfig.boardTheme as BoardTheme);
  const [pieceTheme, setPieceThemeState] = useState<PieceTheme>(defaultThemeConfig.pieceTheme as PieceTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    // Only load from storage on client-side (not during SSR)
    if (typeof window === 'undefined' && !(typeof global !== 'undefined' && global.navigator?.product === 'ReactNative')) {
      setIsLoading(false);
      return;
    }
    
    let mounted = true;
    
    const loadThemeFromStorage = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && mounted) {
          const config = JSON.parse(stored);
          setBoardThemeState((config.boardTheme as BoardTheme) || (defaultThemeConfig.boardTheme as BoardTheme));
          setPieceThemeState((config.pieceTheme as PieceTheme) || (defaultThemeConfig.pieceTheme as PieceTheme));
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

  const saveThemeToStorage = async (config: { boardTheme: BoardTheme; pieceTheme: PieceTheme }) => {
    // Only save to storage on client-side (not during SSR)
    if (typeof window === 'undefined' && !(typeof global !== 'undefined' && global.navigator?.product === 'ReactNative')) {
      return;
    }
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save board theme:', error);
    }
  };

  const setBoardTheme = (newTheme: BoardTheme) => {
    setBoardThemeState(newTheme);
    saveThemeToStorage({ boardTheme: newTheme, pieceTheme });
  };

  const setPieceTheme = (newTheme: PieceTheme) => {
    setPieceThemeState(newTheme);
    saveThemeToStorage({ boardTheme, pieceTheme: newTheme });
  };

  const getColors = () => {
    const safeBoardTheme = boardTheme || defaultThemeConfig.boardTheme;
    return getBoardColors(safeBoardTheme);
  };

  return (
    <BoardThemeContext.Provider
      value={{
        boardTheme,
        pieceTheme,
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

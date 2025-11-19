/**
 * Board Theme Context
 * app/contexts/BoardThemeContext.tsx
 * 
 * Manages board theme selection with localStorage persistence (web) or in-memory (native)
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { getBoardTheme, defaultTheme, type BoardTheme, type BoardThemeId } from '@/ui/tokens/board-themes';

const BOARD_THEME_STORAGE_KEY = 'chessmate_board_theme';

interface BoardThemeContextType {
  theme: BoardTheme;
  themeId: BoardThemeId;
  setTheme: (themeId: BoardThemeId) => Promise<void>;
  isLoading: boolean;
}

const BoardThemeContext = createContext<BoardThemeContextType | undefined>(undefined);

interface BoardThemeProviderProps {
  children: ReactNode;
}

export const BoardThemeProvider: React.FC<BoardThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeId] = useState<BoardThemeId>('classic');
  const [theme, setTheme] = useState<BoardTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        let storedThemeId: string | null = null;
        
        if (Platform.OS === 'web') {
          storedThemeId = localStorage.getItem(BOARD_THEME_STORAGE_KEY);
        }
        // For native, we'll use in-memory for now (can be upgraded to AsyncStorage later)
        
        if (storedThemeId) {
          const loadedTheme = getBoardTheme(storedThemeId as BoardThemeId);
          setThemeId(storedThemeId as BoardThemeId);
          setTheme(loadedTheme);
        }
      } catch (error) {
        console.error('Failed to load board theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const handleSetTheme = async (newThemeId: BoardThemeId) => {
    try {
      const newTheme = getBoardTheme(newThemeId);
      setThemeId(newThemeId);
      setTheme(newTheme);
      
      if (Platform.OS === 'web') {
        localStorage.setItem(BOARD_THEME_STORAGE_KEY, newThemeId);
      }
      // For native, theme persists in memory only (can be upgraded to AsyncStorage later)
    } catch (error) {
      console.error('Failed to save board theme:', error);
    }
  };

  return (
    <BoardThemeContext.Provider
      value={{
        theme,
        themeId,
        setTheme: handleSetTheme,
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

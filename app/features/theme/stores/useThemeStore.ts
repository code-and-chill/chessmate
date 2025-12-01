/**
 * Theme Zustand Store
 * app/features/theme/stores/useThemeStore.ts
 * 
 * Global theme state management with persistence
 * Manages board themes, piece themes, backgrounds, and presets
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import type { ThemeState, ChessTheme, BoardTheme, PieceTheme, BackgroundTheme, PresetTheme } from '../domain/models';

// Import registries (will be created next)
import { boardThemes, defaultBoardTheme } from '../registry/boards';
import { pieceThemes, defaultPieceTheme } from '../registry/pieces';
import { backgroundThemes, defaultBackgroundTheme } from '../registry/backgrounds';
import { presetThemes, defaultPreset } from '../registry/presets';

const THEME_STORAGE_KEY = 'chessmate_theme_v1';

/**
 * Create default chess theme
 */
const createDefaultTheme = (): ChessTheme => ({
  board: defaultBoardTheme,
  pieces: defaultPieceTheme,
  background: defaultBackgroundTheme,
  preset: defaultPreset,
});

/**
 * Find theme by ID from registry
 */
const findBoardTheme = (id: string): BoardTheme => 
  boardThemes.find(t => t.id === id) || defaultBoardTheme;

const findPieceTheme = (id: string): PieceTheme => 
  pieceThemes.find(t => t.id === id) || defaultPieceTheme;

const findBackgroundTheme = (id: string): BackgroundTheme => 
  backgroundThemes.find(t => t.id === id) || defaultBackgroundTheme;

const findPreset = (id: string): PresetTheme | undefined => 
  presetThemes.find(p => p.id === id);

/**
 * Theme Store
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTheme: createDefaultTheme(),
      activePresetId: defaultPreset?.id || null,
      
      // Available themes from registries
      availableBoards: boardThemes,
      availablePieces: pieceThemes,
      availableBackgrounds: backgroundThemes,
      availablePresets: presetThemes,
      
      // Actions
      
      /**
       * Set theme from a preset
       */
      setPreset: (presetId: string) => {
        const preset = findPreset(presetId);
        if (!preset) {
          console.warn(`Preset "${presetId}" not found`);
          return;
        }
        
        const board = findBoardTheme(preset.boardThemeId);
        const pieces = findPieceTheme(preset.pieceThemeId);
        const background = findBackgroundTheme(preset.backgroundThemeId);
        
        set({
          activeTheme: { board, pieces, background, preset },
          activePresetId: presetId,
        });
      },
      
      /**
       * Set board theme only (breaks preset)
       */
      setBoardTheme: (boardTheme: BoardTheme) => {
        const current = get().activeTheme;
        set({
          activeTheme: {
            ...current,
            board: boardTheme,
            preset: undefined, // Custom theme breaks preset
          },
          activePresetId: null,
        });
      },
      
      /**
       * Set piece theme only (breaks preset)
       */
      setPieceTheme: (pieceTheme: PieceTheme) => {
        const current = get().activeTheme;
        set({
          activeTheme: {
            ...current,
            pieces: pieceTheme,
            preset: undefined,
          },
          activePresetId: null,
        });
      },
      
      /**
       * Set background theme only (breaks preset)
       */
      setBackgroundTheme: (backgroundTheme: BackgroundTheme) => {
        const current = get().activeTheme;
        set({
          activeTheme: {
            ...current,
            background: backgroundTheme,
            preset: undefined,
          },
          activePresetId: null,
        });
      },
      
      /**
       * Set custom theme (partial update)
       */
      setCustomTheme: (theme: Partial<ChessTheme>) => {
        const current = get().activeTheme;
        set({
          activeTheme: {
            ...current,
            ...theme,
            preset: undefined,
          },
          activePresetId: null,
        });
      },
      
      /**
       * Reset to default theme
       */
      resetToDefault: () => {
        set({
          activeTheme: createDefaultTheme(),
          activePresetId: defaultPreset?.id || null,
        });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => {
        // Use localStorage for web
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          return window.localStorage;
        }
        
        // Use AsyncStorage for native (React Native)
        // Note: AsyncStorage must be imported dynamically to avoid web bundling issues
        if (Platform.OS !== 'web') {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          return AsyncStorage;
        }
        
        // Fallback in-memory storage (shouldn't happen)
        return {
          getItem: () => Promise.resolve(null),
          setItem: () => Promise.resolve(),
          removeItem: () => Promise.resolve(),
        };
      }),
      
      // Only persist theme configuration, not the full registry
      partialize: (state) => ({
        activeTheme: {
          board: { id: state.activeTheme.board.id },
          pieces: { id: state.activeTheme.pieces.id },
          background: { id: state.activeTheme.background.id },
          preset: state.activeTheme.preset ? { id: state.activeTheme.preset.id } : undefined,
        },
        activePresetId: state.activePresetId,
      }),
      
      // Hydrate full themes from IDs after loading from storage
      onRehydrateStorage: () => (state) => {
        if (state) {
          const boardId = (state.activeTheme.board as any).id;
          const piecesId = (state.activeTheme.pieces as any).id;
          const backgroundId = (state.activeTheme.background as any).id;
          const presetId = state.activePresetId;
          
          if (presetId) {
            // Restore from preset
            state.setPreset(presetId);
          } else {
            // Restore custom theme
            state.activeTheme = {
              board: findBoardTheme(boardId),
              pieces: findPieceTheme(piecesId),
              background: findBackgroundTheme(backgroundId),
            };
          }
        }
      },
    }
  )
);

/**
 * Hook to access theme store
 */
export const useTheme = () => {
  const store = useThemeStore();
  return {
    theme: store.activeTheme,
    presetId: store.activePresetId,
    availableBoards: store.availableBoards,
    availablePieces: store.availablePieces,
    availableBackgrounds: store.availableBackgrounds,
    availablePresets: store.availablePresets,
    setPreset: store.setPreset,
    setBoardTheme: store.setBoardTheme,
    setPieceTheme: store.setPieceTheme,
    setBackgroundTheme: store.setBackgroundTheme,
    setCustomTheme: store.setCustomTheme,
    resetToDefault: store.resetToDefault,
  };
};

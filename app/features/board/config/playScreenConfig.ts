import type { BoardConfig } from './boardConfig';
import { defaultBoardConfig } from './boardConfig';
import type { ThemeConfig, BoardTheme } from './themeConfig';
import { defaultThemeConfig } from './themeConfig';

export interface PlayScreenConfig {
  board: BoardConfig;
  theme: ThemeConfig;

  /** Polling interval for game updates in milliseconds */
  pollInterval: number;

  /** Move list panel width in pixels */
  moveListWidth: number;
}

/**
 * Default play screen configuration
 */
export const defaultPlayScreenConfig: PlayScreenConfig = {
  board: defaultBoardConfig,
  theme: defaultThemeConfig as unknown as ThemeConfig,
  pollInterval: 1000,
  moveListWidth: 200,
};

/**
 * Create a play screen configuration with overrides
 * Uses functional approach for better composition
 */
export const createPlayScreenConfig = (
  overrides?: Partial<PlayScreenConfig>
): PlayScreenConfig => {
  return {
    ...defaultPlayScreenConfig,
    ...overrides,
    board: {
      ...defaultPlayScreenConfig.board,
      ...overrides?.board,
    },
    theme: {
      ...defaultPlayScreenConfig.theme,
      ...overrides?.theme,
    },
  };
};

/**
 * Get hydrated board props for ChessBoard component
 * Merges BoardConfig with Theme information for complete board rendering
 * 
 * Usage in component:
 * <ChessBoard
 *   {...getHydratedBoardProps(screenConfigObj)}
 *   fen={...}
 *   sideToMove={...}
 *   myColor={...}
 *   onMove={...}
 * />
 */
export const getHydratedBoardProps = (config: PlayScreenConfig) => ({
  ...config.board,
  boardTheme: config.theme.boardTheme as BoardTheme,
  pieceTheme: config.theme.pieceTheme as any,
});

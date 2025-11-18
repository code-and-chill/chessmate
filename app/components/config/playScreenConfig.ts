/**
 * Play Screen Configuration
 *
 * Combines board and theme configurations for the play screen.
 * Provides a single point of customization for the screen's appearance and behavior.
 * 
 * Architecture:
 * - BoardConfig: Layout and interactivity (size, squares, etc.)
 * - ThemeConfig: Colors and visual theme
 * - PlayScreenConfig: Combines both + screen-specific settings
 * 
 * Hydration:
 * PlayScreenConfig is "hydrated" into the view layer:
 * - screenConfigObj.board spreads into ChessBoard
 * - screenConfigObj.board.boardTheme/themeMode are separate props passed to ChessBoard
 * - This keeps concerns separated while providing unified configuration
 */

import type { BoardConfig } from './boardConfig';
import { defaultBoardConfig } from './boardConfig';
import type { ThemeConfig, BoardTheme, ThemeMode } from './themeConfig';
import { defaultThemeConfig } from './themeConfig';

export interface PlayScreenConfig {
  board: BoardConfig;
  theme: ThemeConfig;

  /** API base URL for live game service */
  apiBaseUrl: string;

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
  theme: defaultThemeConfig,
  apiBaseUrl: 'http://localhost:8001',
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
  themeMode: config.theme.mode as ThemeMode,
});

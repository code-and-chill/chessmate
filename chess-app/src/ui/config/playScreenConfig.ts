/**
 * Play Screen Configuration
 * 
 * Combines board and theme configurations for the play screen.
 * Provides a single point of customization for the screen's appearance and behavior.
 */

import { BoardConfig, defaultBoardConfig } from './boardConfig';
import { ThemeConfig, defaultThemeConfig } from './themeConfig';

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

/**
 * Board Configuration
 *
 * Defines the visual and interactive configuration for the chess board.
 * This separates board presentation concerns from game logic.
 * 
 * Note: Theme/color configuration is handled separately in ThemeConfig
 * and passed through PlayScreenConfig. BoardConfig focuses only on
 * layout and interactivity.
 */

export interface BoardConfig {
  /** Size of the chess board in pixels */
  size: number;

  /** Size of individual squares in pixels */
  squareSize: number;

  /** Border radius for the board container */
  borderRadius: number;

  /** Whether the board should be interactive */
  isInteractive: boolean;

  /** Opacity when board is not interactive */
  disabledOpacity: number;
}

/**
 * Default board configuration
 * Can be overridden per game or user preference
 */
export const defaultBoardConfig: BoardConfig = {
  size: 320,
  squareSize: 40,
  borderRadius: 12,
  isInteractive: true,
  disabledOpacity: 0.7,
};

/**
 * Responsive board configuration factory
 * Creates board config based on available space
 */
export const createResponsiveBoardConfig = (availableWidth: number): BoardConfig => {
  // Use 80% of available width, but cap at reasonable sizes
  const maxWidth = Math.min(availableWidth * 0.8, 480);
  const minWidth = 240;
  const size = Math.max(minWidth, Math.min(maxWidth, maxWidth));
  const squareSize = size / 8;

  return {
    ...defaultBoardConfig,
    size,
    squareSize,
  };
};

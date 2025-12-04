/**
 * Theme Configuration - Chess.com Grade
 *
 * Defines the visual theme configuration for the play screen.
 * This separates theme concerns from game logic and board configuration.
 * Includes Chess.com-style board themes and piece sets.
 */

export type ThemeMode = 'light' | 'dark';
export type BoardTheme = 'classic' | 'blue' | 'brown' | 'marble' | 'green' | 'gray' | 'purple';
// SVG-based piece themes (8 themes total)
export type PieceTheme = 'minimal' | 'solid' | 'outline' | 'classic' | 'neon' | 'glass' | 'wood' | 'pixel' | 'sketch';

export interface BoardColors {
  lightSquare: string;
  darkSquare: string;
  background: string;
  lastMoveHighlight: string;
  selectedHighlight: string;
  legalMoveIndicator: string;
  checkHighlight: string;
  premoveHighlight: string;
}

export interface ThemeConfig {
  /** Light or dark mode */
  mode: ThemeMode;

  /** Board color theme */
  boardTheme: BoardTheme;

  /** Piece set theme */
  pieceTheme: PieceTheme;

  /** Custom colors override (optional) */
  customColors?: Record<string, string>;
}

/**
 * Chess.com-Grade Board Theme Colors
 * Matches the professional look of Chess.com themes
 */
const BOARD_THEME_COLORS: Record<BoardTheme, Record<ThemeMode, BoardColors>> = {
  classic: {
    light: {
      lightSquare: '#EEEED2',
      darkSquare: '#769656',
      background: '#F0F0F0',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
      selectedHighlight: 'rgba(255, 215, 0, 0.5)',
      legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
      checkHighlight: 'rgba(255, 0, 0, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.4)',
    },
    dark: {
      lightSquare: '#404040',
      darkSquare: '#202020',
      background: '#1a1a1a',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.3)',
      selectedHighlight: 'rgba(255, 215, 0, 0.4)',
      legalMoveIndicator: 'rgba(0, 150, 255, 0.3)',
      checkHighlight: 'rgba(255, 50, 50, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.3)',
    },
  },
  blue: {
    light: {
      lightSquare: '#E0E8FF',
      darkSquare: '#6A85DA',
      background: '#E8F0FF',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
      selectedHighlight: 'rgba(255, 215, 0, 0.5)',
      legalMoveIndicator: 'rgba(0, 50, 150, 0.3)',
      checkHighlight: 'rgba(255, 0, 0, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.4)',
    },
    dark: {
      lightSquare: '#2a3a52',
      darkSquare: '#1a2a3a',
      background: '#141e2e',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.3)',
      selectedHighlight: 'rgba(255, 215, 0, 0.4)',
      legalMoveIndicator: 'rgba(100, 150, 255, 0.3)',
      checkHighlight: 'rgba(255, 50, 50, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.3)',
    },
  },
  brown: {
    light: {
      lightSquare: '#F0D9B5',
      darkSquare: '#B58863',
      background: '#F5E8D8',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
      selectedHighlight: 'rgba(255, 215, 0, 0.5)',
      legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
      checkHighlight: 'rgba(255, 0, 0, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.4)',
    },
    dark: {
      lightSquare: '#3a2a1a',
      darkSquare: '#2a1a0a',
      background: '#1a1410',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.3)',
      selectedHighlight: 'rgba(255, 215, 0, 0.4)',
      legalMoveIndicator: 'rgba(0, 150, 255, 0.3)',
      checkHighlight: 'rgba(255, 50, 50, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.3)',
    },
  },
  marble: {
    light: {
      lightSquare: '#F8F5F2',
      darkSquare: '#BFB8AF',
      background: '#FFFFFF',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
      selectedHighlight: 'rgba(255, 215, 0, 0.5)',
      legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
      checkHighlight: 'rgba(255, 0, 0, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.4)',
    },
    dark: {
      lightSquare: '#3a3a3a',
      darkSquare: '#252525',
      background: '#1a1a1a',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.3)',
      selectedHighlight: 'rgba(255, 215, 0, 0.4)',
      legalMoveIndicator: 'rgba(0, 150, 255, 0.3)',
      checkHighlight: 'rgba(255, 50, 50, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.3)',
    },
  },
  green: {
    light: {
      lightSquare: '#EEEED2',
      darkSquare: '#769656',
      background: '#F0F0E8',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
      selectedHighlight: 'rgba(255, 215, 0, 0.5)',
      legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
      checkHighlight: 'rgba(255, 0, 0, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.4)',
    },
    dark: {
      lightSquare: '#2c2c2c',
      darkSquare: '#1a1a1a',
      background: '#141414',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.3)',
      selectedHighlight: 'rgba(255, 215, 0, 0.4)',
      legalMoveIndicator: 'rgba(0, 150, 255, 0.3)',
      checkHighlight: 'rgba(255, 50, 50, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.3)',
    },
  },
  gray: {
    light: {
      lightSquare: '#E8E8E8',
      darkSquare: '#808080',
      background: '#F0F0F0',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
      selectedHighlight: 'rgba(255, 215, 0, 0.5)',
      legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
      checkHighlight: 'rgba(255, 0, 0, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.4)',
    },
    dark: {
      lightSquare: '#3a3a3a',
      darkSquare: '#1a1a1a',
      background: '#141414',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.3)',
      selectedHighlight: 'rgba(255, 215, 0, 0.4)',
      legalMoveIndicator: 'rgba(0, 150, 255, 0.3)',
      checkHighlight: 'rgba(255, 50, 50, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.3)',
    },
  },
  purple: {
    light: {
      lightSquare: '#E6D5E8',
      darkSquare: '#9468A0',
      background: '#F0E8F5',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
      selectedHighlight: 'rgba(255, 215, 0, 0.5)',
      legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
      checkHighlight: 'rgba(255, 0, 0, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.4)',
    },
    dark: {
      lightSquare: '#3a2a42',
      darkSquare: '#1a0a2a',
      background: '#140a1a',
      lastMoveHighlight: 'rgba(255, 255, 0, 0.3)',
      selectedHighlight: 'rgba(255, 215, 0, 0.4)',
      legalMoveIndicator: 'rgba(0, 150, 255, 0.3)',
      checkHighlight: 'rgba(255, 50, 50, 0.5)',
      premoveHighlight: 'rgba(100, 200, 100, 0.3)',
    },
  },
};

/**
 * Get board colors based on theme and mode
 */
export const getBoardColors = (theme: BoardTheme, mode: ThemeMode): BoardColors => {
  return BOARD_THEME_COLORS[theme][mode];
};

/**
 * Default theme configuration
 */
export const defaultThemeConfig: ThemeConfig = {
  mode: 'light',
  boardTheme: 'classic',
  pieceTheme: 'minimal', // Start with minimal flat theme
};

/**
 * Theme configuration options available to users
 */
export const themeConfigOptions = {
  modes: ['light', 'dark'] as const,
  boardThemes: ['classic', 'blue', 'brown', 'marble', 'green', 'gray', 'purple'] as const,
  pieceThemes: ['minimal', 'solid', 'outline', 'classic', 'neon', 'glass', 'wood', 'pixel', 'sketch'] as const,
};

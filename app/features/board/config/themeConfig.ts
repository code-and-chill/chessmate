import type { PieceTheme } from '../types/pieces';

export type BoardTheme = 'classic' | 'blue' | 'brown' | 'marble' | 'green' | 'gray' | 'purple';

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
  /** Board color theme */
  boardTheme: BoardTheme;

  /** Piece set theme */
  pieceTheme: PieceTheme;

  /** Custom colors override (optional) */
  customColors?: Record<string, string>;
}

const BOARD_THEME_COLORS: Record<BoardTheme, BoardColors> = {
  classic: {
    lightSquare: '#EEEED2',
    darkSquare: '#769656',
    background: '#F0F0F0',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
    selectedHighlight: 'rgba(255, 215, 0, 0.5)',
    legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
    checkHighlight: 'rgba(255, 0, 0, 0.5)',
    premoveHighlight: 'rgba(100, 200, 100, 0.4)',
  },
  blue: {
    lightSquare: '#E0E8FF',
    darkSquare: '#6A85DA',
    background: '#E8F0FF',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
    selectedHighlight: 'rgba(255, 215, 0, 0.5)',
    legalMoveIndicator: 'rgba(0, 50, 150, 0.3)',
    checkHighlight: 'rgba(255, 0, 0, 0.5)',
    premoveHighlight: 'rgba(100, 200, 100, 0.4)',
  },
  brown: {
    lightSquare: '#F0D9B5',
    darkSquare: '#B58863',
    background: '#F5E8D8',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
    selectedHighlight: 'rgba(255, 215, 0, 0.5)',
    legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
    checkHighlight: 'rgba(255, 0, 0, 0.5)',
    premoveHighlight: 'rgba(100, 200, 100, 0.4)',
  },
  marble: {
    lightSquare: '#F8F5F2',
    darkSquare: '#BFB8AF',
    background: '#FFFFFF',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
    selectedHighlight: 'rgba(255, 215, 0, 0.5)',
    legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
    checkHighlight: 'rgba(255, 0, 0, 0.5)',
    premoveHighlight: 'rgba(100, 200, 100, 0.4)',
  },
  green: {
    lightSquare: '#EEEED2',
    darkSquare: '#769656',
    background: '#F0F0E8',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
    selectedHighlight: 'rgba(255, 215, 0, 0.5)',
    legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
    checkHighlight: 'rgba(255, 0, 0, 0.5)',
    premoveHighlight: 'rgba(100, 200, 100, 0.4)',
  },
  gray: {
    lightSquare: '#E8E8E8',
    darkSquare: '#808080',
    background: '#F0F0F0',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
    selectedHighlight: 'rgba(255, 215, 0, 0.5)',
    legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
    checkHighlight: 'rgba(255, 0, 0, 0.5)',
    premoveHighlight: 'rgba(100, 200, 100, 0.4)',
  },
  purple: {
    lightSquare: '#E6D5E8',
    darkSquare: '#9468A0',
    background: '#F0E8F5',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.4)',
    selectedHighlight: 'rgba(255, 215, 0, 0.5)',
    legalMoveIndicator: 'rgba(0, 100, 200, 0.3)',
    checkHighlight: 'rgba(255, 0, 0, 0.5)',
    premoveHighlight: 'rgba(100, 200, 100, 0.4)',
  },
};

/**
 * Get board colors based on theme
 */
export const getBoardColors = (theme: BoardTheme): BoardColors => {
  return BOARD_THEME_COLORS[theme];
};

/**
 * Default theme configuration
 */
export const defaultThemeConfig = {
  boardTheme: 'classic',
  pieceTheme: 'minimal', // Start with minimal flat theme
};

/**
 * Theme configuration options available to users
 */
export const themeConfigOptions = {
  boardThemes: ['classic', 'blue', 'brown', 'marble', 'green', 'gray', 'purple'] as const,
  pieceThemes: ['minimal', 'solid', 'outline', 'neon', 'glass', 'wood', 'pixel', 'sketch'] as const,
};

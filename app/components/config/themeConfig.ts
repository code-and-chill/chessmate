/**
 * Theme Configuration
 *
 * Defines the visual theme configuration for the play screen.
 * This separates theme concerns from game logic and board configuration.
 */

export type ThemeMode = 'light' | 'dark';
export type BoardTheme = 'green' | 'blue' | 'brown' | 'gray' | 'purple';

export interface BoardColors {
  lightSquare: string;
  darkSquare: string;
  background: string;
}

export interface ThemeConfig {
  /** Light or dark mode */
  mode: ThemeMode;

  /** Board color theme */
  boardTheme: BoardTheme;

  /** Custom colors override (optional) */
  customColors?: Record<string, string>;
}

/**
 * Board theme color definitions
 */
const BOARD_THEME_COLORS: Record<BoardTheme, Record<ThemeMode, BoardColors>> = {
  green: {
    light: {
      lightSquare: '#F0D9B5',
      darkSquare: '#B58863',
      background: '#F0D9B5',
    },
    dark: {
      lightSquare: '#2c2c2c',
      darkSquare: '#1a1a1a',
      background: '#1a1a1a',
    },
  },
  blue: {
    light: {
      lightSquare: '#DEE3E6',
      darkSquare: '#8CA8D7',
      background: '#DEE3E6',
    },
    dark: {
      lightSquare: '#2a3a52',
      darkSquare: '#1a2a3a',
      background: '#1a2a3a',
    },
  },
  brown: {
    light: {
      lightSquare: '#F0D9B5',
      darkSquare: '#B58863',
      background: '#F0D9B5',
    },
    dark: {
      lightSquare: '#2c2c2c',
      darkSquare: '#1a1a1a',
      background: '#1a1a1a',
    },
  },
  gray: {
    light: {
      lightSquare: '#E8E8E8',
      darkSquare: '#808080',
      background: '#E8E8E8',
    },
    dark: {
      lightSquare: '#3a3a3a',
      darkSquare: '#1a1a1a',
      background: '#1a1a1a',
    },
  },
  purple: {
    light: {
      lightSquare: '#E6D5E8',
      darkSquare: '#9468A0',
      background: '#E6D5E8',
    },
    dark: {
      lightSquare: '#3a2a42',
      darkSquare: '#1a0a2a',
      background: '#1a0a2a',
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
  boardTheme: 'green',
};

/**
 * Theme configuration options available to users
 */
export const themeConfigOptions = {
  modes: ['light', 'dark'] as const,
  boardThemes: ['green', 'blue', 'brown', 'gray', 'purple'] as const,
};

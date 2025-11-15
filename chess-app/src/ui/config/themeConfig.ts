/**
 * Theme Configuration
 * 
 * Defines the visual theme configuration for the play screen.
 * This separates theme concerns from game logic and board configuration.
 */

import { ThemeMode, BoardTheme } from '../tokens/themes';

export interface ThemeConfig {
  /** Light or dark mode */
  mode: ThemeMode;

  /** Board color theme */
  boardTheme: BoardTheme;

  /** Custom colors override (optional) */
  customColors?: Record<string, string>;
}

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

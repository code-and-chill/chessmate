/**
 * Board Theme Registry
 * app/features/theme/registry/boards.ts
 * 
 * Collection of board themes with neumorphic styling
 */

import type { BoardTheme } from '../domain/models';

/**
 * Classic Board Theme (Chess.com style)
 */
export const classicBoardTheme: BoardTheme = {
  id: 'classic',
  name: 'Classic',
  lightSquare: '#F0D9B5',
  darkSquare: '#B58863',
  selectedSquare: 'rgba(255, 255, 0, 0.5)',
  lastMoveHighlight: 'rgba(255, 255, 100, 0.4)',
  legalMoveIndicator: 'rgba(0, 0, 0, 0.2)',
  checkHighlight: 'rgba(255, 0, 0, 0.5)',
  borderColor: '#8B7355',
  borderWidth: 2,
  borderRadius: 8,
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    dark: 'rgba(0, 0, 0, 0.1)',
    offset: { x: 0, y: 2 },
    blur: 4,
  },
};

/**
 * Modern Dark Board Theme
 */
export const modernDarkBoardTheme: BoardTheme = {
  id: 'modern-dark',
  name: 'Modern Dark',
  lightSquare: '#4A5568',
  darkSquare: '#2D3748',
  selectedSquare: 'rgba(66, 153, 225, 0.5)',
  lastMoveHighlight: 'rgba(72, 187, 120, 0.4)',
  legalMoveIndicator: 'rgba(255, 255, 255, 0.2)',
  checkHighlight: 'rgba(245, 101, 101, 0.6)',
  borderColor: '#1A202C',
  borderWidth: 3,
  borderRadius: 12,
  shadow: {
    light: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
    offset: { x: 0, y: 3 },
    blur: 6,
  },
};

/**
 * Marble Board Theme (Elegant white/gray)
 */
export const marbleBoardTheme: BoardTheme = {
  id: 'marble',
  name: 'Marble',
  lightSquare: '#FFFFFF',
  darkSquare: '#778899',
  selectedSquare: 'rgba(135, 206, 250, 0.5)',
  lastMoveHighlight: 'rgba(135, 206, 250, 0.4)',
  legalMoveIndicator: 'rgba(47, 79, 79, 0.2)',
  checkHighlight: 'rgba(255, 69, 0, 0.5)',
  borderColor: '#696969',
  borderWidth: 2,
  borderRadius: 10,
  shadow: {
    light: 'rgba(0, 0, 0, 0.08)',
    dark: 'rgba(0, 0, 0, 0.15)',
    offset: { x: 0, y: 2 },
    blur: 5,
  },
  texture: {
    pattern: 'marble',
    opacity: 0.05,
  },
};

/**
 * Wood Board Theme (Natural wood tones)
 */
export const woodBoardTheme: BoardTheme = {
  id: 'wood',
  name: 'Wood',
  lightSquare: '#E8D4A2',
  darkSquare: '#8B4513',
  selectedSquare: 'rgba(255, 215, 0, 0.5)',
  lastMoveHighlight: 'rgba(255, 200, 100, 0.4)',
  legalMoveIndicator: 'rgba(101, 67, 33, 0.3)',
  checkHighlight: 'rgba(220, 20, 60, 0.5)',
  borderColor: '#654321',
  borderWidth: 3,
  borderRadius: 8,
  shadow: {
    light: 'rgba(101, 67, 33, 0.1)',
    dark: 'rgba(101, 67, 33, 0.2)',
    offset: { x: 0, y: 2 },
    blur: 4,
  },
  texture: {
    pattern: 'wood',
    opacity: 0.1,
  },
};

/**
 * Neon Board Theme (Cyberpunk style)
 */
export const neonBoardTheme: BoardTheme = {
  id: 'neon',
  name: 'Neon',
  lightSquare: '#1A1A2E',
  darkSquare: '#0F0F1E',
  selectedSquare: 'rgba(0, 255, 255, 0.4)',
  lastMoveHighlight: 'rgba(138, 43, 226, 0.4)',
  legalMoveIndicator: 'rgba(0, 255, 255, 0.3)',
  checkHighlight: 'rgba(255, 0, 0, 0.6)',
  borderColor: '#00FFFF',
  borderWidth: 2,
  borderRadius: 10,
  shadow: {
    light: 'rgba(0, 255, 255, 0.2)',
    dark: 'rgba(0, 255, 255, 0.3)',
    offset: { x: 0, y: 0 },
    blur: 8,
  },
};

/**
 * Glass Board Theme (Glassmorphism style)
 */
export const glassBoardTheme: BoardTheme = {
  id: 'glass',
  name: 'Glass',
  lightSquare: 'rgba(255, 255, 255, 0.2)',
  darkSquare: 'rgba(255, 255, 255, 0.05)',
  selectedSquare: 'rgba(66, 153, 225, 0.4)',
  lastMoveHighlight: 'rgba(72, 187, 120, 0.3)',
  legalMoveIndicator: 'rgba(255, 255, 255, 0.25)',
  checkHighlight: 'rgba(245, 101, 101, 0.5)',
  borderColor: 'rgba(255, 255, 255, 0.3)',
  borderWidth: 1,
  borderRadius: 16,
  shadow: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.1)',
    offset: { x: 0, y: 4 },
    blur: 10,
  },
};

/**
 * All board themes
 */
export const boardThemes: BoardTheme[] = [
  classicBoardTheme,
  modernDarkBoardTheme,
  marbleBoardTheme,
  woodBoardTheme,
  neonBoardTheme,
  glassBoardTheme,
];

/**
 * Default board theme
 */
export const defaultBoardTheme = classicBoardTheme;

/**
 * Get board theme by ID
 */
export const getBoardTheme = (id: string): BoardTheme | undefined => {
  return boardThemes.find(theme => theme.id === id);
};

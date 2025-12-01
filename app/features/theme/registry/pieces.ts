/**
 * Piece Theme Registry
 * app/features/theme/registry/pieces.ts
 * 
 * Collection of piece themes (SVG components will be added separately)
 */

import type { PieceTheme } from '../domain/models';

/**
 * Classic Piece Theme (Traditional Staunton style)
 */
export const classicPieceTheme: PieceTheme = {
  id: 'classic',
  name: 'Classic',
  style: 'classic',
  whiteColor: '#FFFFFF',
  blackColor: '#000000',
  outlineColor: '#333333',
  outlineWidth: 0.5,
  scale: 0.85,
  shadow: {
    color: 'rgba(0, 0, 0, 0.3)',
    offset: { x: 0, y: 2 },
    blur: 3,
  },
};

/**
 * Neo Piece Theme (Modern geometric style)
 */
export const neoPieceTheme: PieceTheme = {
  id: 'neo',
  name: 'Neo',
  style: 'neo',
  whiteColor: '#F0F0F0',
  blackColor: '#1A1A1A',
  outlineColor: '#666666',
  outlineWidth: 1,
  scale: 0.9,
  shadow: {
    color: 'rgba(0, 0, 0, 0.4)',
    offset: { x: 0, y: 3 },
    blur: 4,
  },
};

/**
 * Alpha Piece Theme (Simple minimalist)
 */
export const alphaPieceTheme: PieceTheme = {
  id: 'alpha',
  name: 'Alpha',
  style: 'alpha',
  whiteColor: '#FFFFFF',
  blackColor: '#2D3748',
  outlineColor: undefined,
  outlineWidth: 0,
  scale: 0.8,
  shadow: {
    color: 'rgba(0, 0, 0, 0.2)',
    offset: { x: 0, y: 1 },
    blur: 2,
  },
};

/**
 * Staunton Piece Theme (Traditional tournament style)
 */
export const stauntonPieceTheme: PieceTheme = {
  id: 'staunton',
  name: 'Staunton',
  style: 'staunton',
  whiteColor: '#FAF8F3',
  blackColor: '#2C2C2C',
  outlineColor: '#444444',
  outlineWidth: 0.8,
  scale: 0.88,
  shadow: {
    color: 'rgba(0, 0, 0, 0.35)',
    offset: { x: 0, y: 2 },
    blur: 3,
  },
};

/**
 * All piece themes
 */
export const pieceThemes: PieceTheme[] = [
  classicPieceTheme,
  neoPieceTheme,
  alphaPieceTheme,
  stauntonPieceTheme,
];

/**
 * Default piece theme
 */
export const defaultPieceTheme = classicPieceTheme;

/**
 * Get piece theme by ID
 */
export const getPieceTheme = (id: string): PieceTheme | undefined => {
  return pieceThemes.find(theme => theme.id === id);
};

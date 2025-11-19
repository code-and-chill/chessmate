/**
 * Board Theme Tokens
 * app/ui/tokens/board-themes.ts
 * 
 * Extensible chess board theming system with multiple visual styles
 */

export interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  selectedSquare: string;
  lastMoveHighlight: string;
  legalMoveIndicator: string;
  legalMoveCaptureIndicator: string;
  checkHighlight: string;
  coordinateColor: string;
  borderColor?: string;
}

export const boardThemes: Record<string, BoardTheme> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    lightSquare: '#F0D9B5',
    darkSquare: '#B58863',
    selectedSquare: 'rgba(255, 255, 0, 0.5)',
    lastMoveHighlight: 'rgba(255, 255, 100, 0.4)',
    legalMoveIndicator: 'rgba(0, 0, 0, 0.2)',
    legalMoveCaptureIndicator: 'rgba(0, 0, 0, 0.3)',
    checkHighlight: 'rgba(255, 0, 0, 0.5)',
    coordinateColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: '#8B7355',
  },
  wood: {
    id: 'wood',
    name: 'Wood',
    lightSquare: '#E8D4A2',
    darkSquare: '#8B4513',
    selectedSquare: 'rgba(255, 215, 0, 0.5)',
    lastMoveHighlight: 'rgba(255, 200, 100, 0.4)',
    legalMoveIndicator: 'rgba(101, 67, 33, 0.3)',
    legalMoveCaptureIndicator: 'rgba(101, 67, 33, 0.4)',
    checkHighlight: 'rgba(220, 20, 60, 0.5)',
    coordinateColor: 'rgba(101, 67, 33, 0.4)',
    borderColor: '#654321',
  },
  marble: {
    id: 'marble',
    name: 'Marble',
    lightSquare: '#FFFFFF',
    darkSquare: '#778899',
    selectedSquare: 'rgba(135, 206, 250, 0.5)',
    lastMoveHighlight: 'rgba(135, 206, 250, 0.4)',
    legalMoveIndicator: 'rgba(47, 79, 79, 0.2)',
    legalMoveCaptureIndicator: 'rgba(47, 79, 79, 0.3)',
    checkHighlight: 'rgba(255, 69, 0, 0.5)',
    coordinateColor: 'rgba(47, 79, 79, 0.3)',
    borderColor: '#696969',
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    lightSquare: '#1A1A2E',
    darkSquare: '#0F0F1E',
    selectedSquare: 'rgba(0, 255, 255, 0.4)',
    lastMoveHighlight: 'rgba(138, 43, 226, 0.4)',
    legalMoveIndicator: 'rgba(0, 255, 255, 0.3)',
    legalMoveCaptureIndicator: 'rgba(255, 0, 255, 0.4)',
    checkHighlight: 'rgba(255, 0, 0, 0.6)',
    coordinateColor: 'rgba(0, 255, 255, 0.4)',
    borderColor: '#00FFFF',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    lightSquare: '#B0E0E6',
    darkSquare: '#4682B4',
    selectedSquare: 'rgba(255, 215, 0, 0.5)',
    lastMoveHighlight: 'rgba(72, 209, 204, 0.4)',
    legalMoveIndicator: 'rgba(25, 25, 112, 0.3)',
    legalMoveCaptureIndicator: 'rgba(25, 25, 112, 0.4)',
    checkHighlight: 'rgba(255, 99, 71, 0.5)',
    coordinateColor: 'rgba(25, 25, 112, 0.4)',
    borderColor: '#1E90FF',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    lightSquare: '#C9E4CA',
    darkSquare: '#2D5016',
    selectedSquare: 'rgba(255, 255, 0, 0.5)',
    lastMoveHighlight: 'rgba(144, 238, 144, 0.4)',
    legalMoveIndicator: 'rgba(34, 139, 34, 0.3)',
    legalMoveCaptureIndicator: 'rgba(34, 139, 34, 0.4)',
    checkHighlight: 'rgba(255, 0, 0, 0.5)',
    coordinateColor: 'rgba(0, 100, 0, 0.4)',
    borderColor: '#228B22',
  },
};

export const defaultTheme = boardThemes.classic;

export type BoardThemeId = keyof typeof boardThemes;

export const getBoardTheme = (themeId: BoardThemeId): BoardTheme => {
  return boardThemes[themeId] || defaultTheme;
};

export const getAllThemeIds = (): BoardThemeId[] => {
  return Object.keys(boardThemes) as BoardThemeId[];
};

export const getAllThemes = (): BoardTheme[] => {
  return Object.values(boardThemes);
};

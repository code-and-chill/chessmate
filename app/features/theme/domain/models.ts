/**
 * Theme Domain Models
 * app/features/theme/domain/models.ts
 * 
 * SOLID-compliant theme interfaces for chess UI customization.
 * Each theme aspect is independently configurable without coupling.
 */

/**
 * Board Theme
 * Controls the visual appearance of the chess board tiles
 */
export interface BoardTheme {
  id: string;
  name: string;
  
  // Tile colors
  lightSquare: string;
  darkSquare: string;
  
  // Highlights
  selectedSquare: string;
  lastMoveHighlight: string;
  legalMoveIndicator: string;
  checkHighlight: string;
  
  // Visual style
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  
  // Neumorphic shadows
  shadow?: {
    light: string; // Inner shadow for light tiles
    dark: string;  // Inner shadow for dark tiles
    offset: { x: number; y: number };
    blur: number;
  };
  
  // Optional texture overlay
  texture?: {
    pattern: 'wood' | 'marble' | 'leather' | 'none';
    opacity: number;
  };
}

/**
 * Piece Theme
 * Controls the visual style of chess pieces
 * Independent from board theme
 */
export interface PieceTheme {
  id: string;
  name: string;
  
  // Piece style
  style: 'classic' | 'neo' | 'staunton' | 'alpha' | 'pixel' | 'minimal';
  
  // Color customization
  whiteColor?: string;
  blackColor?: string;
  outlineColor?: string;
  outlineWidth?: number;
  
  // Size scaling (relative to square size)
  scale?: number; // 0.7 = 70% of square size, 1.0 = 100%
  
  // Shadow and effects
  shadow?: {
    color: string;
    offset: { x: number; y: number };
    blur: number;
  };
  
  // SVG component registry (set by registry, not user)
  components?: {
    K: { white: React.ComponentType<PieceSvgProps>; black: React.ComponentType<PieceSvgProps> };
    Q: { white: React.ComponentType<PieceSvgProps>; black: React.ComponentType<PieceSvgProps> };
    R: { white: React.ComponentType<PieceSvgProps>; black: React.ComponentType<PieceSvgProps> };
    B: { white: React.ComponentType<PieceSvgProps>; black: React.ComponentType<PieceSvgProps> };
    N: { white: React.ComponentType<PieceSvgProps>; black: React.ComponentType<PieceSvgProps> };
    P: { white: React.ComponentType<PieceSvgProps>; black: React.ComponentType<PieceSvgProps> };
  };
}

/**
 * Props for SVG piece components
 */
export interface PieceSvgProps {
  size: number;
  color?: string;
  opacity?: number;
}

/**
 * Background Theme
 * Controls the global app/board container background
 */
export interface BackgroundTheme {
  id: string;
  name: string;
  type: 'solid' | 'gradient' | 'glass' | 'texture' | 'image';
  
  // Solid background
  solid?: {
    color: string;
  };
  
  // Gradient background
  gradient?: {
    colors: string[];
    angle: number; // degrees, 0 = vertical, 90 = horizontal
    stops?: number[]; // [0, 0.5, 1] for color positions
  };
  
  // Glass morphism (blur + transparency)
  glass?: {
    backgroundColor: string;
    blurRadius: number;
    opacity: number;
  };
  
  // Texture overlay
  texture?: {
    pattern: 'noise' | 'grid' | 'dots' | 'waves';
    color: string;
    opacity: number;
  };
  
  // Image background
  image?: {
    uri: string;
    opacity: number;
    blur?: number;
  };
}

/**
 * Preset Theme
 * A named bundle combining board, pieces, and background
 */
export interface PresetTheme {
  id: string;
  name: string;
  description?: string;
  preview?: string; // Preview image URI
  
  // Theme components
  boardThemeId: string;
  pieceThemeId: string;
  backgroundThemeId: string;
  
  // Metadata
  isPremium?: boolean;
  tags?: string[]; // ['dark', 'modern', 'classic', etc.]
}

/**
 * Chess Theme
 * Complete theme configuration for the chess UI
 */
export interface ChessTheme {
  board: BoardTheme;
  pieces: PieceTheme;
  background: BackgroundTheme;
  preset?: PresetTheme;
}

/**
 * Theme State (for Zustand store)
 */
export interface ThemeState {
  // Current theme
  activeTheme: ChessTheme;
  activePresetId: string | null;
  
  // Available themes (loaded from registries)
  availableBoards: BoardTheme[];
  availablePieces: PieceTheme[];
  availableBackgrounds: BackgroundTheme[];
  availablePresets: PresetTheme[];
  
  // Actions
  setPreset: (presetId: string) => void;
  setBoardTheme: (boardTheme: BoardTheme) => void;
  setPieceTheme: (pieceTheme: PieceTheme) => void;
  setBackgroundTheme: (backgroundTheme: BackgroundTheme) => void;
  setCustomTheme: (theme: Partial<ChessTheme>) => void;
  resetToDefault: () => void;
}

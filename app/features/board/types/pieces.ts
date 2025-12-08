import type { SvgProps } from 'react-native-svg';
import type { Piece as EnginePiece } from '@/core/utils/chess';

/**
 * Standard chess piece notation (12 keys)
 * 
 * Format: {color}{type}
 * - w = white, b = black
 * - K = King, Q = Queen, R = Rook, B = Bishop, N = Knight, P = Pawn
 * 
 * Compatible with FEN notation and chess engines globally.
 * 
 * @example
 * 'wK' // White King
 * 'bQ' // Black Queen
 */
export type PieceKey = 
  | 'wK' | 'wQ' | 'wR' | 'wB' | 'wN' | 'wP'
  | 'bK' | 'bQ' | 'bR' | 'bB' | 'bN' | 'bP';

export type PieceTheme = 
  | 'minimal'  // Lichess-style thin outlines
  | 'solid'    // Material Design filled silhouettes
  | 'outline'  // Chess.com classic outlines
  | 'classic'  // Emoji fallback (deprecated)
  | 'neon'     // Future: Glowing edges
  | 'glass'    // Future: Translucent PNG
  | 'wood'     // Future: Wood texture PNG
  | 'pixel'    // Retro pixel art theme
  | 'sketch';  // Hand-drawn sketch theme

/**
 * Piece set definition
 * 
 * Contains metadata and component mapping for a complete theme.
 */
export interface PieceSet {
  /** Internal theme identifier (matches folder name) */
  name: PieceTheme;
  
  /** Human-readable display name */
  displayName: string;
  
  /** Short description for UI */
  description: string;
  
  /** Whether theme requires premium subscription */
  premium: boolean;
  
  /** Asset type: 'svg' for vectors, 'png' for textures */
  type: 'svg' | 'png' | 'emoji';
  
  /** Map of piece keys to React components or image sources */
  pieces: Record<PieceKey, React.FC<SvgProps> | any>;
}

/**
 * Piece rendering props
 */
export interface PieceProps {
  /** Piece identifier (e.g., 'wK', 'bQ') */
  piece: PieceKey;
  
  /** Active theme */
  theme: PieceTheme;
  
  /** Size in pixels (default: 45) */
  size?: number;
  
  /** Color override (supports CSS colors and 'currentColor') */
  color?: string;
  
  /** Additional styles */
  style?: any;
  
  /** Accessibility label */
  accessibilityLabel?: string;

  animation: {
    fromFile: number;
    fromRank: number;
    toFile: number;
    toRank: number;
    squareSize: number;
    orientation: 'white' | 'black';
    /**
     * When true, the animation coordinates are interpreted as board-level absolute
     * positions and the piece will be rendered as an overlay positioned over the board.
     * When false, the piece renders inline inside its parent square (no absolute left/top).
     */
    isOverlay?: boolean;
    isCapture: boolean;
  };
}

/**
 * Helper to parse piece into color and type
 * 
 * @example
 * parsePieceKey('wK') // { color: 'w', type: 'K' }
 */
export const parsePieceKey = (piece: PieceKey): { color: 'w' | 'b'; type: string } => {
  return {
    color: piece[0] as 'w' | 'b',
    type: piece[1],
  };
};

/**
 * Helper to build piece key from color and type
 * 
 * @example
 * buildPieceKey('w', 'K') // 'wK'
 */
export const buildPieceKey = (color: 'w' | 'b', type: string): PieceKey => {
  return `${color}${type}` as PieceKey;
};

/**
 * Get human-readable piece name
 * 
 * @example
 * getPieceName('wK') // 'White King'
 */
export const getPieceName = (piece: PieceKey): string => {
  const { color, type } = parsePieceKey(piece);
  const colorName = color === 'w' ? 'White' : 'Black';
  
  const typeNames: Record<string, string> = {
    K: 'King',
    Q: 'Queen',
    R: 'Rook',
    B: 'Bishop',
    N: 'Knight',
    P: 'Pawn',
  };
  
  return `${colorName} ${typeNames[type] || type}`;
};

/**
 * All piece keys in standard order
 */
export const ALL_PIECE_KEYS: PieceKey[] = [
  'wK', 'wQ', 'wR', 'wB', 'wN', 'wP',
  'bK', 'bQ', 'bR', 'bB', 'bN', 'bP',
];


export type Piece = EnginePiece;

export const getPieceKey = (piece: Piece): PieceKey => {
    return buildPieceKey(piece.color, piece.type);
};
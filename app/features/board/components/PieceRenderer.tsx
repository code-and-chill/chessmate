/**
 * Piece Renderer Component
 * app/features/board/components/PieceRenderer.tsx
 * 
 * Factory component that renders the correct SVG piece based on type and color.
 * Uses the active piece theme from Zustand store.
 */

import React from 'react';
import { View } from 'react-native';
import {
  WhiteKing,
  BlackKing,
  WhiteQueen,
  BlackQueen,
  WhiteRook,
  BlackRook,
  WhiteBishop,
  BlackBishop,
  WhiteKnight,
  BlackKnight,
  WhitePawn,
  BlackPawn,
} from '@/features/theme/components/pieces';
import { useTheme } from '@/features/theme/stores/useThemeStore';
import type { Color, PieceType } from './ChessBoard';

export interface PieceRendererProps {
  type: PieceType; // 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'
  color: Color; // 'w' | 'b'
  size: number;
  opacity?: number;
}

/**
 * Piece component map
 * Maps piece type and color to the correct SVG component
 */
const PIECE_COMPONENTS = {
  w: {
    K: WhiteKing,
    Q: WhiteQueen,
    R: WhiteRook,
    B: WhiteBishop,
    N: WhiteKnight,
    P: WhitePawn,
  },
  b: {
    K: BlackKing,
    Q: BlackQueen,
    R: BlackRook,
    B: BlackBishop,
    N: BlackKnight,
    P: BlackPawn,
  },
};

/**
 * PieceRenderer
 * 
 * Renders a chess piece as an SVG component
 * Automatically applies theme settings (scale, colors, shadows)
 */
export const PieceRenderer: React.FC<PieceRendererProps> = React.memo(
  ({ type, color, size, opacity = 1 }) => {
    const { theme } = useTheme();
    const pieceTheme = theme.pieces;

    // Get the correct SVG component
    const PieceComponent = PIECE_COMPONENTS[color][type];

    if (!PieceComponent) {
      console.warn(`No SVG component found for piece: ${color}${type}`);
      return null;
    }

    // Apply theme scale
    const scaledSize = size * (pieceTheme.scale || 0.85);
    
    // Apply theme colors
    const pieceColor = color === 'w' ? pieceTheme.whiteColor : pieceTheme.blackColor;

    return (
      <View
        style={{
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: scaledSize,
            height: scaledSize,
            // Apply shadow if defined in theme
            ...(pieceTheme.shadow && {
              shadowColor: pieceTheme.shadow.color,
              shadowOffset: pieceTheme.shadow.offset,
              shadowRadius: pieceTheme.shadow.blur,
              shadowOpacity: 1,
              elevation: pieceTheme.shadow.blur, // Android shadow
            }),
          }}
        >
          <PieceComponent size={scaledSize} color={pieceColor} opacity={opacity} />
        </View>
      </View>
    );
  }
);

PieceRenderer.displayName = 'PieceRenderer';

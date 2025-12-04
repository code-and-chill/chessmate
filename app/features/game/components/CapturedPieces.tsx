import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface CapturedPiecesProps {
  fen: string;
  color: PieceColor; // Which side's captured pieces to show
}

const PIECE_VALUES: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const PIECE_SYMBOLS: Record<string, string> = {
  // White pieces
  P: '♙',
  N: '♘',
  B: '♗',
  R: '♖',
  Q: '♕',
  K: '♔',
  // Black pieces
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
};

/**
 * Calculate captured pieces from FEN
 * Standard starting material: 8 pawns, 2 knights, 2 bishops, 2 rooks, 1 queen per side
 */
function getCapturedPieces(fen: string): {
  white: string[];
  black: string[];
  whiteMaterial: number;
  blackMaterial: number;
} {
  const position = fen.split(' ')[0];
  
  const startingPieces = {
    P: 8, N: 2, B: 2, R: 2, Q: 1, K: 1,
    p: 8, n: 2, b: 2, r: 2, q: 1, k: 1,
  };
  
  const currentPieces: Record<string, number> = {
    P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0,
    p: 0, n: 0, b: 0, r: 0, q: 0, k: 0,
  };
  
  // Count pieces on the board
  for (const char of position) {
    if (currentPieces.hasOwnProperty(char)) {
      currentPieces[char]++;
    }
  }
  
  // Calculate captured pieces
  const whiteCaptured: string[] = [];
  const blackCaptured: string[] = [];
  
  let whiteMaterial = 0;
  let blackMaterial = 0;
  
  // White captured black pieces
  for (const piece of ['p', 'n', 'b', 'r', 'q'] as PieceType[]) {
    const captured = startingPieces[piece] - currentPieces[piece];
    for (let i = 0; i < captured; i++) {
      whiteCaptured.push(piece);
      whiteMaterial += PIECE_VALUES[piece];
    }
  }
  
  // Black captured white pieces
  for (const piece of ['P', 'N', 'B', 'R', 'Q']) {
    const lowerPiece = piece.toLowerCase() as PieceType;
    const captured = startingPieces[piece] - currentPieces[piece];
    for (let i = 0; i < captured; i++) {
      blackCaptured.push(piece);
      blackMaterial += PIECE_VALUES[lowerPiece];
    }
  }
  
  return { white: whiteCaptured, black: blackCaptured, whiteMaterial, blackMaterial };
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({ fen, color }) => {
  const { colors } = useThemeTokens();
  const captured = getCapturedPieces(fen);
  
  const pieces = color === 'w' ? captured.white : captured.black;
  const myMaterial = color === 'w' ? captured.whiteMaterial : captured.blackMaterial;
  const opponentMaterial = color === 'w' ? captured.blackMaterial : captured.whiteMaterial;
  const materialAdvantage = myMaterial - opponentMaterial;
  
  if (pieces.length === 0 && materialAdvantage <= 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.piecesRow}>
        {pieces.map((piece, index) => (
          <Text key={`${piece}-${index}`} style={[styles.pieceIcon, { color: colors.foreground.secondary }]}>
            {PIECE_SYMBOLS[piece]}
          </Text>
        ))}
        {materialAdvantage > 0 && (
          <Text style={[styles.advantage, { color: colors.accent.primary }]}>
            +{materialAdvantage}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 24,
    justifyContent: 'center',
  },
  piecesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  pieceIcon: {
    fontSize: 18,
    lineHeight: 20,
  },
  advantage: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
});

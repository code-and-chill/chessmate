/** 
 * Features:
 * - Responsive square board container with proper sizing
 * - Absolute positioned squares grid (8x8)
 * - Multiple board themes (classic, brown, blue, marble)
 * - Piece rendering with Unicode fallback (image support ready)
 * - Highlight system: last move, selected square, legal moves, check
 * - Smooth animations for piece movements
 * - Cross-platform: Web, iOS, Android
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, Platform, Dimensions, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { defaultBoardConfig, type BoardConfig } from '@/features/board/config';
import { getBoardColors, type BoardTheme, type ThemeMode, type PieceTheme } from '@/features/board/config/themeConfig';
import { 
  parseFENToBoard,
  isValidMove as validateMove,
  isKingInCheck,
} from '@/core/utils';
import { enhancedMotionTokens } from '@/ui/tokens/enhanced-motion';
import { shadowTokens } from '@/ui/tokens/shadows';

// Color type: 'w' for white, 'b' for black
export type Color = 'w' | 'b';

// Piece type: K=King, Q=Queen, R=Rook, B=Bishop, N=Knight, P=Pawn
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';

interface Piece {
  type: PieceType;
  color: Color;
}

export interface ChessBoardProps {
  // BoardConfig props (all optional with defaults)
  size?: number;
  squareSize?: number;
  borderRadius?: number;
  isInteractive?: boolean;
  disabledOpacity?: number;
  
  // Chess props
  fen?: string;
  sideToMove?: Color;
  myColor?: Color;
  boardTheme?: BoardTheme;
  themeMode?: ThemeMode;
  pieceTheme?: PieceTheme;
  orientation?: 'white' | 'black';
  lastMove?: { from: string; to: string } | null;
  showLegalMoves?: boolean;
  showCoordinates?: boolean;
  animateMovements?: boolean;
  isLocalGame?: boolean; // For pass-and-play: allow both sides to move
  onMove?: (from: string, to: string, promotion?: string) => void | Promise<void>;
}

interface Square {
  file: number;
  rank: number;
}

interface AnimatedPiece {
  id: string;
  piece: Piece;
  fromFile: number;
  fromRank: number;
  toFile: number;
  toRank: number;
  isCapture: boolean;
}

/**
 * Parse FEN string and return a board state
 * Returns an 8x8 array where board[rank][file] is a piece or null
 * Note: board[0] = rank 1 (white's first rank), board[7] = rank 8 (black's first rank)
 */
// Use shared engine parser to keep FEN parsing consistent
const parseFEN = (fen: string): (Piece | null)[][] => parseFENToBoard(fen) as unknown as (Piece | null)[][];

/**
 * Get piece emoji symbol
 */
const getPieceEmoji = (piece: Piece | null): string => {
  if (!piece) return '';

  const pieces: Record<PieceType, Record<Color, string>> = {
    K: { w: '♔', b: '♚' },
    Q: { w: '♕', b: '♛' },
    R: { w: '♖', b: '♜' },
    B: { w: '♗', b: '♝' },
    N: { w: '♘', b: '♞' },
    P: { w: '♙', b: '♟' },
  };

  return pieces[piece.type][piece.color];
};

/**
 * AnimatedPiece - Smooth piece movement with shadows
 */
const AnimatedPieceComponent: React.FC<{
  piece: Piece;
  fromFile: number;
  fromRank: number;
  toFile: number;
  toRank: number;
  squareSize: number;
  orientation: 'white' | 'black';
  isCapture: boolean;
}> = ({ piece, fromFile, fromRank, toFile, toRank, squareSize, orientation, isCapture }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Calculate pixel positions
  const getScreenPosition = (file: number, rank: number) => {
    const displayFile = orientation === 'white' ? file : 7 - file;
    const displayRank = orientation === 'white' ? 7 - rank : rank;
    return {
      x: displayFile * squareSize,
      y: displayRank * squareSize,
    };
  };
  
  const fromPos = getScreenPosition(fromFile, fromRank);
  const toPos = getScreenPosition(toFile, toRank);
  const deltaX = toPos.x - fromPos.x;
  const deltaY = toPos.y - fromPos.y;
  
  useEffect(() => {
    // Animate piece movement
    translateX.value = withTiming(deltaX, {
      duration: enhancedMotionTokens.duration.normal,
      easing: Easing.out(Easing.cubic),
    });
    
    translateY.value = withTiming(deltaY, {
      duration: enhancedMotionTokens.duration.normal,
      easing: Easing.out(Easing.cubic),
    });
    
    // Add capture animation (scale + fade)
    if (isCapture) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));
  
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: squareSize,
          height: squareSize,
          left: fromPos.x,
          top: fromPos.y,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          // Piece shadow for depth
          ...shadowTokens.sm,
        },
        animatedStyle,
      ]}
    >
      <Text style={[styles.piece, { fontSize: squareSize * 0.6 }]}>
        {getPieceEmoji(piece)}
      </Text>
    </Animated.View>
  );
};

export const ChessBoard = React.forwardRef<View, ChessBoardProps>(
  ({
    size = defaultBoardConfig.size,
    squareSize: providedSquareSize,
    borderRadius = defaultBoardConfig.borderRadius,
    isInteractive = defaultBoardConfig.isInteractive,
    disabledOpacity = defaultBoardConfig.disabledOpacity,
    boardTheme = 'green',
    themeMode = 'light',
    orientation = 'white',
    sideToMove = 'w',
    myColor = 'w',
    lastMove = null,
    fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    isLocalGame = false,
    animateMovements = true,
    onMove,
  }, ref) => {
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [legalMoves, setLegalMoves] = useState<Square[]>([]);
    const [animatingPiece, setAnimatingPiece] = useState<AnimatedPiece | null>(null);
    const [reduceMotion, setReduceMotion] = useState(false);
    const prevFenRef = useRef<string | null>(null);
    
    // Check for reduced motion preference
    useEffect(() => {
      AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
        setReduceMotion(enabled);
      });
    }, []);
    
    // Parse the FEN to get the board state
    const board = useMemo(() => {
      return parseFEN(fen);
    }, [fen]);
    
    // Clear selection when FEN changes (after a move is made)
    useEffect(() => {
      // Skip on initial mount
      if (prevFenRef.current !== null && prevFenRef.current !== fen) {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
      prevFenRef.current = fen;
    }, [fen]);
    
    // Ensure boardSize is never undefined
    const boardSize = size || 320;
    const squareSize = providedSquareSize || Math.floor(boardSize / 8);
    
    // Get board colors from theme config
    const themeColors = getBoardColors(boardTheme, themeMode);

    const toAlgebraic = (file: number, rank: number): string => {
      return String.fromCharCode(97 + file) + (rank + 1);
    };

    const isLightSquare = (file: number, rank: number): boolean => {
      return (file + rank) % 2 === 0;
    };

    /**
     * Check if a square has a piece of the current side to move
     * For local games, check against sideToMove instead of myColor
     */
    const hasOwnPiece = (file: number, rank: number): boolean => {
      const piece = board[rank][file];
      const colorToCheck = isLocalGame ? sideToMove : myColor;
      return !!piece && piece.color === colorToCheck;
    };

    /**
     * Check if a move is valid (delegated to utils)
     */
    const isValidMove = (
      fromFile: number,
      fromRank: number,
      toFile: number,
      toRank: number,
      piece: Piece
    ): boolean => validateMove(board, fromFile, fromRank, toFile, toRank, piece, lastMove || undefined);

    const handleSquarePress = async (file: number, rank: number) => {
      if (!isInteractive) {
        return;
      }
      
      // For online games, only allow moves when it's your turn
      // For local pass-and-play games, allow both sides to move
      if (!isLocalGame && sideToMove !== myColor) {
        return;
      }

      if (!selectedSquare) {
        // Select a piece
        if (hasOwnPiece(file, rank)) {
          setSelectedSquare({ file, rank });
          
          // Calculate legal moves for this piece
          const piece = board[rank][file];
          if (piece) {
            const moves: Square[] = [];
            for (let r = 0; r < 8; r++) {
              for (let f = 0; f < 8; f++) {
                if (isValidMove(file, rank, f, r, piece)) {
                  moves.push({ file: f, rank: r });
                }
              }
            }
            setLegalMoves(moves);
          }
        }
      } else {
        // Try to move the selected piece
        const fromAlgebraic = toAlgebraic(selectedSquare.file, selectedSquare.rank);
        const toAlgebraicStr = toAlgebraic(file, rank);
        const fromPiece = board[selectedSquare.rank][selectedSquare.file];

        // Check if destination is our own piece
        if (hasOwnPiece(file, rank)) {
          setSelectedSquare({ file, rank });
          return;
        }

        // Validate move based on piece type
        if (!fromPiece) {
          setSelectedSquare(null);
          return;
        }
        
        const isValid = isValidMove(selectedSquare.file, selectedSquare.rank, file, rank, fromPiece);
        
        if (!isValid) {
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }

        // Execute the move with animation
        if (onMove) {
          try {
            // Check if destination has a piece (capture)
            const isCapture = !!board[rank][file];
            
            // Haptic feedback
            if (Platform.OS !== 'web') {
              if (isCapture) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }
            
            // Start animation if motion is enabled
            if (!reduceMotion && animateMovements) {
              setAnimatingPiece({
                id: `${fromAlgebraic}-${toAlgebraicStr}-${Date.now()}`,
                piece: fromPiece,
                fromFile: selectedSquare.file,
                fromRank: selectedSquare.rank,
                toFile: file,
                toRank: rank,
                isCapture,
              });
            }
            
            await onMove(fromAlgebraic, toAlgebraicStr);
            setSelectedSquare(null);
            setLegalMoves([]);
            
            // Clear animation after move completes
            if (!reduceMotion && animateMovements) {
              setTimeout(() => setAnimatingPiece(null), enhancedMotionTokens.duration.normal);
            }
          } catch {
            setSelectedSquare(null);
            setLegalMoves([]);
            setAnimatingPiece(null);
          }
        }
      }
    };

    const { colors } = useThemeTokens();
    const lightColor = themeColors.lightSquare;
    const darkColor = themeColors.darkSquare;
    const selectedColor = colors.accent.primary;
    const checkColor = colors.error; // Red for check
    const boardBg = themeColors.background;

    // Detect if current player is in check
    const isMyKingInCheck = isKingInCheck(board, myColor);

    return (
      <View
        ref={ref}
        style={[
          styles.board,
          {
            width: boardSize,
            height: boardSize,
            borderRadius: borderRadius,
            backgroundColor: boardBg,
            opacity: !isInteractive || sideToMove !== myColor ? disabledOpacity : 1,
            position: 'relative',
            overflow: 'hidden',
          },
        ]}
      >
        {Array.from({ length: 8 }).map((_, rankIdx) => {
          const rank = orientation === 'white' ? 7 - rankIdx : rankIdx;
          return (
            <View key={rank} style={styles.row}>
              {Array.from({ length: 8 }).map((_, fileIdx) => {
                const file = orientation === 'white' ? fileIdx : 7 - fileIdx;
                const isLight = isLightSquare(file, rank);
                const isSelected =
                  selectedSquare?.file === file &&
                  selectedSquare?.rank === rank;
                const isLegalMove = legalMoves.some(m => m.file === file && m.rank === rank);
                const piece = board[rank][file];
                
                // Hide piece if it's currently animating from this square
                const isAnimatingFrom = animatingPiece?.fromFile === file && animatingPiece?.fromRank === rank;
                
                // Check if this square contains the king in check
                const isKingInCheckOnSquare = isMyKingInCheck && piece?.type === 'K' && piece.color === myColor;
                
                // Calculate background color
                const squareBackgroundColor = isKingInCheckOnSquare
                  ? checkColor
                  : isSelected
                  ? selectedColor
                  : isLight
                  ? lightColor
                  : darkColor;
                
                // Animated check indicator
                const CheckIndicator = () => {
                  const pulseOpacity = useSharedValue(1);
                  const pulseScale = useSharedValue(1);
                  
                  useEffect(() => {
                    // Continuous pulse animation
                    pulseOpacity.value = withSequence(
                      withTiming(0.6, { duration: 600 }),
                      withTiming(1, { duration: 600 })
                    );
                    pulseScale.value = withSequence(
                      withTiming(1.05, { duration: 600 }),
                      withTiming(1, { duration: 600 })
                    );
                  }, []);
                  
                  const pulseStyle = useAnimatedStyle(() => ({
                    opacity: pulseOpacity.value,
                    transform: [{ scale: pulseScale.value }],
                  }));
                  
                  return (
                    <Animated.View
                      style={[
                        {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: checkColor,
                          opacity: 0.3,
                        },
                        pulseStyle,
                      ]}
                    />
                  );
                };

                return (
                  <Pressable
                    key={`${file}-${rank}`}
                    onPress={() => handleSquarePress(file, rank)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[
                      styles.square,
                      {
                        width: squareSize,
                        height: squareSize,
                        backgroundColor: squareBackgroundColor,
                      },
                    ]}
                  >
                    {/* Pulsing check indicator overlay */}
                    {isKingInCheckOnSquare && <CheckIndicator />}
                    
                    {piece && !isAnimatingFrom ? (
                      <View style={styles.pieceContainer}>
                        <Text style={[styles.piece, { fontSize: squareSize * 0.6 }]}>
                          {getPieceEmoji(piece)}
                        </Text>
                      </View>
                    ) : null}
                    {isLegalMove && !piece && (
                      <View style={[
                        styles.legalMoveIndicator,
                        { width: squareSize * 0.25, height: squareSize * 0.25 }
                      ]} />
                    )}
                    {isLegalMove && piece && (
                      <View style={[
                        styles.legalMoveCaptureIndicator,
                        { 
                          width: squareSize * 0.9, 
                          height: squareSize * 0.9,
                          borderWidth: squareSize * 0.08,
                        }
                      ]} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        
        {/* Animated piece overlay */}
        {animatingPiece && !reduceMotion && (
          <AnimatedPieceComponent
            piece={animatingPiece.piece}
            fromFile={animatingPiece.fromFile}
            fromRank={animatingPiece.fromRank}
            toFile={animatingPiece.toFile}
            toRank={animatingPiece.toRank}
            squareSize={squareSize}
            orientation={orientation}
            isCapture={animatingPiece.isCapture}
          />
        )}
      </View>
    );
  }
);

ChessBoard.displayName = 'ChessBoard';

const styles = StyleSheet.create({
  board: {
    borderRadius: 4,
    // Board container shadow for depth
    ...shadowTokens.card,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    margin: 0,
    padding: 0,
  },
  square: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    margin: 0,
    padding: 0,
  },
  pieceContainer: {
    // No shadow - pieces are Unicode text, shadows create rectangles
  },
  piece: {
    textAlign: 'center',
  },
  squareLabel: {
    fontSize: 8,
    color: 'rgba(0, 0, 0, 0.3)',
    fontWeight: '600',
  },
  legalMoveIndicator: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  legalMoveCaptureIndicator: {
    position: 'absolute',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    backgroundColor: 'transparent',
  },
});

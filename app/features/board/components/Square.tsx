import React, { useEffect, useCallback, useMemo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, withRepeat, cancelAnimation } from 'react-native-reanimated';
import type { Piece as EnginePiece } from '@/core/utils/chess';
import { Piece as PieceComponent } from './Piece';
import { getPieceKey } from '@/features/board/types/pieces';
import type { PieceTheme } from '../types/pieces';

type SquareProps = {
  file: number;
  rank: number;
  orientation: 'white' | 'black';
  squareSize: number;
  backgroundColor: string;
  isSelected: boolean;
  isLegalMove: boolean;
  piece: EnginePiece | null;
  isAnimatingFrom?: boolean;
  isKingInCheckOnSquare?: boolean;
  onPress: (file: number, rank: number) => void;
  pieceTheme?: PieceTheme;
  checkColor: string;
  translucentDark: string;
};

/**
 * Memoized Square component for chess board performance.
 * Only re-renders when relevant props change.
 */
export const Square = React.memo<SquareProps>(({
  file,
  rank,
  orientation,
  squareSize,
  backgroundColor,
  isSelected,
  isLegalMove,
  piece,
  isAnimatingFrom,
  isKingInCheckOnSquare,
  onPress,
  pieceTheme,
  checkColor,
  translucentDark,
}) => {
  const pulseOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Only animate when king is in check - avoid unnecessary animations
  useEffect(() => {
    if (isKingInCheckOnSquare) {
      // Start repeating pulse animation only when in check
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1, // infinite repeat
        false
      );
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      // Cancel animations and reset when not in check
      cancelAnimation(pulseOpacity);
      cancelAnimation(pulseScale);
      pulseOpacity.value = 1;
      pulseScale.value = 1;
    }

    return () => {
      // Cleanup animations on unmount
      cancelAnimation(pulseOpacity);
      cancelAnimation(pulseScale);
    };
  }, [isKingInCheckOnSquare, pulseOpacity, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  // Memoize press handler to avoid creating new functions on each render
  const handlePress = useCallback(() => {
    onPress(file, rank);
  }, [onPress, file, rank]);

  // Memoize container style
  const containerStyle = useMemo(() => ({
    width: squareSize,
    height: squareSize,
    backgroundColor,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: isSelected ? 2 : 0,
    borderColor: isSelected ? 'rgba(255,215,0,0.9)' : 'transparent',
  }), [squareSize, backgroundColor, isSelected]);

  // Memoize legal move indicator dimensions
  const legalMoveEmptySize = squareSize * 0.25;
  const legalMoveCaptureSize = squareSize * 0.9;
  const legalMoveBorderWidth = squareSize * 0.08;
  const pieceSize = squareSize * 0.85;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={hitSlop}
      style={containerStyle}
    >
      {/* Pulsing check indicator overlay */}
      {isKingInCheckOnSquare && (
        <Animated.View
          style={[
            styles.checkOverlay,
            { backgroundColor: checkColor },
            pulseStyle,
          ]}
        />
      )}

      {/* Piece */}
      {piece && !isAnimatingFrom ? (
        <PieceComponent
          piece={getPieceKey(piece)}
          theme={pieceTheme ?? 'minimal'}
          size={pieceSize}
          color={piece.color === 'w' ? '#f0f0f0' : '#2c2c2c'}
          animation={{
            fromFile: file,
            fromRank: rank,
            toFile: file,
            toRank: rank,
            squareSize,
            orientation,
            isCapture: false,
          }}
        />
      ) : null}

      {/* Legal move indicators - empty square */}
      {isLegalMove && !piece && (
        <View
          style={[
            styles.legalMoveEmpty,
            {
              width: legalMoveEmptySize,
              height: legalMoveEmptySize,
              backgroundColor: translucentDark,
            },
          ]}
        />
      )}

      {/* Legal move indicators - capture square */}
      {isLegalMove && piece && (
        <View
          style={[
            styles.legalMoveCapture,
            {
              width: legalMoveCaptureSize,
              height: legalMoveCaptureSize,
              borderWidth: legalMoveBorderWidth,
              borderColor: translucentDark,
            },
          ]}
        />
      )}
    </Pressable>
  );
});

Square.displayName = 'Square';

// Static values moved outside component
const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

const styles = StyleSheet.create({
  checkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.28,
  },
  legalMoveEmpty: {
    position: 'absolute',
    borderRadius: 100,
  },
  legalMoveCapture: {
    position: 'absolute',
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
});

import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, } from 'react-native-reanimated';
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

export const Square: React.FC<SquareProps> = ({
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

  useEffect(() => {
    pulseOpacity.value = withSequence(
      withTiming(0.6, { duration: 600 }),
      withTiming(1, { duration: 600 })
    );
    pulseScale.value = withSequence(
      withTiming(1.05, { duration: 600 }),
      withTiming(1, { duration: 600 })
    );
  }, [pulseOpacity, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Pressable
      key={`${file}-${rank}`}
      onPress={() => onPress(file, rank)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={{
        width: squareSize,
        height: squareSize,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: isSelected ? 2 : 0,
        borderColor: isSelected ? 'rgba(255,215,0,0.9)' : 'transparent',
      }}
    >
      {/* Pulsing check indicator overlay */}
      {isKingInCheckOnSquare && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: checkColor,
              opacity: 0.28,
            },
            pulseStyle,
          ]}
        />
      )}

      {/* Piece */}
      {piece && !isAnimatingFrom ? (
        <View style={{}}>
          <PieceComponent
            piece={getPieceKey(piece)}
            theme={pieceTheme ?? 'minimal'}
            size={squareSize * 0.85}
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
        </View>
      ) : null}

      {/* Legal move indicators */}
      {isLegalMove && !piece && (
        <View
          style={{
            position: 'absolute',
            borderRadius: 100,
            width: squareSize * 0.25,
            height: squareSize * 0.25,
            backgroundColor: translucentDark,
          }}
        />
      )}

      {isLegalMove && piece && (
        <View
          style={{
            position: 'absolute',
            borderRadius: 4,
            width: squareSize * 0.9,
            height: squareSize * 0.9,
            borderWidth: squareSize * 0.08,
            borderColor: translucentDark,
            backgroundColor: 'transparent',
          }}
        />
      )}
    </Pressable>
  );
};

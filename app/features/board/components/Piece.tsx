import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import type { PieceProps } from '../types/pieces';
import { pieceSets } from '@/features/board';
import { getPieceName, parsePieceKey } from '../types/pieces';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { enhancedMotionTokens } from '@/ui/tokens/enhanced-motion';
import { shadowTokens } from '@/ui/tokens/shadows';

export const Piece = React.memo<PieceProps>(({
  piece,
  theme,
  size = 45,
  color = 'currentColor',
  style,
  accessibilityLabel,
  animation,
}) => {
  // Shared animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getScreenPosition = (file: number, rank: number, orientation: 'white' | 'black', squareSize: number) => {
    const displayFile = orientation === 'white' ? file : 7 - file;
    const displayRank = orientation === 'white' ? 7 - rank : rank;
    return {
      x: displayFile * squareSize,
      y: displayRank * squareSize,
    };
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const { fromFile, fromRank, toFile, toRank, squareSize, orientation, isCapture, isOverlay = false } = animation;

  // Compute positions
  const fromPos = getScreenPosition(fromFile, fromRank, orientation, squareSize);
  const toPos = getScreenPosition(toFile, toRank, orientation, squareSize);
  const deltaX = toPos.x - fromPos.x;
  const deltaY = toPos.y - fromPos.y;

  React.useEffect(() => {
    translateX.value = withTiming(deltaX, {
      duration: enhancedMotionTokens.duration.normal,
      easing: Easing.out(Easing.cubic),
    });

    translateY.value = withTiming(deltaY, {
      duration: enhancedMotionTokens.duration.normal,
      easing: Easing.out(Easing.cubic),
    });

    if (isCapture) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [deltaX, deltaY, isCapture, translateX, translateY, scale]);

  // Get piece set (fall back to minimal for missing or emoji themes)
  const pieceSet = useMemo(() => {
    const set = pieceSets[theme];
    if (!set || set.type === 'emoji') {
      if (__DEV__ && set?.type === 'emoji') {
        console.warn(`Piece theme "${theme}" is emoji-based and deprecated; falling back to 'minimal' SVG theme.`);
      }
      return pieceSets.minimal;
    }
    return set;
  }, [theme]);

  const PieceComponent = useMemo(() => {
    const component = pieceSet.pieces[piece];
    if (!component) {
      if (__DEV__) {
        console.error(`Piece "${piece}" not found in theme "${theme}"`);
      }
      return null;
    }
    return component;
  }, [pieceSet.pieces, piece, theme]);

  const shouldRenderPlaceholder = false;

  const a11yLabel = accessibilityLabel || getPieceName(piece);

  if (isOverlay) {
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
            ...shadowTokens.sm,
          },
          animatedStyle,
        ]}
        accessible
        accessibilityLabel={a11yLabel}
        accessibilityRole="image"
      >
        <View style={[styles.container, { width: size, height: size }, style]}>
          {shouldRenderPlaceholder ? (
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color || 'rgba(0,0,0,0.1)',
              }}
            />
          ) : (
            (() => {
              const { color: pieceColor } = parsePieceKey(piece);
              const strokeColor = pieceColor === 'w' ? '#000' : color;
              const strokeWidth = Math.max(0.5, Math.round(size * 0.06));
              return (
                <PieceComponent
                  width={size}
                  height={size}
                  color={color}
                  fill={color}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={styles.svg}
                />
              );
            })()
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        },
        animatedStyle,
      ]}
      accessible
      accessibilityLabel={a11yLabel}
      accessibilityRole="image"
    >
      <View style={[styles.container, { width: size, height: size }, style]}>
        {shouldRenderPlaceholder ? (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color || 'rgba(0,0,0,0.1)',
            }}
          />
        ) : (
          (() => {
            const { color: pieceColor } = parsePieceKey(piece);
            const strokeColor = pieceColor === 'w' ? '#000' : color;
            const strokeWidth = Math.max(0.5, Math.round(size * 0.06));
            return (
              <PieceComponent
                width={size}
                height={size}
                color={color}
                fill={color}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={styles.svg}
              />
            );
          })()
        )}
      </View>
    </Animated.View>
  );
});

Piece.displayName = 'Piece';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});

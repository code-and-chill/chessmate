/**
 * Piece Component
 * 
 * Renders individual chess pieces with theme support.
 * Handles both SVG and emoji-based piece sets.
 * 
 * Features:
 * - Multi-theme support via registry
 * - Dynamic sizing and coloring
 * - Performance optimized with React.memo
 * - Graceful fallback for missing pieces
 * - Accessibility labels
 * 
 * @see docs/PIECE_SYSTEM_UPGRADE_PLAN.md
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import type { PieceProps } from '../types/pieces';
import { pieceSets } from '../config/pieceSetRegistry';
import { getPieceName } from '../types/pieces';

/**
 * Piece Component
 * 
 * @example
 * ```tsx
 * <Piece piece="wK" theme="minimal" size={45} />
 * <Piece piece="bQ" theme="minimal" size={60} color="#667EEA" />
 * ```
 */
export const Piece = React.memo<PieceProps>(({
  piece,
  theme,
  size = 45,
  color = 'currentColor',
  style,
  accessibilityLabel,
}) => {
  // Get piece set, fallback to minimal if theme not found
  const pieceSet = useMemo(() => {
    if (!pieceSets[theme]) {
      if (__DEV__) {
        console.warn(`Piece theme "${theme}" not found, falling back to minimal`);
      }
      return pieceSets.minimal || pieceSets.classic;
    }
    return pieceSets[theme];
  }, [theme]);

  // Get piece component/emoji from set
  const PieceComponent = useMemo(() => {
    const component = pieceSet.pieces[piece];
    if (!component) {
      if (__DEV__) {
        console.error(`Piece "${piece}" not found in theme "${theme}"`);
      }
      return null;
    }
    return component;
  }, [pieceSet, piece]);

  if (!PieceComponent) {
    return null;
  }

  // Generate accessibility label
  const a11yLabel = accessibilityLabel || getPieceName(piece);

  // Handle emoji pieces (classic theme)
  if (pieceSet.type === 'emoji') {
    return (
      <View
        style={[styles.container, { width: size, height: size }, style]}
        accessible
        accessibilityLabel={a11yLabel}
        accessibilityRole="image"
      >
        <Text style={[styles.emoji, { fontSize: size * 0.85, color }]}>
          {PieceComponent}
        </Text>
      </View>
    );
  }

  // Handle SVG pieces
  return (
    <View
      style={[styles.container, { width: size, height: size }, style]}
      accessible
      accessibilityLabel={a11yLabel}
      accessibilityRole="image"
    >
      <PieceComponent
        width={size}
        height={size}
        color={color}
        fill={color}
        stroke={color}
        style={styles.svg}
      />
    </View>
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
  emoji: {
    textAlign: 'center',
    lineHeight: undefined, // Let platform handle it
  },
});

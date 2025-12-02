/**
 * MoveList Component
 * app/ui/components/chess/MoveList.tsx
 * 
 * Displays chess game moves in standard algebraic notation (SAN)
 * Features: Move navigation, annotations, variations, timestamps
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Text } from '../../primitives/Text';
import { colorTokens, getColor } from '../../tokens/colors';
import { spacingTokens, spacingScale } from '../../tokens/spacing';
import { radiusTokens } from '../../tokens/radii';
import { textVariants } from '../../tokens/typography';
import { motionTokens, microInteractions } from '../../tokens/motion';
import { useIsDark } from '../../hooks/useThemeTokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type Move = {
  moveNumber: number;
  white?: {
    san: string; // Standard Algebraic Notation (e.g., "Nf3", "exd5")
    from: string;
    to: string;
    timestamp?: number; // Time remaining (seconds)
    annotation?: string; // !!, !, !?, ?!, ?, ??
  };
  black?: {
    san: string;
    from: string;
    to: string;
    timestamp?: number;
    annotation?: string;
  };
};

type MoveListProps = {
  moves: Move[];
  currentMoveIndex?: number; // Index in flattened move list
  onMovePress?: (moveIndex: number) => void;
  variant?: 'compact' | 'detailed' | 'inline';
  showTimestamps?: boolean;
  showAnnotations?: boolean;
  isDark?: boolean;
};

/**
 * MoveList Component
 * 
 * @example
 * ```tsx
 * <MoveList
 *   moves={[
 *     { moveNumber: 1, white: { san: 'e4' }, black: { san: 'e5' } },
 *     { moveNumber: 2, white: { san: 'Nf3' }, black: { san: 'Nc6' } },
 *   ]}
 *   currentMoveIndex={2}
 *   onMovePress={(index) => jumpToMove(index)}
 * />
 * ```
 */
export const MoveList: React.FC<MoveListProps> = ({
  moves,
  currentMoveIndex,
  onMovePress,
  variant = 'detailed',
  showTimestamps = false,
  showAnnotations = true,
  isDark: isDarkProp,
}) => {
  const isDarkTheme = useIsDark();
  const isDark = isDarkProp ?? isDarkTheme;
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to current move
  useEffect(() => {
    if (currentMoveIndex !== undefined && scrollViewRef.current) {
      // Scroll with slight delay for smooth UX
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentMoveIndex]);

  const renderMove = (
    move: Move,
    side: 'white' | 'black',
    flatIndex: number
  ) => {
    const moveData = move[side];
    if (!moveData) return null;

    const isCurrent = flatIndex === currentMoveIndex;
    const isPast = currentMoveIndex !== undefined && flatIndex < currentMoveIndex;

    return (
      <MoveItem
        key={`${move.moveNumber}-${side}`}
        san={moveData.san}
        annotation={showAnnotations ? moveData.annotation : undefined}
        timestamp={showTimestamps ? moveData.timestamp : undefined}
        isCurrent={isCurrent}
        isPast={isPast}
        onPress={() => onMovePress?.(flatIndex)}
        variant={variant}
        isDark={isDark}
      />
    );
  };

  if (variant === 'inline') {
    // Inline: 1.e4 e5 2.Nf3 Nc6 3.Bb5
    const flatMoves: string[] = [];
    moves.forEach((move) => {
      if (move.white) {
        flatMoves.push(`${move.moveNumber}.${move.white.san}`);
      }
      if (move.black) {
        flatMoves.push(move.black.san);
      }
    });

    return (
      <View style={styles.inlineContainer}>
        <Text
          {...textVariants.body}
          style={{ color: getColor(colorTokens.neutral[700], isDark) }}
        >
          {flatMoves.join(' ')}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getColor(colorTokens.neutral[50], isDark),
          borderColor: getColor(colorTokens.neutral[200], isDark),
        },
      ]}
      accessibilityRole="list"
      accessibilityLabel="Chess game moves"
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: getColor(colorTokens.neutral[200], isDark) },
        ]}
      >
        <Text
          {...textVariants.caption}
          style={[
            styles.headerText,
            { color: getColor(colorTokens.neutral[600], isDark) },
          ]}
        >
          MOVES
        </Text>
        {moves.length > 0 && (
          <Text
            {...textVariants.caption}
            style={{ color: getColor(colorTokens.neutral[500], isDark) }}
          >
            {moves.length} moves
          </Text>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.movesContainer}
        showsVerticalScrollIndicator={variant === 'detailed'}
      >
        {moves.length === 0 ? (
          <View style={styles.emptyState}>
            <Text
              {...textVariants.body}
              style={{ color: getColor(colorTokens.neutral[500], isDark) }}
            >
              No moves yet
            </Text>
          </View>
        ) : (
          moves.map((move) => {
            const whiteIndex = (move.moveNumber - 1) * 2;
            const blackIndex = whiteIndex + 1;

            return (
              <View key={move.moveNumber} style={styles.moveRow}>
                <Text
                  {...textVariants.caption}
                  style={[
                    styles.moveNumber,
                    { color: getColor(colorTokens.neutral[500], isDark) },
                  ]}
                >
                  {move.moveNumber}.
                </Text>
                <View style={styles.movePair}>
                  {renderMove(move, 'white', whiteIndex)}
                  {renderMove(move, 'black', blackIndex)}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

type MoveItemProps = {
  san: string;
  annotation?: string;
  timestamp?: number;
  isCurrent: boolean;
  isPast: boolean;
  onPress?: () => void;
  variant: 'compact' | 'detailed';
  isDark: boolean;
};

const MoveItem: React.FC<MoveItemProps> = ({
  san,
  annotation,
  timestamp,
  isCurrent,
  isPast,
  onPress,
  variant,
  isDark,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(microInteractions.scalePress, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.moveItem,
        variant === 'detailed' && styles.moveItemDetailed,
        animatedStyle,
        {
          backgroundColor: isCurrent
            ? getColor(colorTokens.blue[100], isDark)
            : isPast
            ? getColor(colorTokens.neutral[100], isDark)
            : 'transparent',
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Move ${san}${annotation ? ` ${annotation}` : ''}`}
      accessibilityState={{
        selected: isCurrent,
      }}
    >
      <View style={styles.moveContent}>
        <Text
          {...textVariants.body}
          style={[
            styles.moveText,
            {
              color: isCurrent
                ? getColor(colorTokens.blue[900], isDark)
                : getColor(colorTokens.neutral[900], isDark),
              fontWeight: isCurrent ? '600' : '400',
            },
          ]}
        >
          {san}
          {annotation && (
            <Text
              {...textVariants.caption}
              style={{
                color: getColor(colorTokens.orange[600], isDark),
                marginLeft: spacingTokens[1],
              }}
            >
              {annotation}
            </Text>
          )}
        </Text>

        {variant === 'detailed' && timestamp !== undefined && (
          <Text
            {...textVariants.caption}
            style={[
              styles.timestamp,
              { color: getColor(colorTokens.neutral[500], isDark) },
            ]}
          >
            {formatTime(timestamp)}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: radiusTokens.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingScale.gutter,
    paddingVertical: spacingTokens[2],
    borderBottomWidth: 1,
  },
  headerText: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  movesContainer: {
    padding: spacingScale.gap,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingTokens[6],
  },
  moveRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacingTokens[1],
  },
  moveNumber: {
    width: 32,
    textAlign: 'right',
    marginRight: spacingTokens[2],
    paddingTop: spacingTokens[2],
  },
  movePair: {
    flex: 1,
    flexDirection: 'row',
    gap: spacingTokens[1],
  },
  moveItem: {
    flex: 1,
    paddingHorizontal: spacingTokens[2],
    paddingVertical: spacingTokens[2],
    borderRadius: radiusTokens.sm,
    minHeight: 32,
    justifyContent: 'center',
  },
  moveItemDetailed: {
    minHeight: 36,
  },
  moveContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moveText: {
    flex: 1,
  },
  timestamp: {
    marginLeft: spacingTokens[2],
  },
  inlineContainer: {
    padding: spacingScale.gutter,
  },
});

/**
 * Evaluation Bar Component
 * app/ui/components/chess/EvaluationBar.tsx
 * 
 * Visual representation of chess position evaluation
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Text } from '../../primitives/Text';
import { spacingTokens } from '../../tokens/spacing';
import { colorTokens, getColor } from '../../tokens/colors';

export type EvaluationBarProps = {
  /**
   * Evaluation score from engine (centipawns)
   * Positive = white advantage, negative = black advantage
   */
  evaluation: number;
  
  /**
   * Is this a mate score?
   */
  isMate?: boolean;
  
  /**
   * Mate in N moves (if isMate is true)
   */
  mateIn?: number;
  
  /**
   * Show evaluation number
   */
  showScore?: boolean;
  
  /**
   * Bar width
   */
  width?: number;
  
  /**
   * Bar height
   */
  height?: number;
  
  isDark?: boolean;
};

/**
 * Convert centipawn evaluation to percentage (0-100)
 * 0 = black winning, 50 = equal, 100 = white winning
 */
const evaluationToPercentage = (evaluation: number): number => {
  // Cap at +/- 10 pawns (1000 centipawns)
  const cappedEval = Math.max(-1000, Math.min(1000, evaluation));
  
  // Convert to percentage: -1000 -> 0%, 0 -> 50%, 1000 -> 100%
  return ((cappedEval + 1000) / 2000) * 100;
};

/**
 * Format evaluation for display
 */
const formatEvaluation = (evaluation: number, isMate?: boolean, mateIn?: number): string => {
  if (isMate && mateIn !== undefined) {
    return mateIn > 0 ? `M${mateIn}` : `M${Math.abs(mateIn)}`;
  }
  
  const pawns = Math.abs(evaluation) / 100;
  const sign = evaluation > 0 ? '+' : '';
  
  if (Math.abs(evaluation) < 10) {
    return '0.0';
  }
  
  return `${sign}${pawns.toFixed(1)}`;
};

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  isMate = false,
  mateIn,
  showScore = true,
  width = 40,
  height = 400,
  isDark = false,
}) => {
  const percentage = evaluationToPercentage(evaluation);
  
  const whiteHeight = useAnimatedStyle(() => {
    return {
      height: withSpring(`${percentage}%`, {
        damping: 15,
        stiffness: 100,
      }),
    };
  }, [percentage]);

  const whiteColor = getColor(colorTokens.neutral[50], isDark);
  const blackColor = getColor(colorTokens.neutral[900], isDark);
  
  const displayScore = formatEvaluation(evaluation, isMate, mateIn);
  const scoreColor = evaluation > 0 ? whiteColor : blackColor;
  const scorePosition = percentage > 50 ? 'bottom' : 'top';

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Black section (top) */}
      <View style={[styles.section, { backgroundColor: blackColor }]}>
        {showScore && scorePosition === 'top' && (
          <View style={styles.scoreContainer}>
            <Text
              size="xs"
              weight="bold"
              color={scoreColor}
              style={styles.scoreText}
            >
              {displayScore}
            </Text>
          </View>
        )}
      </View>
      
      {/* White section (bottom) */}
      <Animated.View
        style={[
          styles.section,
          styles.whiteSection,
          { backgroundColor: whiteColor },
          whiteHeight,
        ]}
      >
        {showScore && scorePosition === 'bottom' && (
          <View style={styles.scoreContainer}>
            <Text
              size="xs"
              weight="bold"
              color={scoreColor}
              style={styles.scoreText}
            >
              {displayScore}
            </Text>
          </View>
        )}
      </Animated.View>
      
      {/* Center line */}
      <View style={styles.centerLine} />
    </View>
  );
};

EvaluationBar.displayName = 'EvaluationBar';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB', // Note: This should be dynamically set via props or styled-components for theme support
  },
  
  section: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  whiteSection: {
    bottom: 0,
  },
  
  scoreContainer: {
    paddingVertical: 4,
  },
  
  scoreText: {
    textAlign: 'center',
  },
  
  centerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: '#9CA3AF', // Note: This should be dynamically set via props or styled-components for theme support
    opacity: 0.5,
  },
});

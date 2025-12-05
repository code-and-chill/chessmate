/**
 * EvalGraph Component
 * 
 * Centipawn evaluation timeline showing position advantage throughout the game.
 * Features critical moment markers, mate detection, and game phase dividers.
 * 
 * Usage:
 * ```tsx
 * <EvalGraph
 *   evaluations={[20, 45, 30, -15, -50, -200]}
 *   criticalMoments={[3, 5]}
 *   phases={{ opening: 8, middlegame: 25, endgame: 35 }}
 * />
 * ```
 */

import React, {useCallback, useMemo} from 'react';
import { View, StyleSheet, Dimensions, Text as RNText } from 'react-native';
import Svg, { Path, Line, Circle, Rect, Text as SvgText, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useIsDark, useColors } from '../../hooks/useThemeTokens';
import { feedbackColorTokens } from '../../tokens/feedback';
import { spacingTokens } from '../../tokens/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_WIDTH = Math.min(SCREEN_WIDTH - spacingTokens[8], 600);
const DEFAULT_HEIGHT = 200;
const MAX_EVAL_DISPLAY = 500; // Cap display at +/-5.00 pawns

export type EvalDataPoint = {
  moveNumber: number;
  evaluation: number; // Centipawns from white's perspective
  isMate?: boolean;
  mateIn?: number; // Moves to mate (positive = white wins, negative = black wins)
  isCritical?: boolean; // Major swing
};

export type GamePhases = {
  opening: number; // Last move of opening
  middlegame: number; // Last move of middlegame
  endgame: number; // Last move of endgame
};

export type EvalGraphProps = {
  /**
   * Evaluation data (centipawns from white's perspective)
   * Can be simple numbers or detailed data points
   */
  evaluations: number[] | EvalDataPoint[];
  
  /**
   * Player perspective (white or black)
   */
  playerColor?: 'white' | 'black';
  
  /**
   * Move numbers of critical moments (blunders, missed wins)
   */
  criticalMoments?: number[];
  
  /**
   * Game phase boundaries
   */
  phases?: GamePhases;
  
  /**
   * Graph width
   */
  width?: number;
  
  /**
   * Graph height
   */
  height?: number;
  
  /**
   * Show zero line
   */
  showZeroLine?: boolean;
  
  /**
   * Show phase dividers
   */
  showPhases?: boolean;
  
  /**
   * Animated entrance
   */
  animated?: boolean;
  
  /**
   * Animation delay (ms)
   */
  delay?: number;
  
  /**
   * Callback when critical moment is pressed
   */
  onCriticalMomentPress?: (moveNumber: number) => void;
};

/**
 * EvalGraph Component
 * 
 * Chess.com-style evaluation chart with critical moment markers and phase dividers.
 */
export const EvalGraph: React.FC<EvalGraphProps> = ({
  evaluations,
  playerColor = 'white',
  criticalMoments = [],
  phases,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  showZeroLine = true,
  showPhases = true,
  animated = true,
  delay = 0,
  onCriticalMomentPress,
}) => {
  const isDark = useIsDark();
  const colors = useColors();
  
  // Normalize data to simple number arrays
  const evalNumbers = useMemo(() => 
    evaluations.map(e => {
      const val = typeof e === 'number' ? e : e.evaluation;
      // Clamp to display range
      return Math.max(-MAX_EVAL_DISPLAY, Math.min(MAX_EVAL_DISPLAY, val));
    }),
    [evaluations]
  );
  
  // Graph dimensions
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  
  // Scale functions
  const xScale = (index: number, dataLength: number) => {
    return (index / (dataLength - 1)) * graphWidth + padding.left;
  };
  
  const yScale = (evaluation: number) => {
    // Map -MAX_EVAL_DISPLAY to MAX_EVAL_DISPLAY to graphHeight
    const normalized = (evaluation + MAX_EVAL_DISPLAY) / (2 * MAX_EVAL_DISPLAY);
    return padding.top + graphHeight - normalized * graphHeight;
  };
  
  const zeroY = yScale(0);
  
  // Generate SVG path for area chart
  const generatePath = useCallback((data: number[]): string => {
    if (data.length === 0) return '';

    return data.map((evaluation, index) => {
      const x = xScale(index, data.length);
      const y = yScale(evaluation);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  });
  
  const evalPath = useMemo(() => generatePath(evalNumbers), [generatePath, evalNumbers]);
  
  // Generate filled area path (close to zero line)
  const filledAreaPath = useMemo(() => {
    if (evalNumbers.length === 0) return '';
    
    const linePath = generatePath(evalNumbers);
    const lastX = xScale(evalNumbers.length - 1, evalNumbers.length);
    const firstX = xScale(0, evalNumbers.length);
    
    return `${linePath} L ${lastX} ${zeroY} L ${firstX} ${zeroY} Z`;
  }, [evalNumbers, generatePath, xScale, zeroY]);
  
  // Advantage colors
  const whiteAdvantageColor = feedbackColorTokens.coach.positive.primary[isDark ? 'dark' : 'light'];
  const blackAdvantageColor = feedbackColorTokens.coach.neutral.primary[isDark ? 'dark' : 'light'];
  const criticalColor = feedbackColorTokens.moveQuality.blunder.primary[isDark ? 'dark' : 'light'];
  
  // Phase colors
  const phaseColors = {
    opening: feedbackColorTokens.gamePhase.opening.primary[isDark ? 'dark' : 'light'],
    middlegame: feedbackColorTokens.gamePhase.middlegame.primary[isDark ? 'dark' : 'light'],
    endgame: feedbackColorTokens.gamePhase.endgame.primary[isDark ? 'dark' : 'light'],
  };
  
  const content = (
    <View style={[styles.container, { width, height }]}>
      {/* Header */}
      <View style={styles.header}>
        <RNText style={[styles.headerText, { color: colors.foreground.primary }]}>
          Position Evaluation
        </RNText>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: whiteAdvantageColor }]} />
            <RNText style={[styles.legendText, { color: colors.foreground.secondary }]}>
              White
            </RNText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBar, { backgroundColor: blackAdvantageColor }]} />
            <RNText style={[styles.legendText, { color: colors.foreground.secondary }]}>
              Black
            </RNText>
          </View>
        </View>
      </View>
      
      {/* Graph */}
      <Svg width={width} height={height - 30} style={styles.svg}>
        <Defs>
          {/* White advantage gradient (positive eval) */}
          <LinearGradient id="whiteAdvantage" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={whiteAdvantageColor} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={whiteAdvantageColor} stopOpacity="0.1" />
          </LinearGradient>
          
          {/* Black advantage gradient (negative eval) */}
          <LinearGradient id="blackAdvantage" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor={blackAdvantageColor} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={blackAdvantageColor} stopOpacity="0.1" />
          </LinearGradient>
          
          {/* Clip path for area above zero */}
          <ClipPath id="clipAboveZero">
            <Rect x={padding.left} y={padding.top} width={graphWidth} height={zeroY - padding.top} />
          </ClipPath>
          
          {/* Clip path for area below zero */}
          <ClipPath id="clipBelowZero">
            <Rect x={padding.left} y={zeroY} width={graphWidth} height={graphHeight - (zeroY - padding.top)} />
          </ClipPath>
        </Defs>
        
        {/* Phase dividers */}
        {showPhases && phases && (
          <>
            {/* Opening */}
            <Line
              x1={xScale(phases.opening, evalNumbers.length)}
              y1={padding.top}
              x2={xScale(phases.opening, evalNumbers.length)}
              y2={height - padding.bottom}
              stroke={phaseColors.opening}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.3}
            />
            <SvgText
              x={xScale(phases.opening, evalNumbers.length)}
              y={padding.top - 5}
              fontSize={9}
              fill={phaseColors.opening}
              opacity={0.6}
              textAnchor="middle"
            >
              Opening
            </SvgText>
            
            {/* Middlegame */}
            <Line
              x1={xScale(phases.middlegame, evalNumbers.length)}
              y1={padding.top}
              x2={xScale(phases.middlegame, evalNumbers.length)}
              y2={height - padding.bottom}
              stroke={phaseColors.middlegame}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.3}
            />
            <SvgText
              x={xScale(phases.middlegame, evalNumbers.length)}
              y={padding.top - 5}
              fontSize={9}
              fill={phaseColors.middlegame}
              opacity={0.6}
              textAnchor="middle"
            >
              Middlegame
            </SvgText>
            
            {/* Endgame label */}
            <SvgText
              x={xScale(phases.endgame, evalNumbers.length)}
              y={padding.top - 5}
              fontSize={9}
              fill={phaseColors.endgame}
              opacity={0.6}
              textAnchor="middle"
            >
              Endgame
            </SvgText>
          </>
        )}
        
        {/* Zero line (equal position) */}
        {showZeroLine && (
          <Line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke={colors.foreground.tertiary}
            strokeWidth={2}
            opacity={0.4}
          />
        )}
        
        {/* Y-axis */}
        <Line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke={colors.foreground.tertiary}
          strokeWidth={1}
          opacity={0.2}
        />
        
        {/* X-axis */}
        <Line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke={colors.foreground.tertiary}
          strokeWidth={1}
          opacity={0.2}
        />
        
        {/* Y-axis labels (eval in pawns) */}
        {[500, 250, 0, -250, -500].map((evalValue) => (
          <SvgText
            key={evalValue}
            x={padding.left - 10}
            y={yScale(evalValue)}
            fontSize={10}
            fill={colors.foreground.secondary}
            textAnchor="end"
            alignmentBaseline="middle"
          >
            {evalValue > 0 ? '+' : ''}{(evalValue / 100).toFixed(1)}
          </SvgText>
        ))}
        
        {/* X-axis labels (move numbers) */}
        {evalNumbers.map((_, index) => {
          if (index % Math.ceil(evalNumbers.length / 5) === 0 || index === evalNumbers.length - 1) {
            return (
              <SvgText
                key={index}
                x={xScale(index, evalNumbers.length)}
                y={height - padding.bottom + 20}
                fontSize={10}
                fill={colors.foreground.secondary}
                textAnchor="middle"
              >
                {index + 1}
              </SvgText>
            );
          }
          return null;
        })}
        
        {/* Area fill - white advantage (clipped above zero) */}
        <Path
          d={filledAreaPath}
          fill="url(#whiteAdvantage)"
          clipPath="url(#clipAboveZero)"
        />
        
        {/* Area fill - black advantage (clipped below zero) */}
        <Path
          d={filledAreaPath}
          fill="url(#blackAdvantage)"
          clipPath="url(#clipBelowZero)"
        />
        
        {/* Evaluation line */}
        {evalPath && (
          <Path
            d={evalPath}
            stroke={colors.accent.primary}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        
        {/* Critical moment markers */}
        {criticalMoments.map((moveNumber) => {
          const index = moveNumber - 1;
          if (index < 0 || index >= evalNumbers.length) return null;
          
          return (
            <React.Fragment key={moveNumber}>
              {/* Vertical line */}
              <Line
                x1={xScale(index, evalNumbers.length)}
                y1={padding.top}
                x2={xScale(index, evalNumbers.length)}
                y2={height - padding.bottom}
                stroke={criticalColor}
                strokeWidth={2}
                opacity={0.3}
              />
              
              {/* Marker circle */}
              <Circle
                cx={xScale(index, evalNumbers.length)}
                cy={yScale(evalNumbers[index])}
                r={6}
                fill={criticalColor}
                stroke={colors.background.primary}
                strokeWidth={2}
              />
              
              {/* Warning icon */}
              <SvgText
                x={xScale(index, evalNumbers.length)}
                y={yScale(evalNumbers[index]) - 15}
                fontSize={16}
                textAnchor="middle"
              >
                ⚠️
              </SvgText>
            </React.Fragment>
          );
        })}
        
        {/* Data point circles */}
        {evalNumbers.map((evaluation, index) => (
          <Circle
            key={`eval-${index}`}
            cx={xScale(index, evalNumbers.length)}
            cy={yScale(evaluation)}
            r={3}
            fill={colors.accent.primary}
            stroke={colors.background.primary}
            strokeWidth={1.5}
          />
        ))}
        
        {/* Axis labels */}
        <SvgText
          x={width / 2}
          y={height - 5}
          fontSize={12}
          fill={colors.foreground.secondary}
          textAnchor="middle"
          fontWeight="600"
        >
          Move Number
        </SvgText>
        
        <SvgText
          x={10}
          y={15}
          fontSize={11}
          fill={colors.foreground.secondary}
          textAnchor="start"
          fontWeight="600"
        >
          Eval
        </SvgText>
      </Svg>
    </View>
  );
  
  if (animated) {
    return (
      <Animated.View entering={FadeInDown.duration(500).delay(delay)}>
        {content}
      </Animated.View>
    );
  }
  
  return content;
};

/**
 * Hook to detect critical moments (eval swings > 150cp)
 */
export const useCriticalMomentDetection = (evaluations: number[]): number[] => {
  return useMemo(() => {
    const criticalMoments: number[] = [];
    
    for (let i = 1; i < evaluations.length; i++) {
      const swing = Math.abs(evaluations[i] - evaluations[i - 1]);
      if (swing > 150) {
        criticalMoments.push(i + 1); // Move numbers are 1-indexed
      }
    }
    
    return criticalMoments;
  }, [evaluations]);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingTokens[2],
    paddingHorizontal: spacingTokens[3],
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
  },
  legendContainer: {
    flexDirection: 'row',
    gap: spacingTokens[4],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingTokens[2],
  },
  legendBar: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  svg: {
    overflow: 'visible',
  },
});

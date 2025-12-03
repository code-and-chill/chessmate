/**
 * AccuracyGraph Component
 * 
 * Per-move accuracy timeline showing player and opponent performance throughout the game.
 * Features threshold markers at 90%, 80%, 70% for visual reference.
 * 
 * Usage:
 * ```tsx
 * <AccuracyGraph
 *   playerData={[95, 92, 88, 85, 90]}
 *   opponentData={[90, 87, 85, 80, 78]}
 *   playerName="You"
 *   opponentName="Opponent"
 * />
 * ```
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text as RNText, Platform } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useIsDark, useColors } from '../../hooks/useThemeTokens';
import { feedbackColorTokens } from '../../tokens/feedback';
import { spacingTokens } from '../../tokens/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_WIDTH = Math.min(SCREEN_WIDTH - spacingTokens[8], 600);
const DEFAULT_HEIGHT = 220;

export type AccuracyDataPoint = {
  moveNumber: number;
  accuracy: number;
  moveQuality?: 'brilliant' | 'best' | 'great' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'blunder' | 'miss';
};

export type AccuracyGraphProps = {
  /**
   * Player accuracy data (array of percentages 0-100)
   * Can be simple numbers or detailed data points
   */
  playerData: number[] | AccuracyDataPoint[];
  
  /**
   * Opponent accuracy data (array of percentages 0-100)
   * Can be simple numbers or detailed data points
   */
  opponentData: number[] | AccuracyDataPoint[];
  
  /**
   * Player display name
   */
  playerName?: string;
  
  /**
   * Opponent display name
   */
  opponentName?: string;
  
  /**
   * Graph width
   */
  width?: number;
  
  /**
   * Graph height
   */
  height?: number;
  
  /**
   * Show threshold lines at 90%, 80%, 70%
   */
  showThresholds?: boolean;
  
  /**
   * Show average accuracy labels
   */
  showAverages?: boolean;
  
  /**
   * Animated entrance
   */
  animated?: boolean;
  
  /**
   * Animation delay (ms)
   */
  delay?: number;
  
  /**
   * Callback when data point is pressed
   */
  onPointPress?: (moveNumber: number, player: 'player' | 'opponent') => void;
};

/**
 * AccuracyGraph Component
 * 
 * Chess.com-style accuracy timeline with player/opponent lines and threshold markers.
 */
export const AccuracyGraph: React.FC<AccuracyGraphProps> = ({
  playerData,
  opponentData,
  playerName = 'You',
  opponentName = 'Opponent',
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  showThresholds = true,
  showAverages = true,
  animated = true,
  delay = 0,
  onPointPress,
}) => {
  const isDark = useIsDark();
  const colors = useColors();
  
  // Normalize data to simple number arrays
  const playerAccuracies = useMemo(() => 
    playerData.map(d => typeof d === 'number' ? d : d.accuracy),
    [playerData]
  );
  
  const opponentAccuracies = useMemo(() => 
    opponentData.map(d => typeof d === 'number' ? d : d.accuracy),
    [opponentData]
  );
  
  // Calculate averages
  const playerAverage = useMemo(() => {
    const sum = playerAccuracies.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / playerAccuracies.length);
  }, [playerAccuracies]);
  
  const opponentAverage = useMemo(() => {
    const sum = opponentAccuracies.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / opponentAccuracies.length);
  }, [opponentAccuracies]);
  
  // Graph dimensions
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;
  
  // Scale functions
  const xScale = (index: number, dataLength: number) => {
    return (index / (dataLength - 1)) * graphWidth + padding.left;
  };
  
  const yScale = (accuracy: number) => {
    // 0% accuracy at bottom, 100% at top
    return padding.top + graphHeight - (accuracy / 100) * graphHeight;
  };
  
  // Generate SVG path for line chart
  const generatePath = (data: number[]): string => {
    if (data.length === 0) return '';
    
    return data.map((accuracy, index) => {
      const x = xScale(index, data.length);
      const y = yScale(accuracy);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };
  
  const playerPath = useMemo(() => generatePath(playerAccuracies), [playerAccuracies, graphWidth, graphHeight]);
  const opponentPath = useMemo(() => generatePath(opponentAccuracies), [opponentAccuracies, graphWidth, graphHeight]);
  
  // Threshold lines
  const thresholds = [
    { value: 90, label: '90%', color: feedbackColorTokens.accuracy.excellent.primary[isDark ? 'dark' : 'light'] },
    { value: 80, label: '80%', color: feedbackColorTokens.accuracy.good.primary[isDark ? 'dark' : 'light'] },
    { value: 70, label: '70%', color: feedbackColorTokens.accuracy.average.primary[isDark ? 'dark' : 'light'] },
  ];
  
  // Player and opponent colors
  const playerColor = feedbackColorTokens.coach.positive.primary[isDark ? 'dark' : 'light'];
  const opponentColor = feedbackColorTokens.coach.neutral.primary[isDark ? 'dark' : 'light'];
  
  const content = (
    <View style={[styles.container, { width, height }]}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: playerColor }]} />
          <RNText style={[styles.legendText, { color: colors.foreground.primary }]}>
            {playerName}
            {showAverages && ` (${playerAverage}%)`}
          </RNText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: opponentColor }]} />
          <RNText style={[styles.legendText, { color: colors.foreground.primary }]}>
            {opponentName}
            {showAverages && ` (${opponentAverage}%)`}
          </RNText>
        </View>
      </View>
      
      {/* Graph */}
      <Svg width={width} height={height - 30} style={styles.svg}>
        <Defs>
          {/* Player gradient fill */}
          <LinearGradient id="playerGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={playerColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={playerColor} stopOpacity="0.05" />
          </LinearGradient>
          
          {/* Opponent gradient fill */}
          <LinearGradient id="opponentGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={opponentColor} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={opponentColor} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        
        {/* Threshold lines */}
        {showThresholds && thresholds.map((threshold) => (
          <React.Fragment key={threshold.value}>
            <Line
              x1={padding.left}
              y1={yScale(threshold.value)}
              x2={width - padding.right}
              y2={yScale(threshold.value)}
              stroke={threshold.color}
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.3}
            />
            <SvgText
              x={padding.left - 8}
              y={yScale(threshold.value)}
              fontSize={10}
              fill={threshold.color}
              opacity={0.6}
              textAnchor="end"
              alignmentBaseline="middle"
            >
              {threshold.label}
            </SvgText>
          </React.Fragment>
        ))}
        
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
        
        {/* X-axis labels (move numbers) */}
        {playerAccuracies.map((_, index) => {
          if (index % Math.ceil(playerAccuracies.length / 5) === 0 || index === playerAccuracies.length - 1) {
            return (
              <SvgText
                key={index}
                x={xScale(index, playerAccuracies.length)}
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
        
        {/* Opponent line with gradient fill */}
        {opponentPath && (
          <>
            <Path
              d={`${opponentPath} L ${xScale(opponentAccuracies.length - 1, opponentAccuracies.length)} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
              fill="url(#opponentGradient)"
            />
            <Path
              d={opponentPath}
              stroke={opponentColor}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        
        {/* Player line with gradient fill */}
        {playerPath && (
          <>
            <Path
              d={`${playerPath} L ${xScale(playerAccuracies.length - 1, playerAccuracies.length)} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`}
              fill="url(#playerGradient)"
            />
            <Path
              d={playerPath}
              stroke={playerColor}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        
        {/* Data point circles (player) */}
        {playerAccuracies.map((accuracy, index) => (
          <Circle
            key={`player-${index}`}
            cx={xScale(index, playerAccuracies.length)}
            cy={yScale(accuracy)}
            r={4}
            fill={playerColor}
            stroke={colors.background.primary}
            strokeWidth={2}
          />
        ))}
        
        {/* Data point circles (opponent) */}
        {opponentAccuracies.map((accuracy, index) => (
          <Circle
            key={`opponent-${index}`}
            cx={xScale(index, opponentAccuracies.length)}
            cy={yScale(accuracy)}
            r={3}
            fill={opponentColor}
            stroke={colors.background.primary}
            strokeWidth={1.5}
          />
        ))}
        
        {/* X-axis label */}
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
        
        {/* Y-axis label */}
        <SvgText
          x={10}
          y={padding.top - 5}
          fontSize={12}
          fill={colors.foreground.secondary}
          textAnchor="start"
          fontWeight="600"
        >
          Accuracy %
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
 * Hook to calculate accuracy from moves
 */
export const useAccuracyCalculation = (moves: any[]) => {
  return useMemo(() => {
    return moves.map((move, index) => {
      // Calculate accuracy based on eval difference
      // This is a simplified version - actual implementation would use engine evaluation
      const baseAccuracy = 95;
      const randomVariation = Math.random() * 10 - 5;
      return Math.max(0, Math.min(100, baseAccuracy + randomVariation));
    });
  }, [moves]);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacingTokens[6],
    marginBottom: spacingTokens[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingTokens[2],
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  svg: {
    overflow: 'visible',
  },
});

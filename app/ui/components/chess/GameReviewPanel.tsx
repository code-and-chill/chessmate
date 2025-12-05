/**
 * GameReviewPanel Composite Component
 * 
 * Reusable multi-layer panel combining:
 * - AccuracyGraph (player vs opponent)
 * - EvalGraph (position advantage timeline)
 * - MoveQualityList (move classification breakdown)
 * - CoachAvatar with personalized feedback
 * - Coach insights section
 * 
 * Configurable sections with responsive layout.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text as RNText, TouchableOpacity, ScrollView } from 'react-native';
import { AccuracyGraph } from './AccuracyGraph';
import { EvalGraph } from './EvalGraph';
import { MoveQualityList, type MoveQuality } from './MoveQualityBadge';
import { CoachAvatar, useExpressionForSentiment } from '../coach/CoachAvatar';
import { Card } from '../../primitives/Card';
import { VStack, HStack } from '../../primitives/Stack';
import { useColors } from '../../hooks/useThemeTokens';

export type GraphType = 'accuracy' | 'evaluation';

export type GameReviewPanelProps = {
  /**
   * Accuracy data for player
   */
  playerAccuracy: number[];
  
  /**
   * Accuracy data for opponent
   */
  opponentAccuracy: number[];
  
  /**
   * Evaluation data (centipawns)
   */
  evaluations: number[];
  
  /**
   * Player color
   */
  playerColor: 'white' | 'black';
  
  /**
   * Player name
   */
  playerName?: string;
  
  /**
   * Opponent name
   */
  opponentName?: string;
  
  /**
   * Move quality breakdown
   */
  moveQualities: Array<{ quality: MoveQuality; count: number }>;
  
  /**
   * Critical moments (move indices with significant eval changes)
   */
  criticalMoments?: number[];
  
  /**
   * Game phases
   */
  phases?: {
    opening: number;
    middlegame: number;
    endgame: number;
  };
  
  /**
   * Coach feedback message
   */
  coachMessage?: string;
  
  /**
   * Coach sentiment (determines expression)
   */
  coachSentiment?: 'positive' | 'neutral' | 'cautionary' | 'critical';
  
  /**
   * Show/hide sections
   */
  showAccuracyGraph?: boolean;
  showEvalGraph?: boolean;
  showMoveQuality?: boolean;
  showCoachFeedback?: boolean;
  
  /**
   * Initial graph to display
   */
  defaultGraph?: GraphType;
  
  /**
   * Enable graph switching
   */
  enableGraphSwitch?: boolean;
  
  /**
   * Compact mode (smaller graphs, less padding)
   */
  compact?: boolean;
};

export const GameReviewPanel: React.FC<GameReviewPanelProps> = ({
  playerAccuracy,
  opponentAccuracy,
  evaluations,
  playerColor,
  playerName = 'You',
  opponentName = 'Opponent',
  moveQualities,
  criticalMoments,
  phases,
  coachMessage,
  coachSentiment = 'neutral',
  showAccuracyGraph = true,
  showEvalGraph = true,
  showMoveQuality = true,
  showCoachFeedback = true,
  defaultGraph = 'accuracy',
  enableGraphSwitch = true,
  compact = false,
}) => {
  const colors = useColors();
  const [activeGraph, setActiveGraph] = useState<GraphType>(defaultGraph);
  const coachExpression = useExpressionForSentiment(coachSentiment);
  
  const graphHeight = compact ? 180 : 250;
  const cardPadding = compact ? 12 : 16;
  
  return (
    <VStack gap={compact ? 3 : 4}>
      {/* Coach Feedback Section */}
      {showCoachFeedback && coachMessage && (
        <Card variant="surfaceElevated" size={compact ? 'sm' : 'md'} animated>
          <HStack gap={3} style={{ alignItems: 'flex-start' }}>
            <CoachAvatar
              expression={coachExpression}
              size={compact ? 'md' : 'lg'}
              animated
              bounce
            />
            <VStack gap={2} style={{ flex: 1 }}>
              <RNText style={[styles.coachTitle, { color: colors.foreground.primary }]}>
                Coach's Analysis
              </RNText>
              <RNText style={[styles.coachMessage, { color: colors.foreground.secondary }]}>
                {coachMessage}
              </RNText>
            </VStack>
          </HStack>
        </Card>
      )}
      
      {/* Graph Section with Segmented Control */}
      {(showAccuracyGraph || showEvalGraph) && (
        <Card variant="elevated" size={compact ? 'sm' : 'md'}>
          <VStack gap={3}>
            {/* Graph Type Selector */}
            {enableGraphSwitch && showAccuracyGraph && showEvalGraph && (
              <HStack gap={2} style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segment,
                    activeGraph === 'accuracy' && styles.segmentActive,
                    activeGraph === 'accuracy' && { backgroundColor: colors.accent.primary },
                  ]}
                  onPress={() => setActiveGraph('accuracy')}
                >
                  <RNText
                    style={[
                      styles.segmentText,
                      { color: activeGraph === 'accuracy' ? '#FFFFFF' : colors.foreground.secondary },
                    ]}
                  >
                    Accuracy
                  </RNText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.segment,
                    activeGraph === 'evaluation' && styles.segmentActive,
                    activeGraph === 'evaluation' && { backgroundColor: colors.accent.primary },
                  ]}
                  onPress={() => setActiveGraph('evaluation')}
                >
                  <RNText
                    style={[
                      styles.segmentText,
                      { color: activeGraph === 'evaluation' ? '#FFFFFF' : colors.foreground.secondary },
                    ]}
                  >
                    Evaluation
                  </RNText>
                </TouchableOpacity>
              </HStack>
            )}
            
            {/* Accuracy Graph */}
            {activeGraph === 'accuracy' && showAccuracyGraph && (
              <View>
                <AccuracyGraph
                  playerData={playerAccuracy}
                  opponentData={opponentAccuracy}
                  playerName={playerName}
                  opponentName={opponentName}
                  height={graphHeight}
                  showThresholds
                  showAverages
                  animated
                />
              </View>
            )}
            
            {/* Evaluation Graph */}
            {activeGraph === 'evaluation' && showEvalGraph && (
              <View>
                <EvalGraph
                  evaluations={evaluations}
                  playerColor={playerColor}
                  criticalMoments={criticalMoments}
                  phases={phases}
                  height={graphHeight}
                  showZeroLine
                  showPhases={!!phases}
                  animated
                />
              </View>
            )}
          </VStack>
        </Card>
      )}
      
      {/* Move Quality Breakdown */}
      {showMoveQuality && moveQualities.length > 0 && (
        <Card variant="elevated" size={compact ? 'sm' : 'md'}>
          <VStack gap={3}>
            <RNText style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
              Move Quality
            </RNText>
            <MoveQualityList
              qualities={moveQualities}
              showLabels
              animated
            />
          </VStack>
        </Card>
      )}
    </VStack>
  );
};

const styles = StyleSheet.create({
  coachTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  coachMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  segmentedControl: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 10,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    // backgroundColor set dynamically
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

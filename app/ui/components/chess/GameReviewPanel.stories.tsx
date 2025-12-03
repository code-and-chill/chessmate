/**
 * GameReviewPanel Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react';
import { View, StyleSheet } from 'react-native';
import { GameReviewPanel } from './GameReviewPanel';

const meta: Meta<typeof GameReviewPanel> = {
  title: 'Chess/GameReviewPanel',
  component: GameReviewPanel,
  decorators: [
    (Story) => (
      <View style={styles.container}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof GameReviewPanel>;

const mockAccuracyData = [95, 94, 92, 90, 88, 85, 83, 87, 90, 92, 89, 86, 84, 88, 91];
const mockOpponentData = [90, 88, 85, 80, 75, 70, 65, 68, 70, 72, 74, 76, 78, 75, 73];
const mockEvaluations = [20, 25, 30, 35, 40, 120, 130, 140, -50, -80, 100, 200, 300, 400, 500];
const mockMoveQualities = [
  { quality: 'brilliant' as const, count: 2 },
  { quality: 'best' as const, count: 8 },
  { quality: 'good' as const, count: 15 },
  { quality: 'inaccuracy' as const, count: 3 },
  { quality: 'mistake' as const, count: 2 },
  { quality: 'blunder' as const, count: 1 },
];

export const Complete: Story = {
  args: {
    playerAccuracy: mockAccuracyData,
    opponentAccuracy: mockOpponentData,
    evaluations: mockEvaluations,
    playerColor: 'white',
    playerName: 'You',
    opponentName: 'Magnus2024',
    moveQualities: mockMoveQualities,
    criticalMoments: [8, 9, 11],
    phases: {
      opening: 5,
      middlegame: 10,
      endgame: 15,
    },
    coachMessage: '🎉 Outstanding performance! You played with incredible precision and capitalized on your opponent\'s mistakes in the middlegame.',
    coachSentiment: 'positive',
    showAccuracyGraph: true,
    showEvalGraph: true,
    showMoveQuality: true,
    showCoachFeedback: true,
    enableGraphSwitch: true,
  },
};

export const AccuracyOnly: Story = {
  args: {
    playerAccuracy: mockAccuracyData,
    opponentAccuracy: mockOpponentData,
    evaluations: mockEvaluations,
    playerColor: 'white',
    moveQualities: mockMoveQualities,
    coachMessage: '✨ Great accuracy throughout the game! Focus on reducing those few inaccuracies.',
    coachSentiment: 'positive',
    showAccuracyGraph: true,
    showEvalGraph: false,
    showMoveQuality: true,
    showCoachFeedback: true,
  },
};

export const EvaluationOnly: Story = {
  args: {
    playerAccuracy: mockAccuracyData,
    opponentAccuracy: mockOpponentData,
    evaluations: mockEvaluations,
    playerColor: 'white',
    moveQualities: mockMoveQualities,
    criticalMoments: [8, 9, 11],
    phases: {
      opening: 5,
      middlegame: 10,
      endgame: 15,
    },
    coachMessage: '💪 You recovered well after the mistake on move 13. Great fighting spirit!',
    coachSentiment: 'neutral',
    showAccuracyGraph: false,
    showEvalGraph: true,
    showMoveQuality: true,
    showCoachFeedback: true,
  },
};

export const CompactMode: Story = {
  args: {
    playerAccuracy: mockAccuracyData,
    opponentAccuracy: mockOpponentData,
    evaluations: mockEvaluations,
    playerColor: 'white',
    moveQualities: mockMoveQualities,
    coachMessage: 'Solid game overall!',
    coachSentiment: 'neutral',
    compact: true,
    enableGraphSwitch: true,
  },
};

export const WithoutCoachFeedback: Story = {
  args: {
    playerAccuracy: mockAccuracyData,
    opponentAccuracy: mockOpponentData,
    evaluations: mockEvaluations,
    playerColor: 'white',
    moveQualities: mockMoveQualities,
    showCoachFeedback: false,
    enableGraphSwitch: true,
  },
};

export const CriticalSentiment: Story = {
  args: {
    playerAccuracy: [70, 68, 65, 60, 55, 58, 60, 62, 65, 68],
    opponentAccuracy: [92, 93, 94, 95, 96, 94, 93, 92, 91, 90],
    evaluations: [10, -50, -100, -200, -300, -250, -200, -150, -100, -80],
    playerColor: 'white',
    playerName: 'You',
    opponentName: 'Stockfish_Hard',
    moveQualities: [
      { quality: 'good' as const, count: 5 },
      { quality: 'inaccuracy' as const, count: 8 },
      { quality: 'mistake' as const, count: 5 },
      { quality: 'blunder' as const, count: 3 },
    ],
    coachMessage: '💪 Tough game, but there\'s a lot to learn here. Focus on reducing blunders in critical positions.',
    coachSentiment: 'critical',
    enableGraphSwitch: true,
  },
};

export const CautionarySentiment: Story = {
  args: {
    playerAccuracy: [82, 80, 78, 75, 73, 75, 77, 80, 82, 84],
    opponentAccuracy: [88, 87, 85, 83, 82, 84, 86, 88, 89, 90],
    evaluations: [15, 10, 5, -20, -40, -30, -20, -10, -5, 0],
    playerColor: 'black',
    playerName: 'You',
    opponentName: 'ChessGuru99',
    moveQualities: [
      { quality: 'best' as const, count: 3 },
      { quality: 'good' as const, count: 12 },
      { quality: 'inaccuracy' as const, count: 5 },
      { quality: 'mistake' as const, count: 2 },
    ],
    coachMessage: '🤔 You played well but couldn\'t convert. Review the critical moments to understand where the advantage slipped.',
    coachSentiment: 'cautionary',
    enableGraphSwitch: true,
  },
};

export const NoGraphSwitching: Story = {
  args: {
    playerAccuracy: mockAccuracyData,
    opponentAccuracy: mockOpponentData,
    evaluations: mockEvaluations,
    playerColor: 'white',
    moveQualities: mockMoveQualities,
    coachMessage: '✨ Great performance!',
    coachSentiment: 'positive',
    defaultGraph: 'evaluation',
    enableGraphSwitch: false,
  },
};

export const MinimalMoveQualities: Story = {
  args: {
    playerAccuracy: mockAccuracyData,
    opponentAccuracy: mockOpponentData,
    evaluations: mockEvaluations,
    playerColor: 'white',
    moveQualities: [
      { quality: 'brilliant' as const, count: 1 },
      { quality: 'best' as const, count: 18 },
      { quality: 'good' as const, count: 5 },
    ],
    coachMessage: '🎉 Nearly perfect game! Outstanding precision.',
    coachSentiment: 'positive',
    enableGraphSwitch: true,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

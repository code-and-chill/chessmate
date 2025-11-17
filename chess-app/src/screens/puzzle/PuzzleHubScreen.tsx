import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DailyPuzzleHero } from '../../components/puzzle/DailyPuzzleHero';
import { TacticsStatsCard } from '../../components/puzzle/TacticsStatsCard';
import { TacticsQuickTrainRow } from '../../components/puzzle/TacticsQuickTrainRow';

export const PuzzleHubScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <DailyPuzzleHero />
      <TacticsStatsCard />
      <TacticsQuickTrainRow />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
});
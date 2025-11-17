import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { usePuzzleHistory } from '../../hooks/usePuzzleHistory';

export const PuzzleStatsScreen: React.FC = () => {
  const { data: stats, isLoading, error } = usePuzzleStats();

  if (isLoading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;
  }

  if (error || !stats) {
    return <View style={styles.error}><Text>Error loading stats.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Puzzle Stats</Text>
      <Text>Tactics Rating: {stats.rating}</Text>
      <Text>Current Streak: {stats.currentStreak}</Text>
      <Text>Longest Streak: {stats.longestStreak}</Text>
      <Text>Total Puzzles Solved: {stats.totalSolved}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
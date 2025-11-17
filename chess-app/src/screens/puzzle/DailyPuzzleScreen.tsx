import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRecentGames } from '../../hooks/useRecentGames';
import { PuzzleBoardSection } from '../../components/puzzle/PuzzleBoardSection';
import { PuzzleFooterControls } from '../../components/puzzle/PuzzleFooterControls';

export const DailyPuzzleScreen: React.FC = () => {
  const { data: puzzle, isLoading, error } = useDailyPuzzle();

  if (isLoading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;
  }

  if (error || !puzzle) {
    return <View style={styles.error}><Text>Error loading puzzle.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <PuzzleBoardSection puzzle={puzzle} />
      <PuzzleFooterControls puzzleId={puzzle.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
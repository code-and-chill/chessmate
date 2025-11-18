import React from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { usePuzzleHistory } from '../../hooks/usePuzzleHistory';

export const PuzzleHistoryScreen: React.FC = () => {
  const { data: history, isLoading, error } = usePuzzleHistory();

  if (isLoading) {
    return <View style={styles.loading}><Text>Loading...</Text></View>;
  }

  if (error || !history) {
    return <View style={styles.error}><Text>Error loading history.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Puzzle History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyItem}>
            <Text>Puzzle ID: {item.id}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Rating Change: {item.ratingChange}</Text>
          </View>
        )}
      />
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
  historyItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

interface PostGameSummaryScreenProps {
  gameId: string;
  result: 'win' | 'loss' | 'draw';
}

export const PostGameSummaryScreen: React.FC<PostGameSummaryScreenProps> = ({ gameId, result }) => {
  const { data: ratings } = useRatings();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Game Summary</Text>
      <Text>Result: {result}</Text>
      <Text>Rating Before: {ratings?.before}</Text>
      <Text>Rating After: {ratings?.after}</Text>
      <Button title="Analyze Game" onPress={() => {/* Navigate to GameAnalysisScreen */}} />
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
});
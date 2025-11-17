import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { PuzzleApiClient } from '../api/puzzleApi';
import { Puzzle } from '../types/Puzzle';

interface DailyPuzzleCardProps {
  onSolve: () => void;
  apiBaseUrl?: string;
}

const DailyPuzzleCard: React.FC<DailyPuzzleCardProps> = ({ 
  onSolve,
  apiBaseUrl = 'http://localhost:8000'
}) => {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDailyPuzzle = async () => {
      try {
        setLoading(true);
        setError(null);
        const client = new PuzzleApiClient(apiBaseUrl);
        const dailyPuzzle = await client.getDailyPuzzle();
        setPuzzle(dailyPuzzle);
      } catch (err: any) {
        console.error('Failed to fetch daily puzzle:', err);
        setError(err.message || 'Failed to load puzzle');
      } finally {
        setLoading(false);
      }
    };

    fetchDailyPuzzle();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <View style={styles.card} testID="daily-puzzle-card-loading">
        <ActivityIndicator size="large" color="#0000ff" testID="loading-indicator" />
      </View>
    );
  }

  if (error || !puzzle) {
    return (
      <View style={styles.card} testID="daily-puzzle-card-error">
        <Text style={styles.title}>Daily Puzzle</Text>
        <Text style={styles.subtitle} testID="error-message">
          {error || 'Failed to load puzzle'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card} testID="daily-puzzle-card">
      <Text style={styles.title}>Daily Puzzle</Text>
      <Text style={styles.subtitle}>{puzzle.title}</Text>
      <Image 
        source={{ uri: puzzle.thumbnail }} 
        style={styles.thumbnail}
        testID="puzzle-thumbnail"
      />
      <Button 
        title="Solve Now" 
        onPress={onSolve}
        testID="solve-button"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  thumbnail: {
    width: '100%',
    height: 100,
    marginVertical: 8,
  },
});

export default DailyPuzzleCard;

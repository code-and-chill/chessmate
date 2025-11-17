import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchPuzzle, submitPuzzleAttempt } from '../../core/api/puzzleApi';

interface PuzzlePlayScreenProps {
  puzzleId: string;
  onComplete: (data: any) => void;
}

const PuzzlePlayScreen: React.FC<PuzzlePlayScreenProps> = ({ puzzleId, onComplete }) => {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPuzzleData = async () => {
      try {
        setLoading(true);
        setError(null);
        const puzzleData = await fetchPuzzle(puzzleId);
        setPuzzle(puzzleData);
      } catch (err: any) {
        console.error('Failed to fetch puzzle:', err);
        setError(err.message || 'Failed to load puzzle');
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzleData();
  }, [puzzleId]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setStatus('');
      const result = await submitPuzzleAttempt(puzzleId, {
        is_daily: true,
        moves_played: [],
        status: 'SUCCESS',
        time_spent_ms: 120000,
        hints_used: 0,
      });
      setStatus(result.status);
      onComplete(result);
    } catch (err: any) {
      console.error('Failed to submit attempt:', err);
      setStatus('Error submitting attempt');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container} testID="puzzle-play-screen-loading">
        <ActivityIndicator size="large" color="#0000ff" testID="loading-indicator" />
      </View>
    );
  }

  if (error || !puzzle) {
    return (
      <View style={styles.container} testID="puzzle-play-screen-error">
        <Text style={styles.errorText} testID="error-message">
          {error || 'Failed to load puzzle'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="puzzle-play-screen">
      <Text style={styles.header} testID="puzzle-header">Daily Puzzle · {puzzle.date}</Text>
      <Text style={styles.rating} testID="tactics-rating">Tactics: {puzzle.rating}</Text>
      <View style={styles.board} testID="chess-board">
        {/* Chessboard component placeholder */}
        <Text>Chessboard goes here</Text>
      </View>
      <Text style={styles.status} testID="status-message">{status}</Text>
      <View style={styles.controls} testID="controls">
        <Button 
          title="Submit" 
          onPress={handleSubmit}
          disabled={submitting}
          testID="submit-button"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  board: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  status: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
});

export default PuzzlePlayScreen;
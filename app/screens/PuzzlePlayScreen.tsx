import { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

interface PuzzlePlayScreenProps {
  puzzleId: string;
  onComplete?: (data: Record<string, unknown>) => void;
  apiBaseUrl?: string;
}

/**
 * PuzzlePlayScreen Component
 *
 * Displays a chess puzzle for the user to solve.
 * Currently a placeholder showing puzzle information.
 */
export const PuzzlePlayScreen = ({
  puzzleId,
  onComplete,
  apiBaseUrl = 'http://localhost:8000',
}: PuzzlePlayScreenProps) => {
  const [status, setStatus] = useState('');
  const [error] = useState<string | null>(null);

  const handleSubmit = () => {
    setStatus('Puzzle submitted!');
    if (onComplete) {
      onComplete({
        puzzleId,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.header}>Daily Puzzle</Text>
        <Text style={styles.puzzleId}>Puzzle ID: {puzzleId}</Text>

        <View style={styles.boardPlaceholder}>
          <Text style={styles.boardText}>Chess Board</Text>
          <Text style={styles.boardSubtext}>(Component placeholder)</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Difficulty: Medium</Text>
          <Text style={styles.infoLabel}>Rating: 1200</Text>
          <Text style={styles.infoLabel}>API Base: {apiBaseUrl}</Text>
        </View>

        {status && <Text style={styles.status}>{status}</Text>}

        <View style={styles.controls}>
          <Button
            title="Submit Solution"
            onPress={handleSubmit}
            color="#007AFF"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  puzzleId: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  boardPlaceholder: {
    height: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  boardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
  },
  boardSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  status: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  controls: {
    marginTop: 20,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    padding: 20,
  },
});
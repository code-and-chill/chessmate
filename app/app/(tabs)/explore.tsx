import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { PuzzlePlayScreen } from '@/screens/PuzzlePlayScreen';

type PuzzleResult = Record<string, unknown>;

export default function PuzzleTab() {
  const [puzzleId, setPuzzleId] = useState('puzzle-123');
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePuzzleComplete = (data: PuzzleResult) => {
    console.log('Puzzle completed:', data);
    setShowPuzzle(false);
  };

  if (showPuzzle) {
    return (
      <View style={styles.container}>
        <PuzzlePlayScreen 
          puzzleId={puzzleId} 
          onComplete={handlePuzzleComplete as (data: Record<string, unknown>) => void}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Puzzle</Text>
        <Text style={styles.subtitle}>Solve chess puzzles and improve your skills</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter puzzle ID (e.g., puzzle-123)"
          placeholderTextColor="#999"
          value={puzzleId}
          onChangeText={setPuzzleId}
        />
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setLoading(true);
            setTimeout(() => {
              setShowPuzzle(true);
              setLoading(false);
            }, 500);
          }}
        >
          <Text style={styles.buttonText}>Start Puzzle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.demoButton]}
          onPress={() => {
            setPuzzleId('puzzle-demo');
            setLoading(true);
            setTimeout(() => {
              setShowPuzzle(true);
              setLoading(false);
            }, 500);
          }}
        >
          <Text style={styles.buttonText}>Try Daily Puzzle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  demoButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

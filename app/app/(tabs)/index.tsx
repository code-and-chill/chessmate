import { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { PlayScreen } from '@/screens/PlayScreen';

export default function PlayTab() {
  const [gameId, setGameId] = useState('game-demo-1');
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return (
      <View style={styles.container}>
        <PlayScreen gameId={gameId} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Live Chess</Text>
        <Text style={styles.subtitle}>Enter a game ID to play</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter game ID (e.g., game-demo-1)"
          placeholderTextColor="#999"
          value={gameId}
          onChangeText={setGameId}
        />
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowGame(true)}
        >
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.demoButton]}
          onPress={() => {
            setGameId('game-demo-1');
            setShowGame(true);
          }}
        >
          <Text style={styles.buttonText}>Try Demo Game</Text>
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
});

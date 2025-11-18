import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
} from 'react-native';

/**
 * PlayScreen Props
 */
export interface PlayScreenProps {
  gameId: string;
  config?: Record<string, unknown>;
}

/**
 * PlayScreen Component
 *
 * Main component for displaying an active chess game.
 * Currently a placeholder that displays game information.
 *
 * Features:
 * - Shows game ID
 * - Loading states
 * - Responsive layout
 */
export const PlayScreen = ({ gameId, config }: PlayScreenProps) => {
  const [gameState] = useState({
    status: 'active',
    players: ['Player 1', 'Player 2'],
    moves: [] as Array<{ id: string; move: string }>,
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Live Chess Game</Text>
          <Text style={styles.gameId}>Game ID: {gameId}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Game Status</Text>
          <Text style={styles.infoText}>Status: {gameState.status}</Text>
          <Text style={styles.infoText}>Players: {gameState.players.join(' vs ')}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Move History</Text>
          {gameState.moves.length === 0 ? (
            <Text style={styles.infoText}>No moves yet</Text>
          ) : (
            gameState.moves.map((item) => (
              <Text key={item.id} style={styles.infoText}>
                {item.move}
              </Text>
            ))
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <Text style={styles.infoText}>
            {config ? JSON.stringify(config, null, 2) : 'Using default config'}
          </Text>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  gameId: {
    fontSize: 16,
    color: '#666',
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier New',
  },
  infoSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

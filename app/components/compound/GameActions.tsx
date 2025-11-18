import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export type GameStatus = 'in_progress' | 'waiting_for_opponent' | 'ended' | 'preparing';

export interface GameActionsProps {
  status?: GameStatus;
  result?: '1-0' | '0-1' | '1/2-1/2' | null;
  endReason?: string | null;
  onResign?: () => void;
}

/**
 * GameActions Component
 * Displays game control buttons and status based on game state
 */
export const GameActions = React.forwardRef<View, GameActionsProps>(
  ({ status = 'in_progress', result, endReason, onResign }, ref) => {
    const isGameActive = status === 'in_progress';
    const isGameEnded = status === 'ended';

    const getResultDisplay = () => {
      if (result === '1-0') return '1 - 0 (White Wins)';
      if (result === '0-1') return '0 - 1 (Black Wins)';
      if (result === '1/2-1/2') return '½ - ½ (Draw)';
      return 'Game Over';
    };

    const getStatusMessage = () => {
      switch (status) {
        case 'waiting_for_opponent':
          return 'Waiting for opponent...';
        case 'preparing':
          return 'Game preparing...';
        default:
          return '';
      }
    };

    return (
      <View ref={ref} style={styles.container}>
        {isGameActive && (
          <Pressable
            onPress={onResign}
            style={[styles.button, styles.resignButton]}
          >
            <Text style={styles.resignButtonText}>Resign</Text>
          </Pressable>
        )}

        {isGameEnded && (
          <View style={styles.resultContainer}>
            {endReason && (
              <Text style={styles.endReason}>{endReason}</Text>
            )}
            {result && (
              <Text style={styles.resultTitle}>{getResultDisplay()}</Text>
            )}
            {!result && !endReason && (
              <Text style={styles.resultTitle}>Game Over</Text>
            )}
          </View>
        )}

        {!isGameActive && !isGameEnded && (
          <Text style={styles.statusMessage}>
            {getStatusMessage()}
          </Text>
        )}
      </View>
    );
  }
);

GameActions.displayName = 'GameActions';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resignButton: {
    backgroundColor: '#d32f2f',
  },
  resignButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 150,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  endReason: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusMessage: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

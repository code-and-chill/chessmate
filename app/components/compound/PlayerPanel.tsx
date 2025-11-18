import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type Color = 'w' | 'b';

export interface PlayerPanelProps {
  position: 'top' | 'bottom';
  color: Color;
  isSelf: boolean;
  remainingMs: number;
  accountId: string;
  isActive?: boolean; // Whether this player's timer is running
}

/**
 * Formats milliseconds into a chess clock display string
 * Examples: "5:30" (5 min 30 sec), "1:23:45" (1 hour 23 min 45 sec)
 */
const formatClock = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

/**
 * PlayerPanel Component
 * Displays player information including color, identity, and remaining time
 */
export const PlayerPanel = React.forwardRef<View, PlayerPanelProps>(
  ({ color, isSelf, remainingMs, accountId, isActive }, ref) => {
    const [displayTime, setDisplayTime] = useState(remainingMs);

    useEffect(() => {
      setDisplayTime(remainingMs);
    }, [remainingMs]);

    useEffect(() => {
      if (!isActive || displayTime <= 0) {
        return;
      }

      const interval = setInterval(() => {
        setDisplayTime(prev => Math.max(0, prev - 1000));
      }, 1000);

      return () => clearInterval(interval);
    }, [isActive, displayTime]);
    return (
      <View
        ref={ref}
        style={[
          styles.container,
          isSelf ? styles.selfPanel : styles.opponentPanel,
          isActive && styles.activePanel,
        ]}
      >
        <View style={styles.playerInfo}>
          <Text style={styles.playerLabel}>
            {isSelf ? 'You' : 'Opponent'} ({color === 'w' ? 'White' : 'Black'})
          </Text>
          <Text style={styles.accountId}>Account: {accountId}</Text>
        </View>

        <View style={styles.clockContainer}>
          <Text style={[styles.clock, isActive && styles.activeClock]}>
            {formatClock(displayTime)}
          </Text>
        </View>
      </View>
    );
  }
);

PlayerPanel.displayName = 'PlayerPanel';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  selfPanel: {
    backgroundColor: '#f0f0f0',
  },
  opponentPanel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activePanel: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
  },
  playerInfo: {
    flex: 1,
    gap: 4,
  },
  playerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  accountId: {
    fontSize: 12,
    color: '#999',
  },
  clockContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  clock: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  activeClock: {
    color: '#FF6B6B',
    fontSize: 20,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Spacing } from '@/constants/layout';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface QuickStartModalProps {
  visible: boolean;
  onClose: () => void;
  onStartGame: (timeControl: TimeControl) => void;
  onJoinGame: (gameId: string) => void;
}

export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'custom';

interface TimeControlOption {
  id: TimeControl;
  name: string;
  duration: string;
  icon: string;
}

/**
 * QuickStartModal Component
 * Allows users to quickly start a new game or join an existing game
 * Shows time control selection and game ID input
 */
export const QuickStartModal: React.FC<QuickStartModalProps> = ({
  visible,
  onClose,
  onStartGame,
  onJoinGame,
}) => {
  const [mode, setMode] = useState<'start' | 'join'>('start');
  const [gameId, setGameId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const timeControls: TimeControlOption[] = [
    { id: 'bullet', name: 'Bullet', duration: '1+0', icon: 'bolt.fill' },
    { id: 'blitz', name: 'Blitz', duration: '3+2', icon: 'hare.fill' },
    { id: 'rapid', name: 'Rapid', duration: '10+0', icon: 'tortoise.fill' },
    { id: 'classical', name: 'Classical', duration: '30+0', icon: 'clock.fill' },
  ];

  const handleStartGame = async (timeControl: TimeControl) => {
    setIsLoading(true);
    try {
      await onStartGame(timeControl);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameId.trim()) return;
    
    setIsLoading(true);
    try {
      await onJoinGame(gameId.trim());
    } finally {
      setIsLoading(false);
      setGameId('');
    }
  };

  const handleClose = () => {
    setMode('start');
    setGameId('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable
          style={[styles.container, { backgroundColor: colors.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Quick Start</Text>
            <Pressable
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <IconSymbol name="xmark.circle.fill" size={28} color={colors.icon} />
            </Pressable>
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <Pressable
              style={[
                styles.modeButton,
                mode === 'start' && [styles.modeButtonActive, { backgroundColor: colors.tint }],
              ]}
              onPress={() => setMode('start')}
              accessibilityRole="button"
              accessibilityLabel="Start new game"
              accessibilityState={{ selected: mode === 'start' }}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'start' && styles.modeButtonTextActive,
                  { color: mode === 'start' ? '#fff' : colors.text },
                ]}
              >
                Start Game
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.modeButton,
                mode === 'join' && [styles.modeButtonActive, { backgroundColor: colors.tint }],
              ]}
              onPress={() => setMode('join')}
              accessibilityRole="button"
              accessibilityLabel="Join existing game"
              accessibilityState={{ selected: mode === 'join' }}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'join' && styles.modeButtonTextActive,
                  { color: mode === 'join' ? '#fff' : colors.text },
                ]}
              >
                Join Game
              </Text>
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {mode === 'start' ? (
              <>
                <Text style={[styles.subtitle, { color: colors.icon }]}>
                  Choose a time control
                </Text>
                <View style={styles.timeControlGrid}>
                  {timeControls.map((control) => (
                    <Pressable
                      key={control.id}
                      style={({ pressed }) => [
                        styles.timeControlCard,
                        { borderColor: colors.tint },
                        pressed && styles.timeControlCardPressed,
                      ]}
                      onPress={() => handleStartGame(control.id)}
                      disabled={isLoading}
                      accessibilityRole="button"
                      accessibilityLabel={`${control.name} ${control.duration}`}
                    >
                      <IconSymbol
                        name={control.icon}
                        size={32}
                        color={colors.tint}
                      />
                      <Text style={[styles.timeControlName, { color: colors.text }]}>
                        {control.name}
                      </Text>
                      <Text style={[styles.timeControlDuration, { color: colors.icon }]}>
                        {control.duration}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.subtitle, { color: colors.icon }]}>
                  Enter game ID
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon,
                      backgroundColor: colors.background,
                    },
                  ]}
                  placeholder="e.g., game-abc123"
                  placeholderTextColor={colors.icon}
                  value={gameId}
                  onChangeText={setGameId}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Game ID input"
                />
                <Pressable
                  style={[
                    styles.joinButton,
                    { backgroundColor: colors.tint },
                    (!gameId.trim() || isLoading) && styles.joinButtonDisabled,
                  ]}
                  onPress={handleJoinGame}
                  disabled={!gameId.trim() || isLoading}
                  accessibilityRole="button"
                  accessibilityLabel="Join game"
                  accessibilityState={{ disabled: !gameId.trim() || isLoading }}
                >
                  <Text style={styles.joinButtonText}>Join Game</Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                {mode === 'start' ? 'Starting game...' : 'Joining game...'}
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    // backgroundColor set dynamically
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    // color set dynamically
  },
  content: {
    gap: Spacing.lg,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeControlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  timeControlCard: {
    flex: 1,
    minWidth: 100,
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  timeControlCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  timeControlName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeControlDuration: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  joinButton: {
    paddingVertical: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

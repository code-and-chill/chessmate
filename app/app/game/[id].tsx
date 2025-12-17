import { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useThemeTokens } from '@/ui';
import { PlayScreen } from '@/features/board/screens/PlayScreen';
import { useGetGame } from '@/features/game/hooks';
import { normalizeGameForState } from '@/features/game/utils/gameMapper';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeTokens();
  
  // Use the useGetGame hook instead of direct API call
  const { game, loading, error: gameError } = useGetGame(id ?? null);

  // Normalize fields expected by useGameState partial
  const initialGame = useMemo(() => {
    return normalizeGameForState(game, id);
  }, [game, id]);

  const error = gameError ? gameError.message : (!id ? 'No game ID provided' : null);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </View>
    );
  }

  if (error || (!loading && !initialGame)) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error ?? 'Game not found'}</Text>
        </View>
      </View>
    );
  }

  return <PlayScreen gameId={id} initialGame={initialGame} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

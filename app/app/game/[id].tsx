import { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useApiClients } from '@/contexts/ApiContext';
import { useThemeTokens } from '@/ui';
import { PlayScreen } from '@/features/board/screens/PlayScreen';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeTokens();
  const { playApi } = useApiClients();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialGame, setInitialGame] = useState<Partial<any> | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No game ID provided');
      setLoading(false);
      return;
    }

    const loadGame = async () => {
      try {
        setLoading(true);
        const game = await playApi.getGameById(id!);
        // Normalize fields expected by useGameState partial
        const partial = {
          fen: game.fen,
          moves: game.moves ?? [],
          sideToMove: game.sideToMove ?? (game.fen?.split(' ')[1] === 'w' ? 'w' : 'b'),
          players: [game.whitePlayer?.id ?? 'Player 1', game.blackPlayer?.id ?? 'Player 2'],
          status: game.status === 'ended' ? 'ended' : 'in_progress',
          result: game.result ?? null,
          endReason: game.endReason ?? '',
          lastMove: game.lastMove ?? null,
          // Prefer explicit flags returned by the API (isLocal/mode), fall back to route id convention
          isLocal: !!(game.isLocal || (game.mode === 'local') || (id && String(id).startsWith('local-'))),
          mode: game.mode === 'local' ? 'local' : ((id && String(id).startsWith('local-')) ? 'local' : undefined),
        };
        setInitialGame(partial);
      } catch (err) {
        console.error('Failed to load game:', err);
        setError('Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [id, playApi]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      </View>
    );
  }

  if (error || !initialGame) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error ?? 'Game not found'}</Text>
        </View>
      </View>
    );
  }

  return <PlayScreen initialGame={initialGame} />;
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

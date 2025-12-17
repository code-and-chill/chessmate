import { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useThemeTokens } from '@/ui';
import { PlayScreen } from '@/features/board/screens/PlayScreen';
import { useGetGame } from '@/features/game/hooks';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeTokens();
  
  // Use the useGetGame hook instead of direct API call
  const { game, loading, error: gameError } = useGetGame(id ?? null);

  // Normalize fields expected by useGameState partial
  // TODO: Consider moving this normalization to a mapper utility or the repository layer
  const initialGame = useMemo(() => {
    if (!game) return null;

    return {
      fen: game.fen ?? (game as any).fen,
      moves: (game.moves ?? (game as any).moves ?? []).map((m: any) => ({
        moveNumber: m.move_number ?? m.moveNumber ?? 0,
        color: (m.color === 'w' || m.color === 'white' ? 'w' : 'b') as 'w' | 'b',
        san: m.san ?? '',
      })),
      sideToMove: (game.sideToMove ?? (game as any).side_to_move ?? (game.fen?.split(' ')[1] === 'w' ? 'w' : 'b')) as 'w' | 'b',
      players: [
        (game as any).white_account_id ?? (game as any).whitePlayer?.id ?? 'Player 1',
        (game as any).black_account_id ?? (game as any).blackPlayer?.id ?? 'Player 2'
      ],
      status: ((game.status ?? (game as any).status) === 'ended' ? 'ended' : 'in_progress') as 'in_progress' | 'ended',
      result: game.result ?? (game as any).result ?? null,
      endReason: game.endReason ?? (game as any).end_reason ?? '',
      lastMove: game.lastMove ?? (game as any).last_move ?? null,
      // Prefer explicit flags returned by the API (isLocal/mode), fall back to route id convention
      isLocal: !!(game.isLocal || (game.mode === 'local') || (id && String(id).startsWith('local-'))),
      mode: game.mode === 'local' ? 'local' : ((id && String(id).startsWith('local-')) ? 'local' : undefined),
      // Bot game fields
      botId: (game as any).botId ?? (game as any).bot_id,
      botColor: ((game as any).botColor ?? (game as any).bot_color) as 'w' | 'b' | undefined,
      isBotGame: !!(game as any).botId || !!(game as any).bot_id,
    };
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

/**
 * Game Review Screen
 * 
 * View and analyze recent games.
 * Accessed from the Learn feature hub.
 */

import { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { DetailScreenLayout } from '@/ui/components/DetailScreenLayout';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack, useColors } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

type GameResult = 'win' | 'loss' | 'draw';

interface GameReview {
  id: string;
  opponent: string;
  result: GameResult;
  accuracy: number;
  blunders: number;
  mistakes: number;
  date: string;
}

export default function GameReviewScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useI18n();
  
  // Mock data - replace with actual game data
  const [games] = useState<GameReview[]>([
    {
      id: 'game-1',
      opponent: 'Magnus2024',
      result: 'win',
      accuracy: 87,
      blunders: 1,
      mistakes: 2,
      date: '2025-12-03',
    },
    {
      id: 'game-2',
      opponent: 'Stockfish_Easy',
      result: 'loss',
      accuracy: 72,
      blunders: 3,
      mistakes: 4,
      date: '2025-12-02',
    },
    {
      id: 'game-3',
      opponent: 'ChessGuru99',
      result: 'draw',
      accuracy: 81,
      blunders: 0,
      mistakes: 3,
      date: '2025-12-01',
    },
  ]);

  const getResultStyle = (result: GameResult) => {
    switch (result) {
      case 'win':
        return { color: colors.success, emoji: '🏆', text: 'Win' };
      case 'loss':
        return { color: colors.error, emoji: '❌', text: 'Loss' };
      case 'draw':
        return { color: colors.warning, emoji: '🤝', text: 'Draw' };
    }
  };

  return (
    <DetailScreenLayout
      title={t('learn.game_review')}
      subtitle={t('learn.analyze_recent_games')}
      onBack={() => router.back()}
    >
      <VStack gap={3}>
        {games.map((game: GameReview) => {
          const resultStyle = getResultStyle(game.result);
          
          return (
            <Card key={game.id} variant="elevated" size="md" hoverable pressable>
              <TouchableOpacity
                style={styles.gameCard}
                onPress={() => router.push(`/game/${game.id}`)}
              >
                <VStack gap={3}>
                  {/* Header */}
                  <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.opponent, { color: colors.foreground.primary }]}>
                      vs {game.opponent}
                    </Text>
                    <Text style={[styles.result, { color: resultStyle.color }]}>
                      {resultStyle.emoji} {resultStyle.text}
                    </Text>
                  </HStack>

                  {/* Stats */}
                  <HStack gap={4} style={{ justifyContent: 'space-around' }}>
                    <VStack gap={1} style={{ alignItems: 'center' }}>
                      <Text style={[styles.statLabel, { color: colors.foreground.tertiary }]}>
                        Accuracy
                      </Text>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                        {game.accuracy}%
                      </Text>
                    </VStack>
                    
                    <VStack gap={1} style={{ alignItems: 'center' }}>
                      <Text style={[styles.statLabel, { color: colors.foreground.tertiary }]}>
                        Blunders
                      </Text>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                        {game.blunders}
                      </Text>
                    </VStack>
                    
                    <VStack gap={1} style={{ alignItems: 'center' }}>
                      <Text style={[styles.statLabel, { color: colors.foreground.tertiary }]}>
                        Mistakes
                      </Text>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                        {game.mistakes}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Date */}
                  <Text style={[styles.date, { color: colors.foreground.muted }]}>
                    {new Date(game.date).toLocaleDateString()}
                  </Text>
                </VStack>
              </TouchableOpacity>
            </Card>
          );
        })}
      </VStack>

      {/* Empty State */}
      {games.length === 0 && (
        <Card variant="elevated" size="md">
          <VStack gap={3} style={{ padding: 40, alignItems: 'center' }}>
            <Text style={styles.emptyIcon}>🎮</Text>
            <Text style={[styles.emptyText, { color: colors.foreground.secondary }]}>
              {t('learn.no_games_to_review')}
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.accent.primary }]}
              onPress={() => router.push('/(tabs)/' as unknown as any)}
            >
              <Text style={styles.buttonText}>
                {t('learn.play_first_game')}
              </Text>
            </TouchableOpacity>
          </VStack>
        </Card>
      )}
    </DetailScreenLayout>
  );
}

const styles = StyleSheet.create({
  gameCard: {
    padding: 16,
  },
  opponent: {
    fontSize: 18,
    fontWeight: '600',
  },
  result: {
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

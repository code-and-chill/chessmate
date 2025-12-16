/**
 * Game Review Screen
 * 
 * Enhanced view and analysis of recent games with:
 * - Accuracy mini-graph previews
 * - Move quality badge summaries
 * - Coach avatar with result-based expressions
 * - Quick navigation to detailed analysis
 */

import { useState } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { DetailScreenLayout } from '@/ui/components/DetailScreenLayout';
import { Card } from '@/ui/primitives/Card';
import { 
  VStack, 
  HStack, 
  useColors,
  AccuracyGraph,
  CoachAvatar,
  MoveQualityBadge,
  type MoveQuality,
  Icon,
} from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

type GameResult = 'win' | 'loss' | 'draw';

interface GameReview {
  id: string;
  opponent: string;
  result: GameResult;
  accuracy: number;
  opponentAccuracy: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  goods: number;
  brilliants: number;
  date: string;
  // Mini accuracy timeline (sampled every N moves for preview)
  accuracyTimeline: number[];
  opponentAccuracyTimeline: number[];
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
      opponentAccuracy: 72,
      blunders: 1,
      mistakes: 2,
      inaccuracies: 3,
      goods: 15,
      brilliants: 2,
      date: '2025-12-03',
      accuracyTimeline: [95, 94, 92, 90, 88, 85, 83, 87, 90, 92],
      opponentAccuracyTimeline: [90, 88, 85, 80, 75, 70, 65, 68, 70, 72],
    },
    {
      id: 'game-2',
      opponent: 'Stockfish_Easy',
      result: 'loss',
      accuracy: 72,
      opponentAccuracy: 95,
      blunders: 3,
      mistakes: 4,
      inaccuracies: 5,
      goods: 12,
      brilliants: 0,
      date: '2025-12-02',
      accuracyTimeline: [85, 82, 78, 75, 70, 65, 68, 70, 72, 70],
      opponentAccuracyTimeline: [95, 96, 97, 96, 95, 94, 95, 96, 95, 95],
    },
    {
      id: 'game-3',
      opponent: 'ChessGuru99',
      result: 'draw',
      accuracy: 81,
      opponentAccuracy: 83,
      blunders: 0,
      mistakes: 3,
      inaccuracies: 4,
      goods: 18,
      brilliants: 1,
      date: '2025-12-01',
      accuracyTimeline: [90, 88, 85, 83, 80, 78, 80, 82, 81, 81],
      opponentAccuracyTimeline: [88, 86, 84, 82, 85, 83, 84, 83, 83, 83],
    },
  ]);
  
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  const getResultStyle = (result: GameResult) => {
    switch (result) {
      case 'win':
        return { color: colors.success, icon: 'trophy' as const, text: 'Win' };
      case 'loss':
        return { color: colors.error, icon: 'error' as const, text: 'Loss' };
      case 'draw':
        return { color: colors.warning, icon: 'success' as const, text: 'Draw' };
    }
  };
  
  const getCoachSentiment = (result: GameResult, accuracy: number): 'positive' | 'neutral' | 'cautionary' | 'critical' => {
    if (result === 'win' && accuracy >= 85) return 'positive';
    if (result === 'win') return 'neutral';
    if (result === 'loss' && accuracy < 70) return 'critical';
    if (result === 'loss') return 'cautionary';
    return 'neutral';
  };
  
  const getMoveQualities = (game: GameReview): Array<{ quality: MoveQuality; count: number }> => {
    return [
      { quality: 'brilliant' as MoveQuality, count: game.brilliants },
      { quality: 'good' as MoveQuality, count: game.goods },
      { quality: 'inaccuracy' as MoveQuality, count: game.inaccuracies },
      { quality: 'mistake' as MoveQuality, count: game.mistakes },
      { quality: 'blunder' as MoveQuality, count: game.blunders },
    ].filter(q => q.count > 0);
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
          const sentiment = getCoachSentiment(game.result, game.accuracy);
          const moveQualities = getMoveQualities(game);
          const isExpanded = expandedGame === game.id;
          
          return (
            <Card key={game.id} variant="elevated" size="md" hoverable pressable>
              <TouchableOpacity
                style={styles.gameCard}
                onPress={() => router.push(`/learning/analysis/${game.id}` as never)}
              >
                <VStack gap={4}>
                  {/* Header with Coach Avatar */}
                  <HStack gap={3} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <HStack gap={3} style={{ alignItems: 'center', flex: 1 }}>
                      <CoachAvatar
                        expression={sentiment === 'positive' ? 'happy' : sentiment === 'critical' ? 'concerned' : sentiment === 'cautionary' ? 'thoughtful' : 'neutral'}
                        size="sm"
                        animated
                      />
                      <VStack gap={1} style={{ flex: 1 }}>
                        <Text style={[styles.opponent, { color: colors.foreground.primary }]}>
                          vs {game.opponent}
                        </Text>
                        <Text style={[styles.date, { color: colors.foreground.muted }]}>
                          {new Date(game.date).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </HStack>
                    <View style={[styles.resultBadge, { backgroundColor: resultStyle.color + '20' }]}>
                      <HStack gap={2} alignItems="center">
                        <Icon name={resultStyle.icon} size={16} color={resultStyle.color} />
                        <Text style={[styles.result, { color: resultStyle.color }]}>
                          {resultStyle.text}
                        </Text>
                      </HStack>
                    </View>
                  </HStack>

                  {/* Quick Stats */}
                  <HStack gap={4} style={{ justifyContent: 'space-around' }}>
                    <VStack gap={1} style={{ alignItems: 'center' }}>
                      <Text style={[styles.statLabel, { color: colors.foreground.tertiary }]}>
                        Your Accuracy
                      </Text>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                        {game.accuracy}%
                      </Text>
                    </VStack>
                    
                    <VStack gap={1} style={{ alignItems: 'center' }}>
                      <Text style={[styles.statLabel, { color: colors.foreground.tertiary }]}>
                        Opponent
                      </Text>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                        {game.opponentAccuracy}%
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Move Quality Badges */}
                  <View>
                    <Text style={[styles.sectionLabel, { color: colors.foreground.secondary, marginBottom: 8 }]}>
                      Move Quality
                    </Text>
                    <HStack gap={2} style={{ flexWrap: 'wrap' }}>
                      {moveQualities.map(({ quality, count }) => (
                        <HStack key={quality} gap={1} style={{ alignItems: 'center' }}>
                          <MoveQualityBadge
                            quality={quality}
                            size="xs"
                            variant="solid"
                          />
                          <Text style={[styles.qualityCount, { color: colors.foreground.secondary }]}>
                            ×{count}
                          </Text>
                        </HStack>
                      ))}
                    </HStack>
                  </View>

                  {/* Accuracy Graph Preview */}
                  <View>
                    <TouchableOpacity
                      style={styles.expandButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        setExpandedGame(isExpanded ? null : game.id);
                      }}
                    >
                      <Text style={[styles.sectionLabel, { color: colors.foreground.secondary }]}>
                        Accuracy Timeline {isExpanded ? '▼' : '▶'}
                      </Text>
                    </TouchableOpacity>
                    
                    {isExpanded && (
                      <View style={{ marginTop: 8 }}>
                        <AccuracyGraph
                          playerData={game.accuracyTimeline}
                          opponentData={game.opponentAccuracyTimeline}
                          playerName="You"
                          opponentName={game.opponent}
                          height={120}
                          showThresholds={false}
                          showAverages
                          animated
                        />
                      </View>
                    )}
                  </View>

                  {/* Call to Action */}
                  <View style={[styles.ctaBar, { backgroundColor: colors.accent.primary + '10' }]}>
                    <Text style={[styles.ctaText, { color: colors.accent.primary }]}>
                      🔍 View Full Analysis
                    </Text>
                  </View>
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
              onPress={() => router.push('/(tabs)/' as never)}
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
    fontSize: 16,
    fontWeight: '600',
  },
  result: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  qualityCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  expandButton: {
    paddingVertical: 4,
  },
  ctaBar: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
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

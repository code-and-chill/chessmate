import {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {Card} from '@/ui/primitives/Card';
import {useThemeTokens, VStack} from '@/ui';
import type {PuzzleAttempt} from '@/contexts/PuzzleContext';
import {usePuzzle} from '@/contexts/PuzzleContext';
import {useI18n} from '@/i18n/I18nContext';

export default function PuzzleHistoryScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
    const {puzzleStats, getAttemptHistory} = usePuzzle();

  const [history, setHistory] = useState<PuzzleAttempt[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'solved' | 'failed'>('all');

    const loadHistory = useCallback(async () => {
        const data = await getAttemptHistory();
    setHistory(data);
    }, [getAttemptHistory]);

    useEffect(() => {
        void loadHistory();
    }, [loadHistory]);

  const filteredHistory = history.filter((attempt) => {
    if (selectedFilter === 'solved') return attempt.solved;
    if (selectedFilter === 'failed') return !attempt.solved;
    return true;
  });

  const renderAttemptCard = ({ item, index }: { item: PuzzleAttempt; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <Card variant="default" size="md" style={{ marginBottom: 12 }}>
        <TouchableOpacity
          style={styles.attemptCard}
          onPress={() => router.push({pathname: '/puzzle/review', params: {attemptId: item.attemptId}} as any)}
        >
          <View style={styles.attemptHeader}>
            <Text style={styles.attemptIcon}>{item.solved ? '✓' : '✗'}</Text>
            <VStack gap={1} style={{ flex: 1 }}>
              <Text style={[styles.attemptTitle, { color: colors.foreground.primary }]}>{ti('puzzle.puzzle_number', { id: item.puzzleId.slice(0, 8) })}</Text>
              <Text style={[styles.attemptDate, { color: colors.foreground.secondary }]}>
                  {new Date(item.timestamp ?? Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </VStack>
            <VStack gap={1} style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.attemptRating, { color: colors.foreground.primary }]}>{item.puzzleRating}</Text>
              <Text style={[styles.attemptTime, { color: colors.foreground.secondary }]}>{item.timeSpent}s</Text>
            </VStack>
          </View>

            {typeof item.ratingChange === 'number' && item.ratingChange !== 0 && (
            <View style={styles.ratingChange}>
              <Text
                style={[
                  styles.ratingChangeText,
                  item.ratingChange > 0 ? styles.ratingUp : styles.ratingDown,
                ]}
              >
                {item.ratingChange > 0 ? '+' : ''}{item.ratingChange}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <VStack style={styles.content} gap={6}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('puzzle.puzzle_history')}</Text>
        </Animated.View>

        {/* Stats Summary */}
        {puzzleStats && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Card variant="gradient" size="md">
              <VStack gap={3} style={{ padding: 16 }}>
                <Text style={[styles.statsTitle, { color: colors.foreground.primary }]}>{t('puzzle.performance_overview')}</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.foreground.primary }]}>{puzzleStats.totalSolved}</Text>
                    <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('puzzle.total_solved')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.foreground.primary }]}>{puzzleStats.userRating}</Text>
                    <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('puzzle.current_rating')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.foreground.primary }]}>{puzzleStats.currentStreak}🔥</Text>
                    <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('puzzle.current_streak')}</Text>
                  </View>
                  <View style={styles.statItem}>
                      <Text
                          style={[styles.statValue, {color: colors.foreground.primary}]}>{puzzleStats.longestStreak}🏆</Text>
                    <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('puzzle.best_streak')}</Text>
                  </View>
                </View>

                {/* Difficulty Breakdown */}
                <View style={[styles.difficultyBreakdown, { borderTopColor: colors.background.tertiary }]}>
                  <Text style={[styles.breakdownTitle, { color: colors.foreground.secondary }]}>{t('puzzle.by_difficulty')}</Text>
                    {Object.entries(puzzleStats.byDifficulty).map(([difficulty, count]) => {
                        // `count` is an object like { attempted: number, solved: number }
                        const attempted = (count as any)?.attempted ?? 0;
                        const solved = (count as any)?.solved ?? 0;
                        return (
                            <View key={difficulty} style={styles.breakdownRow}>
                                <Text
                                    style={[styles.breakdownLabel, {color: colors.foreground.secondary}]}>{difficulty}</Text>
                                <Text
                                    style={[styles.breakdownValue, {color: colors.foreground.primary}]}>{`${attempted} / ${solved}`}</Text>
                            </View>
                        );
                    })}
                </View>
              </VStack>
            </Card>
          </Animated.View>
        )}

        {/* Filter Tabs */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={styles.filterTabs}>
            {['all', 'solved', 'failed'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  { backgroundColor: selectedFilter === filter ? colors.accent.primary : colors.background.secondary, borderColor: selectedFilter === filter ? colors.accent.primary : colors.background.tertiary },
                ]}
                onPress={() => setSelectedFilter(filter as typeof selectedFilter)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: selectedFilter === filter ? colors.accentForeground.primary : colors.foreground.secondary },
                  ]}
                >
                  {filter === 'all' ? t('puzzle.filter_all') : filter === 'solved' ? t('puzzle.filter_solved') : t('puzzle.filter_failed')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* History List */}
        <View style={{ flex: 1 }}>
          {filteredHistory.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <Card variant="default" size="md">
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🎯</Text>
                  <Text style={[styles.emptyTitle, { color: colors.foreground.primary }]}>{t('puzzle.no_puzzles_yet')}</Text>
                  <Text style={[styles.emptyText, { color: colors.foreground.secondary }]}>
                    {t('puzzle.start_solving_hint')}
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/puzzle')}
                  >
                    <Text style={styles.emptyButtonText}>{t('puzzle.try_puzzle')}</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </Animated.View>
          ) : (
            <FlatList
              data={filteredHistory}
              renderItem={renderAttemptCard}
              keyExtractor={(item) => (item.attemptId ?? `${item.puzzleId}_${item.timestamp ?? ''}`) as string}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </View>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '40%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  difficultyBreakdown: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  filterTabActive: {
    // Handled inline
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTabTextActive: {
    // Handled inline
  },
  attemptCard: {
    padding: 16,
  },
  attemptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attemptIcon: {
    fontSize: 32,
    width: 40,
    textAlign: 'center',
  },
  attemptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attemptDate: {
    fontSize: 12,
  },
  attemptRating: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attemptTime: {
    fontSize: 12,
  },
  ratingChange: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingChangeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingUp: {
    // Handled inline with colors.success
  },
  ratingDown: {
    // Handled inline with colors.error
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

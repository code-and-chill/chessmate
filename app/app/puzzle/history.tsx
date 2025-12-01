import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { usePuzzle } from '@/contexts/PuzzleContext';
import type { PuzzleAttempt } from '@/contexts/PuzzleContext';

export default function PuzzleHistoryScreen() {
  const router = useRouter();
  const { puzzleStats, getUserHistory, isLoading } = usePuzzle();
  
  const [history, setHistory] = useState<PuzzleAttempt[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'solved' | 'failed'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getUserHistory();
    setHistory(data);
  };

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
          onPress={() => router.push({ pathname: '/puzzle/review', params: { attemptId: item.attemptId } })}
        >
          <View style={styles.attemptHeader}>
            <Text style={styles.attemptIcon}>{item.solved ? '✓' : '✗'}</Text>
            <VStack gap={1} style={{ flex: 1 }}>
              <Text style={styles.attemptTitle}>Puzzle #{item.puzzleId.slice(0, 8)}</Text>
              <Text style={styles.attemptDate}>
                {new Date(item.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </VStack>
            <VStack gap={1} style={{ alignItems: 'flex-end' }}>
              <Text style={styles.attemptRating}>{item.puzzleRating}</Text>
              <Text style={styles.attemptTime}>{item.timeSpent}s</Text>
            </VStack>
          </View>
          
          {item.ratingChange !== 0 && (
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
    <SafeAreaView style={styles.container}>
      <VStack style={styles.content} gap={6}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Puzzle History</Text>
        </Animated.View>

        {/* Stats Summary */}
        {puzzleStats && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Card variant="gradient" size="md">
              <VStack gap={3} style={{ padding: 16 }}>
                <Text style={styles.statsTitle}>Performance Overview</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{puzzleStats.totalSolved}</Text>
                    <Text style={styles.statLabel}>Total Solved</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{puzzleStats.userRating}</Text>
                    <Text style={styles.statLabel}>Current Rating</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{puzzleStats.currentStreak}🔥</Text>
                    <Text style={styles.statLabel}>Current Streak</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{puzzleStats.bestStreak}🏆</Text>
                    <Text style={styles.statLabel}>Best Streak</Text>
                  </View>
                </View>

                {/* Difficulty Breakdown */}
                <View style={styles.difficultyBreakdown}>
                  <Text style={styles.breakdownTitle}>By Difficulty</Text>
                  {Object.entries(puzzleStats.byDifficulty).map(([difficulty, count]) => (
                    <View key={difficulty} style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>{difficulty}</Text>
                      <Text style={styles.breakdownValue}>{count}</Text>
                    </View>
                  ))}
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
                  selectedFilter === filter && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter as typeof selectedFilter)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === filter && styles.filterTabTextActive,
                  ]}
                >
                  {filter === 'all' ? 'All' : filter === 'solved' ? '✓ Solved' : '✗ Failed'}
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
                  <Text style={styles.emptyTitle}>No puzzles yet</Text>
                  <Text style={styles.emptyText}>
                    Start solving puzzles to see your history here
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/puzzle')}
                  >
                    <Text style={styles.emptyButtonText}>Try a Puzzle</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </Animated.View>
          ) : (
            <FlatList
              data={filteredHistory}
              renderItem={renderAttemptCard}
              keyExtractor={(item) => item.attemptId}
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
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  difficultyBreakdown: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#94A3B8',
    textTransform: 'capitalize',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  filterTabActive: {
    backgroundColor: '#334155',
    borderColor: '#667EEA',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  attemptDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  attemptRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  attemptTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  ratingChange: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#334155',
  },
  ratingChangeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingUp: {
    color: '#10B981',
  },
  ratingDown: {
    color: '#EF4444',
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
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#667EEA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

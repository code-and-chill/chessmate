import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DetailScreenLayout } from '@/ui/components/DetailScreenLayout';
import { Card } from '@/ui/primitives/Card';
import { VStack, useColors } from '@/ui';
import { useLearning } from '@/contexts/LearningContext';
import type { Lesson } from '@/contexts/LearningContext';
import { useI18n } from '@/i18n/I18nContext';

const CATEGORY_ICONS: Record<string, string> = {
  openings: '📖',
  tactics: '⚔️',
  endgames: '🏁',
  strategy: '🎯',
  theory: '🧠',
};

export default function LearningHubScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const colors = useColors();
  const { learningStats, getAllLessons, getUserStats } = useLearning();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadLessons = useCallback(async () => {
    const data = await getAllLessons();
    setLessons(data);
  }, [getAllLessons]);

  const loadStats = useCallback(async () => {
    try {
      await getUserStats();
    } catch {
      console.log('Stats not available yet');
    }
  }, [getUserStats]);

  useEffect(() => {
    loadLessons();
    loadStats();
  }, [loadLessons, loadStats]);

  const categories = ['all', 'openings', 'tactics', 'endgames', 'strategy', 'theory'];

  const filteredLessons = lessons.filter((lesson) =>
    selectedCategory === 'all' || lesson.category === selectedCategory
  );

  const completedLessons = learningStats?.totalLessonsCompleted || 0;
  const totalLessons = lessons.length;
  const completionPercentage = totalLessons > 0 && completedLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Get list of completed lesson IDs from recent progress
  const completedLessonIds = learningStats?.recentProgress?.filter(p => p.completed).map(p => p.lessonId) || [];

  const renderLessonCard = ({ item, index }: { item: Lesson; index: number }) => {
    const isCompleted = completedLessonIds.includes(item.id);
    const isLocked = (item.requiredLessonIds?.length > 0) && item.requiredLessonIds.some(
      (reqId) => !completedLessonIds.includes(reqId)
    );

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <Card variant="default" size="md" style={{ marginBottom: 12 }}>
          <TouchableOpacity
            style={[styles.lessonCard, isLocked && styles.lessonCardLocked]}
            onPress={() => !isLocked && router.push({ pathname: '/learning/lesson', params: { lessonId: item.id } } as unknown as any)}
            disabled={isLocked}
          >
            <View style={styles.lessonHeader}>
              <Text style={styles.categoryIcon}>
                {CATEGORY_ICONS[item.category] || '📚'}
              </Text>
              <VStack gap={1} style={{ flex: 1 }}>
                <Text style={[styles.lessonTitle, { color: isLocked ? colors.foreground.muted : colors.foreground.primary }]}>
                  {item.title}
                  {isCompleted && ' ✓'}
                  {isLocked && ' 🔒'}
                </Text>
                <Text style={[styles.lessonDifficulty, { color: colors.foreground.tertiary }]}>
                  {item.difficulty.toUpperCase()} • {item.estimatedMinutes} min
                </Text>
              </VStack>
            </View>
            
            <Text 
              style={[styles.lessonDescription, { color: isLocked ? colors.foreground.muted : colors.foreground.secondary }]} 
              numberOfLines={2}
            >
              {item.description}
            </Text>

            {isLocked && (
              <View style={[styles.lockedBanner, { backgroundColor: colors.background.tertiary, borderLeftColor: colors.warning }]}>
                <Text style={[styles.lockedText, { color: colors.warning }]}>
                  Complete required lessons to unlock
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  return (
    <DetailScreenLayout
      title={t('learn.interactive_lessons') || 'Interactive Lessons'}
      subtitle={t('learn.master_chess_step_by_step') || 'Master chess step by step'}
    >
      <VStack gap={6}>
        {/* Progress Card */}
        {learningStats && (
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Card variant="gradient" size="md">
              <VStack gap={3} style={{ padding: 16 }}>
                <Text style={[styles.progressTitle, { color: colors.foreground.primary }]}>
                  {t('learn.your_progress') || 'Your Progress'}
                </Text>
                
                {/* Progress Bar */}
                <View>
                  <View style={[styles.progressBarContainer, { backgroundColor: colors.background.tertiary }]}>
                    <View style={[styles.progressBar, { width: `${completionPercentage}%`, backgroundColor: colors.accent.primary }]} />
                  </View>
                  <Text style={[styles.progressText, { color: colors.foreground.secondary }]}>
                    {completedLessons} of {totalLessons} lessons completed ({completionPercentage}%)
                  </Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                      {learningStats.currentStreak}🔥
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>Day Streak</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                      {Math.round(learningStats.totalTimeSpent / 60)}h
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>Time Spent</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                      {learningStats.totalLessonsCompleted}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>Completed</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                      {Math.round(learningStats.averageQuizScore)}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>Avg Score</Text>
                  </View>
                </View>
              </VStack>
            </Card>
          </Animated.View>
        )}

        {/* Category Filter */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryFilter}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    { 
                      backgroundColor: selectedCategory === category ? colors.accent.primary : colors.background.secondary,
                      borderColor: selectedCategory === category ? colors.accent.primary : colors.background.tertiary
                    }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: selectedCategory === category ? '#FFFFFF' : colors.foreground.secondary }
                    ]}
                  >
                    {category === 'all' ? '📚 All' : `${CATEGORY_ICONS[category]} ${category}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Lessons List */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <VStack gap={2}>
            <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
              {selectedCategory === 'all' ? 'All Lessons' : `${selectedCategory} Lessons`}
            </Text>
            
            {filteredLessons.length === 0 ? (
              <Card variant="default" size="md">
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📚</Text>
                  <Text style={[styles.emptyText, { color: colors.foreground.secondary }]}>
                    No lessons found
                  </Text>
                </View>
              </Card>
            ) : (
              <FlatList
                data={filteredLessons}
                renderItem={renderLessonCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </VStack>
        </Animated.View>
      </VStack>
    </DetailScreenLayout>
  );
}

const styles = StyleSheet.create({
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
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
  categoryFilter: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  lessonCard: {
    padding: 16,
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 32,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lessonDifficulty: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  lessonDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  lockedBanner: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});

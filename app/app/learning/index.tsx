import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { useLearning } from '@/contexts/LearningContext';
import type { Lesson } from '@/contexts/LearningContext';

const CATEGORY_ICONS: Record<string, string> = {
  openings: '📖',
  tactics: '⚔️',
  endgames: '🏁',
  strategy: '🎯',
  theory: '🧠',
};

export default function LearningHubScreen() {
  const router = useRouter();
  const { progress, getAllLessons, getUserProgress, isLoading } = useLearning();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadLessons();
    getUserProgress();
  }, []);

  const loadLessons = async () => {
    const data = await getAllLessons();
    setLessons(data);
  };

  const categories = ['all', 'openings', 'tactics', 'endgames', 'strategy', 'theory'];

  const filteredLessons = lessons.filter((lesson) =>
    selectedCategory === 'all' || lesson.category === selectedCategory
  );

  const completedLessons = progress?.completedLessons.length || 0;
  const totalLessons = lessons.length;
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const renderLessonCard = ({ item, index }: { item: Lesson; index: number }) => {
    const isCompleted = progress?.completedLessons.includes(item.id);
    const isLocked = item.requiredLessonIds.some(
      (reqId) => !progress?.completedLessons.includes(reqId)
    );

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <Card variant="default" size="md" style={{ marginBottom: 12 }}>
          <TouchableOpacity
            style={[styles.lessonCard, isLocked && styles.lessonCardLocked]}
            onPress={() => !isLocked && router.push({ pathname: '/learning/lesson', params: { lessonId: item.id } })}
            disabled={isLocked}
          >
            <View style={styles.lessonHeader}>
              <Text style={styles.categoryIcon}>
                {CATEGORY_ICONS[item.category] || '📚'}
              </Text>
              <VStack gap={1} style={{ flex: 1 }}>
                <Text style={[styles.lessonTitle, isLocked && styles.textLocked]}>
                  {item.title}
                  {isCompleted && ' ✓'}
                  {isLocked && ' 🔒'}
                </Text>
                <Text style={styles.lessonDifficulty}>
                  {item.difficulty.toUpperCase()} • {item.estimatedMinutes} min
                </Text>
              </VStack>
            </View>
            
            <Text style={[styles.lessonDescription, isLocked && styles.textLocked]} numberOfLines={2}>
              {item.description}
            </Text>

            {isLocked && (
              <View style={styles.lockedBanner}>
                <Text style={styles.lockedText}>
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={styles.title}>Learning Center</Text>
            <Text style={styles.subtitle}>Master chess step by step</Text>
          </Animated.View>

          {/* Progress Card */}
          {progress && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Card variant="gradient" size="md">
                <VStack gap={3} style={{ padding: 16 }}>
                  <Text style={styles.progressTitle}>Your Progress</Text>
                  
                  {/* Progress Bar */}
                  <View>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {completedLessons} of {totalLessons} lessons completed ({completionPercentage}%)
                    </Text>
                  </View>

                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{progress.currentStreak}🔥</Text>
                      <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{progress.totalTimeSpent}h</Text>
                      <Text style={styles.statLabel}>Time Spent</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{progress.quizzesCompleted}</Text>
                      <Text style={styles.statLabel}>Quizzes</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{progress.averageQuizScore}%</Text>
                      <Text style={styles.statLabel}>Avg Score</Text>
                    </View>
                  </View>
                </VStack>
              </Card>
            </Animated.View>
          )}

          {/* Category Filter */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryFilter}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategory === category && styles.categoryChipTextActive,
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
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <VStack gap={2}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'all' ? 'All Lessons' : `${selectedCategory} Lessons`}
              </Text>
              
              {filteredLessons.length === 0 ? (
                <Card variant="default" size="md">
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📚</Text>
                    <Text style={styles.emptyText}>No lessons found</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667EEA',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#94A3B8',
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
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
  },
  categoryChipActive: {
    backgroundColor: '#334155',
    borderColor: '#667EEA',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  lessonDifficulty: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  textLocked: {
    color: '#64748B',
  },
  lockedBanner: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  lockedText: {
    fontSize: 12,
    color: '#F59E0B',
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
    color: '#94A3B8',
  },
});

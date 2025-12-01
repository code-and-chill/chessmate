import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { usePuzzle } from '@/contexts/PuzzleContext';

export default function PuzzleHubScreen() {
  const router = useRouter();
  const { dailyPuzzle, puzzleStats, getDailyPuzzle, getUserStats, isLoading } = usePuzzle();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  useEffect(() => {
    getDailyPuzzle();
    getUserStats();
  }, []);

  const difficulties = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master'];
  const themes = ['fork', 'pin', 'skewer', 'sacrifice', 'checkmate', 'endgame'];

  const toggleDifficulty = (diff: string) => {
    setSelectedDifficulty(prev =>
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    );
  };

  const toggleTheme = (theme: string) => {
    setSelectedThemes(prev =>
      prev.includes(theme) ? prev.filter(t => t !== theme) : [...prev, theme]
    );
  };

  const startRandomPuzzle = () => {
    const filter = {
      difficulty: selectedDifficulty.length ? selectedDifficulty : undefined,
      themes: selectedThemes.length ? selectedThemes : undefined,
    };
    router.push({
      pathname: '/puzzle/play',
      params: { mode: 'random', filter: JSON.stringify(filter) },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loaderText}>Loading puzzles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={styles.title}>Puzzles</Text>
            <Text style={styles.subtitle}>Sharpen your tactical skills</Text>
          </Animated.View>

          {/* Stats Card */}
          {puzzleStats && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Card variant="gradient" size="md">
                <VStack gap={3} style={{ padding: 16 }}>
                  <Text style={styles.statsTitle}>Your Progress</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{puzzleStats.totalSolved}</Text>
                      <Text style={styles.statLabel}>Solved</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{puzzleStats.userRating}</Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{puzzleStats.currentStreak}🔥</Text>
                      <Text style={styles.statLabel}>Streak</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {Math.round((puzzleStats.totalSolved / puzzleStats.totalAttempts) * 100)}%
                      </Text>
                      <Text style={styles.statLabel}>Success</Text>
                    </View>
                  </View>
                </VStack>
              </Card>
            </Animated.View>
          )}

          {/* Daily Puzzle */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Card variant="default" size="md">
              <TouchableOpacity
                style={styles.dailyPuzzle}
                onPress={() => router.push('/puzzle/daily')}
              >
                <View style={styles.dailyHeader}>
                  <Text style={styles.dailyIcon}>⭐</Text>
                  <VStack gap={1}>
                    <Text style={styles.dailyTitle}>Daily Puzzle</Text>
                    <Text style={styles.dailySubtitle}>
                      {dailyPuzzle ? `Rating: ${dailyPuzzle.rating}` : 'Complete today\'s challenge'}
                    </Text>
                  </VStack>
                </View>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            </Card>
          </Animated.View>

          {/* Difficulty Filter */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <VStack gap={2}>
              <Text style={styles.filterLabel}>Difficulty</Text>
              <View style={styles.filterGrid}>
                {difficulties.map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.filterChip,
                      selectedDifficulty.includes(diff) && styles.filterChipActive,
                    ]}
                    onPress={() => toggleDifficulty(diff)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedDifficulty.includes(diff) && styles.filterChipTextActive,
                      ]}
                    >
                      {diff}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </VStack>
          </Animated.View>

          {/* Theme Filter */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <VStack gap={2}>
              <Text style={styles.filterLabel}>Themes</Text>
              <View style={styles.filterGrid}>
                {themes.map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.filterChip,
                      selectedThemes.includes(theme) && styles.filterChipActive,
                    ]}
                    onPress={() => toggleTheme(theme)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedThemes.includes(theme) && styles.filterChipTextActive,
                      ]}
                    >
                      {theme}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </VStack>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <VStack gap={3}>
              <TouchableOpacity style={styles.button} onPress={startRandomPuzzle}>
                <Text style={styles.buttonText}>🎲 Random Puzzle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => router.push('/puzzle/history')}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  📊 View History
                </Text>
              </TouchableOpacity>
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
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
  dailyPuzzle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dailyIcon: {
    fontSize: 40,
  },
  dailyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dailySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  arrow: {
    fontSize: 24,
    color: '#667EEA',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#334155',
    borderColor: '#667EEA',
  },
  filterChipText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#667EEA',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667EEA',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#667EEA',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 16,
  },
});

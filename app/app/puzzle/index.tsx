import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { usePuzzle } from '@/contexts/PuzzleContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

export default function PuzzleHubScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={[styles.loaderText, { color: colors.foreground.secondary }]}>{t('puzzle.loading_puzzles')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('puzzle.puzzles')}</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('puzzle.sharpen_skills')}</Text>
          </Animated.View>

          {/* Stats Card */}
          {puzzleStats && (
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Card variant="gradient" size="md">
                <VStack gap={3} style={{ padding: 16 }}>
                  <Text style={[styles.statsTitle, { color: colors.foreground.primary }]}>{t('puzzle.your_progress')}</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>{puzzleStats.totalSolved}</Text>
                      <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('puzzle.solved')}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>{puzzleStats.userRating}</Text>
                      <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('puzzle.rating')}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>{puzzleStats.currentStreak}🔥</Text>
                      <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('puzzle.streak')}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.foreground.primary }]}>
                        {Math.round((puzzleStats.totalSolved / puzzleStats.totalAttempts) * 100)}%
                      </Text>
                      <Text style={[styles.statLabel, { color: colors.foreground.secondary }]}>{t('puzzle.success')}</Text>
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
                    <Text style={[styles.dailyTitle, { color: colors.foreground.primary }]}>{t('puzzle.daily_puzzle')}</Text>
                    <Text style={[styles.dailySubtitle, { color: colors.foreground.secondary }]}>
                      {dailyPuzzle ? ti('puzzle.rating_value', { rating: dailyPuzzle.rating }) : t('puzzle.complete_today_challenge')}
                    </Text>
                  </VStack>
                </View>
                <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
              </TouchableOpacity>
            </Card>
          </Animated.View>

          {/* Difficulty Filter */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <VStack gap={2}>
              <Text style={[styles.filterLabel, { color: colors.foreground.primary }]}>{t('puzzle.difficulty')}</Text>
              <View style={styles.filterGrid}>
                {difficulties.map((diff) => (
                  <TouchableOpacity
                    key={diff}
                    style={[
                      styles.filterChip,
                      { backgroundColor: selectedDifficulty.includes(diff) ? colors.accent.primary : colors.background.secondary, borderColor: selectedDifficulty.includes(diff) ? colors.accent.primary : colors.background.tertiary },
                    ]}
                    onPress={() => toggleDifficulty(diff)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: selectedDifficulty.includes(diff) ? colors.accentForeground.primary : colors.foreground.secondary },
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
              <Text style={[styles.filterLabel, { color: colors.foreground.primary }]}>Themes</Text>
              <View style={styles.filterGrid}>
                {themes.map((theme) => (
                  <TouchableOpacity
                    key={theme}
                    style={[
                      styles.filterChip,
                      { backgroundColor: selectedThemes.includes(theme) ? colors.accent.primary : colors.background.secondary, borderColor: selectedThemes.includes(theme) ? colors.accent.primary : colors.background.tertiary },
                    ]}
                    onPress={() => toggleTheme(theme)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: selectedThemes.includes(theme) ? colors.accentForeground.primary : colors.foreground.secondary },
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
              <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent.primary }]} onPress={startRandomPuzzle}>
                <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>🎲 Random Puzzle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, { borderColor: colors.accent.primary, backgroundColor: 'transparent' }]}
                onPress={() => router.push('/puzzle/history')}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary, { color: colors.accent.primary }]}>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  statLabel: {
    fontSize: 12,
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
  },
  dailySubtitle: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
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
    borderWidth: 2,
  },
  filterChipActive: {
    // Handled inline
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    // Handled inline
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    // Handled inline
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 16,
    marginTop: 16,
  },
});

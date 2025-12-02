import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, HStack } from '@/ui';
import { StatCard } from '@/ui/components/StatCard';
import { SegmentedControl } from '@/ui/components/SegmentedControl';
import { usePuzzle } from '@/contexts/PuzzleContext';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

export default function PuzzleHubScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const { dailyPuzzle, puzzleStats, getDailyPuzzle, getUserStats, isLoading } = usePuzzle();
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'easy' | 'medium' | 'hard' | 'expert' | 'master'>('all');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  useEffect(() => {
    getDailyPuzzle();
    getUserStats();
  }, []);

  const difficulties = ['all', 'beginner', 'easy', 'medium', 'hard', 'expert', 'master'] as const;
  const themes = [
    { id: 'fork', label: 'Fork', icon: '⚔️' },
    { id: 'pin', label: 'Pin', icon: '📌' },
    { id: 'skewer', label: 'Skewer', icon: '🗡️' },
    { id: 'sacrifice', label: 'Sacrifice', icon: '♕' },
    { id: 'checkmate', label: 'Checkmate', icon: '♔' },
    { id: 'endgame', label: 'Endgame', icon: '🏁' },
  ];

  const toggleTheme = (themeId: string) => {
    setSelectedThemes(prev =>
      prev.includes(themeId) ? prev.filter(t => t !== themeId) : [...prev, themeId]
    );
  };

  const startRandomPuzzle = () => {
    const filter = {
      difficulty: selectedDifficulty !== 'all' ? [selectedDifficulty] : undefined,
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.header}>
            <Text style={[styles.title, { color: colors.accent.primary }]}>{t('puzzle.puzzles')}</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{t('puzzle.sharpen_skills')}</Text>
          </Animated.View>

          {/* Glassmorphic Stats Panel */}
          {puzzleStats && (
            <Animated.View entering={FadeInDown.delay(200).duration(400)}>
              <Panel variant="glass" padding={20}>
                <VStack gap={4}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    {t('puzzle.your_progress')}
                  </Text>
                  <HStack gap={3}>
                    <StatCard 
                      value={puzzleStats.totalSolved.toString()} 
                      label={t('puzzle.solved')} 
                    />
                    <StatCard 
                      value={puzzleStats.userRating.toString()} 
                      label={t('puzzle.rating')} 
                    />
                  </HStack>
                  <HStack gap={3}>
                    <StatCard 
                      value={`🔥 ${puzzleStats.currentStreak}`} 
                      label={t('puzzle.streak')} 
                    />
                    <StatCard 
                      value={`${Math.round((puzzleStats.totalSolved / puzzleStats.totalAttempts) * 100)}%`} 
                      label={t('puzzle.success')} 
                    />
                  </HStack>
                </VStack>
              </Panel>
            </Animated.View>
          )}

          {/* Daily Puzzle Hero Card */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Pressable onPress={() => router.push('/puzzle/daily')}>
              <Panel variant="glass" padding={24} style={[styles.dailyPuzzlePanel, { shadowColor: colors.accent.primary }]}>
                <VStack gap={3} style={{ alignItems: 'center' }}>
                  <View style={styles.dailyBadge}>
                    <Text style={styles.dailyIcon}>⭐</Text>
                  </View>
                  <VStack gap={1} style={{ alignItems: 'center' }}>
                    <Text style={[styles.dailyTitle, { color: colors.foreground.primary }]}>
                      {t('puzzle.daily_puzzle')}
                    </Text>
                    <Text style={[styles.dailySubtitle, { color: colors.foreground.secondary }]}>
                      {dailyPuzzle 
                        ? ti('puzzle.rating_value', { rating: dailyPuzzle.rating }) 
                        : t('puzzle.complete_today_challenge')}
                    </Text>
                  </VStack>
                  <View style={[
                    styles.playButton, 
                    { 
                      backgroundColor: colors.accent.primary,
                      shadowColor: colors.accent.primary,
                    }
                  ]}>
                    <Text style={[styles.playButtonText, { color: '#FFFFFF' }]}>Play Now →</Text>
                  </View>
                </VStack>
              </Panel>
            </Pressable>
          </Animated.View>

          {/* Difficulty Selector */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <Panel variant="glass" padding={20}>
              <VStack gap={3}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                  {t('puzzle.difficulty')}
                </Text>
                <SegmentedControl
                  segments={difficulties}
                  selectedSegment={selectedDifficulty}
                  onSegmentChange={setSelectedDifficulty}
                />
              </VStack>
            </Panel>
          </Animated.View>

          {/* Theme Selector */}
          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Panel variant="glass" padding={20}>
              <VStack gap={3}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                  Themes
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.themeScroll}
                >
                  {themes.map((theme) => {
                    const isSelected = selectedThemes.includes(theme.id);
                    return (
                      <Pressable
                        key={theme.id}
                        style={[
                          styles.themeChip,
                          {
                            backgroundColor: isSelected ? colors.accent.primary : colors.background.secondary,
                            borderColor: isSelected ? colors.accent.primary : colors.background.tertiary,
                          },
                        ]}
                        onPress={() => toggleTheme(theme.id)}
                      >
                        <Text style={styles.themeIcon}>{theme.icon}</Text>
                        <Text
                          style={[
                            styles.themeLabel,
                            { color: isSelected ? '#FFFFFF' : colors.foreground.secondary },
                          ]}
                        >
                          {theme.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </VStack>
            </Panel>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <VStack gap={3} style={styles.actionButtons}>
              <Pressable 
                style={[
                  styles.primaryButton, 
                  { 
                    backgroundColor: colors.accent.primary,
                    shadowColor: colors.accent.primary,
                  }
                ]} 
                onPress={startRandomPuzzle}
              >
                <Text style={styles.primaryButtonText}>🎲 Start Training</Text>
              </Pressable>
              
              <Pressable
                style={[styles.secondaryButton, { borderColor: colors.background.tertiary }]}
                onPress={() => router.push('/puzzle/history')}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.foreground.primary }]}>
                  📊 View History
                </Text>
              </Pressable>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  dailyPuzzlePanel: {
    // shadowColor set dynamically from theme
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  dailyBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyIcon: {
    fontSize: 32,
  },
  dailyTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  dailySubtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  playButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    // shadowColor set dynamically from theme
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeScroll: {
    gap: 12,
    paddingVertical: 2,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  themeIcon: {
    fontSize: 18,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    marginTop: 8,
  },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    // shadowColor set dynamically from theme
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 17,
    marginTop: 20,
    fontWeight: '500',
  },
});

/**
 * Home Screen - Production DLS Example
 * app/app/(tabs)/home-example.tsx
 * 
 * This demonstrates the complete DLS transformation with:
 * - Component lifecycle states
 * - Design tokens throughout
 * - Chess-specific components
 * - Animations and interactions
 */

import { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Text,
  Button,
  Card,
  GameCard,
  ComponentStateManager,
  EmptyState,
  List,
  ListItem,
  Badge,
  spacingScale,
  spacingTokens,
  textVariants,
  colorTokens,
  getColor,
} from '@/ui';
import type { ComponentState } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeTokens } from '@/ui';

type GameData = {
  id: string;
  players: {
    white: { id: string; username: string; rating: number; avatar?: string };
    black: { id: string; username: string; rating: number; avatar?: string };
  };
  currentTurn: 'white' | 'black';
  timeControl: string;
  status: 'active' | 'completed' | 'pending' | 'abandoned';
  result?: 'win' | 'loss' | 'draw' | null;
  userColor?: 'white' | 'black';
  lastMove?: string;
  moveCount?: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { colors, isDark } = useThemeTokens();
  
  const [activeGames, setActiveGames] = useState<GameData[]>([]);
  const [gameState, setGameState] = useState<ComponentState>('loading');
  const [puzzleOfDay, setPuzzleOfDay] = useState<{ rating: number; solved: boolean } | null>(null);

  useEffect(() => {
    fetchActiveGames();
    fetchDailyPuzzle();
  }, []);

  const fetchActiveGames = async () => {
    setGameState('loading');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      const games: GameData[] = [
        {
          id: 'game-1',
          players: {
            white: { id: '1', username: 'Magnus', rating: 2800 },
            black: { id: user?.id || '2', username: user?.username || 'You', rating: 2100 },
          },
          currentTurn: 'black',
          timeControl: '10+0',
          status: 'active',
          userColor: 'black',
          lastMove: 'Nf3',
          moveCount: 12,
        },
      ];
      
      setActiveGames(games);
      setGameState(games.length > 0 ? 'ready' : 'empty');
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setGameState('error');
    }
  };

  const fetchDailyPuzzle = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPuzzleOfDay({ rating: 1850, solved: false });
  };

  const quickActions = [
    {
      id: 'play-online',
      title: 'Play Online',
      subtitle: 'Find an opponent',
      icon: '♟️',
      onPress: () => router.push('/(tabs)/play/online'),
    },
    {
      id: 'puzzles',
      title: 'Daily Puzzle',
      subtitle: puzzleOfDay?.solved ? 'Solved ✓' : `Rating ${puzzleOfDay?.rating || '—'}`,
      icon: '🧩',
      badge: puzzleOfDay?.solved ? undefined : 'New',
      onPress: () => router.push('/puzzle/daily'),
    },
    {
      id: 'learn',
      title: 'Learn',
      subtitle: 'Improve your game',
      icon: '📚',
      onPress: () => router.push('/(tabs)/learn'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <View>
            <Text {...textVariants.display} color={colors.foreground.primary}>
              Welcome back{user?.username ? `, ${user.username}` : ''}
            </Text>
            <Text
              {...textVariants.body}
              color={colors.foreground.secondary}
              style={{ marginTop: spacingTokens[1] }}
            >
              Ready to play some chess?
            </Text>
          </View>
        </Animated.View>

        {/* Active Games Section */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text {...textVariants.title} color={colors.foreground.primary}>
              Your Games
            </Text>
            {activeGames.length > 0 && (
              <Badge variant="default" size="sm">
                {activeGames.length}
              </Badge>
            )}
          </View>

          <ComponentStateManager
            state={gameState}
            emptyState={{
              title: 'No active games',
              description: 'Start a new game to see it here',
              illustration: <Text style={{ fontSize: 64 }}>♟️</Text>,
              action: {
                label: 'Play Now',
                onPress: () => router.push('/(tabs)/play/online'),
              },
              isDark,
            }}
            loadingState={{ message: 'Loading your games...' }}
            errorState={{
              message: 'Failed to load games',
              retry: fetchActiveGames,
              isDark,
            }}
          >
            <View style={{ gap: spacingScale.md }}>
              {activeGames.map((game, index) => (
                <Animated.View
                  key={game.id}
                  entering={FadeInDown.delay(300 + index * 100).duration(500)}
                >
                  <GameCard
                    gameId={game.id}
                    players={game.players}
                    currentTurn={game.currentTurn}
                    timeControl={game.timeControl}
                    status={game.status}
                    result={game.result}
                    userColor={game.userColor}
                    lastMove={game.lastMove}
                    moveCount={game.moveCount}
                    onPress={() => router.push(`/game/${game.id}`)}
                    isDark={isDark}
                  />
                </Animated.View>
              ))}
            </View>
          </ComponentStateManager>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          style={styles.section}
        >
          <Text
            {...textVariants.title}
            color={colors.foreground.primary}
            style={styles.sectionTitle}
          >
            Quick Actions
          </Text>

          <Card variant="default" size="md" style={styles.quickActionsCard}>
            <List divided spacing="none">
              {quickActions.map((action, index) => (
                <Animated.View
                  key={action.id}
                  entering={FadeInDown.delay(500 + index * 50).duration(400)}
                >
                  <ListItem
                    title={action.title}
                    subtitle={action.subtitle}
                    leading={
                      <View style={styles.actionIcon}>
                        <Text style={{ fontSize: 28 }}>{action.icon}</Text>
                      </View>
                    }
                    trailing={
                      action.badge ? (
                        <Badge variant="success" size="sm">
                          {action.badge}
                        </Badge>
                      ) : (
                        <Text
                          {...textVariants.body}
                          color={colors.foreground.muted}
                        >
                          →
                        </Text>
                      )
                    }
                    onPress={action.onPress}
                    animated
                    isDark={isDark}
                  />
                </Animated.View>
              ))}
            </List>
          </Card>
        </Animated.View>

        {/* Stats Card */}
        {user && (
          <Animated.View
            entering={FadeInDown.delay(700).duration(500)}
            style={styles.section}
          >
            <Text
              {...textVariants.title}
              color={colors.foreground.primary}
              style={styles.sectionTitle}
            >
              Your Progress
            </Text>

            <Card variant="elevated" size="md">
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text
                    {...textVariants.displayLarge}
                    color={colors.foreground.primary}
                  >
                    {user.rating || 1200}
                  </Text>
                  <Text
                    {...textVariants.caption}
                    color={colors.foreground.secondary}
                  >
                    Rating
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text
                    {...textVariants.displayLarge}
                    color={colors.foreground.primary}
                  >
                    24
                  </Text>
                  <Text
                    {...textVariants.caption}
                    color={colors.foreground.secondary}
                  >
                    Games
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text
                    {...textVariants.displayLarge}
                    color={colors.foreground.primary}
                  >
                    67%
                  </Text>
                  <Text
                    {...textVariants.caption}
                    color={colors.foreground.secondary}
                  >
                    Win Rate
                  </Text>
                </View>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* CTA */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          style={styles.section}
        >
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push('/(tabs)/play/online')}
            animated
          >
            Start New Game
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacingScale.gutter,
    paddingBottom: spacingScale.xxl,
  },
  header: {
    marginBottom: spacingScale.xl,
  },
  section: {
    marginBottom: spacingScale.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingScale.md,
  },
  sectionTitle: {
    marginBottom: spacingScale.md,
  },
  quickActionsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  actionIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacingScale.md,
  },
  statItem: {
    alignItems: 'center',
    gap: spacingTokens[2],
  },
});

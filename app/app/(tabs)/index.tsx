import { useState } from 'react';
import { StyleSheet, View, Pressable, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { PlayScreen } from '@/features/board';
import { Panel } from '@/ui/primitives/Panel';
import { StatCard } from '@/ui/components/StatCard';
import { VStack, HStack, useThemeTokens, Icon } from '@/ui';
import { SafeAreaView } from 'react-native-safe-area-context';

type PlayMode = 'hub' | 'game';

export default function PlayTab() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const [mode, setMode] = useState<PlayMode>('hub');
  const [gameId] = useState('game-demo-1');

  // Game screen
  if (mode === 'game') {
    return (
      <View style={styles.container}>
        <PlayScreen gameId={gameId} />
      </View>
    );
  }

  // Play Hub
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.header}>
            <Text style={[styles.title, { color: colors.accent.primary }]}>Play Chess</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
              Choose your game mode to get started
            </Text>
          </Animated.View>

          {/* Stats Panel */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Panel variant="glass" padding={20}>
              <VStack gap={4}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                  Your Stats
                </Text>
                <HStack gap={3}>
                  <StatCard icon="bolt" value="1450" label="Rating" />
                  <StatCard icon="flame" value="7" label="Streak" />
                </HStack>
                <HStack gap={3}>
                  <StatCard value="34" label="Games" />
                  <StatCard value="68%" label="Win Rate" />
                </HStack>
              </VStack>
            </Panel>
          </Animated.View>

          {/* Game Mode Cards */}
          <VStack gap={3} style={styles.modesContainer}>
            {/* Online Play */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Pressable onPress={() => router.push('/(tabs)/play/online')}>
                <Panel variant="glass" padding={20} style={styles.modeCard}>
                  <HStack gap={4} style={{ alignItems: 'center' }}>
                    <View style={styles.modeBadge}>
                      <Icon name="globe" size={32} color={colors.accent.primary} />
                    </View>
                    <VStack gap={1} style={{ flex: 1 }}>
                      <Text style={[styles.modeTitle, { color: colors.foreground.primary }]}>
                        Online Play
                      </Text>
                      <Text style={[styles.modeDescription, { color: colors.foreground.secondary }]}>
                        Find opponents worldwide
                      </Text>
                      <Text style={[styles.modeProgress, { color: colors.accent.primary }]}>
                        1245 rating • 34 games
                      </Text>
                    </VStack>
                    <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
                  </HStack>
                </Panel>
              </Pressable>
            </Animated.View>

            {/* Play vs Bot */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <Pressable onPress={() => router.push('/(tabs)/play/bot')}>
                <Panel variant="glass" padding={20} style={styles.modeCard}>
                  <HStack gap={4} style={{ alignItems: 'center' }}>
                    <View style={styles.modeBadge}>
                      <Icon name="robot" size={32} color={colors.accent.primary} />
                    </View>
                    <VStack gap={1} style={{ flex: 1 }}>
                      <Text style={[styles.modeTitle, { color: colors.foreground.primary }]}>
                        Play vs Bot
                      </Text>
                      <Text style={[styles.modeDescription, { color: colors.foreground.secondary }]}>
                        Practice with AI opponents
                      </Text>
                      <Text style={[styles.modeProgress, { color: colors.accent.primary }]}>
                        Level 5 • 12 games
                      </Text>
                    </VStack>
                    <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
                  </HStack>
                </Panel>
              </Pressable>
            </Animated.View>

            {/* Friend Challenge */}
            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
              <Pressable onPress={() => router.push('/(tabs)/play/friend')}>
                <Panel variant="glass" padding={20} style={styles.modeCard}>
                  <HStack gap={4} style={{ alignItems: 'center' }}>
                    <View style={styles.modeBadge}>
                      <Icon name="users" size={32} color={colors.accent.primary} />
                    </View>
                    <VStack gap={1} style={{ flex: 1 }}>
                      <Text style={[styles.modeTitle, { color: colors.foreground.primary }]}>
                        Friend Challenge
                      </Text>
                      <Text style={[styles.modeDescription, { color: colors.foreground.secondary }]}>
                        Invite and play with friends
                      </Text>
                      <Text style={[styles.modeProgress, { color: colors.accent.primary }]}>
                        8 friends online
                      </Text>
                    </VStack>
                    <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
                  </HStack>
                </Panel>
              </Pressable>
            </Animated.View>
          </VStack>
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
  modesContainer: {
    marginTop: 8,
  },
  modeCard: {
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  modeBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeIcon: {
    fontSize: 28,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  modeDescription: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  modeProgress: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '600',
  },
});

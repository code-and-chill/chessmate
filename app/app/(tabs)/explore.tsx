import { useRouter } from 'expo-router';
import { StyleSheet, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, HStack, useThemeTokens, Text, spacingTokens, radiusTokens, shadowTokens, typographyTokens } from '@/ui';

export default function ExploreTab() {
  const router = useRouter();
  const { colors } = useThemeTokens();

  const features = [
    {
      icon: '🧩',
      title: 'Puzzles',
      description: 'Solve tactical puzzles to improve',
      progress: '147 solved • 1450 rating',
      route: '/puzzle',
      delay: 200,
    },
    {
      icon: '📚',
      title: 'Learning Center',
      description: 'Structured lessons for all levels',
      progress: '5 courses • 23% complete',
      route: '/learning',
      delay: 300,
    },
    {
      icon: '👥',
      title: 'Friends',
      description: 'Connect with players',
      progress: '12 friends • 5 online',
      route: '/social/friends',
      delay: 400,
    },
    {
      icon: '💬',
      title: 'Messages',
      description: 'Chat with chess friends',
      progress: '3 new messages',
      route: '/social/messages',
      delay: 500,
    },
    {
      icon: '🏛️',
      title: 'Chess Clubs',
      description: 'Join communities',
      progress: '2 clubs • 145 members',
      route: '/social/clubs',
      delay: 600,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.header}>
            <Text variant="display" weight="bold" color={colors.accent.primary}>Explore Chess</Text>
            <Text variant="bodyMedium" color={colors.foreground.secondary} style={styles.subtitle}>
              Discover features to improve your game
            </Text>
          </Animated.View>

          {/* Feature Cards */}
          <VStack gap={3} style={styles.featuresContainer}>
            {features.map((feature) => (
              <Animated.View key={feature.route} entering={FadeInDown.delay(feature.delay).duration(400)}>
                <Pressable onPress={() => router.push(feature.route as any)}>
                  <Panel variant="glass" padding={5} style={styles.featureCard}>
                    <HStack gap={4} style={{ alignItems: 'center' }}>
                      <View style={[styles.featureBadge, { backgroundColor: colors.translucent.light }]}> 
                        <Text style={styles.featureIcon}>{feature.icon}</Text>
                      </View>
                      <VStack gap={1} style={{ flex: 1 }}>
                        <Text variant="titleMedium" weight="bold" color={colors.foreground.primary}>
                          {feature.title}
                        </Text>
                        <Text variant="bodyMedium" color={colors.foreground.secondary}>
                          {feature.description}
                        </Text>
                        <Text variant="caption" weight="semibold" color={colors.accent.primary} style={styles.featureProgress}>
                          {feature.progress}
                        </Text>
                      </VStack>
                      <Text variant="title" weight="semibold" color={colors.accent.primary}>→</Text>
                    </HStack>
                  </Panel>
                </Pressable>
              </Animated.View>
            ))}
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
    paddingBottom: spacingTokens[7],
  },
  content: {
    paddingHorizontal: spacingTokens[6],
    paddingTop: spacingTokens[6],
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacingTokens[2],
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacingTokens[1],
  },
  featuresContainer: {
    marginTop: spacingTokens[2],
  },
  featureCard: {
    ...shadowTokens.card,
  },
  featureBadge: {
    width: 56,
    height: 56,
    borderRadius: radiusTokens.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: typographyTokens.fontSize['3xl'],
  },
  featureProgress: {
    marginTop: spacingTokens[1],
  },
});



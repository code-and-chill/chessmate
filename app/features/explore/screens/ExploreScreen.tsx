import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Pressable, Text, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Panel } from '@/ui/primitives/Panel';
import { VStack, HStack, useThemeTokens } from '@/ui';

export default function ExploreScreen() {
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
            <Text style={[styles.title, { color: colors.accent.primary }]}>Explore Chess</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}> 
              Discover features to improve your game
            </Text>
          </Animated.View>

          {/* Feature Cards */}
          <VStack gap={3} style={styles.featuresContainer}>
            {features.map((feature) => (
              <Animated.View key={feature.route} entering={FadeInDown.delay(feature.delay).duration(400)}>
                <Pressable onPress={() => router.push(feature.route as any)}>
                  <Panel variant="glass" padding={20} style={styles.featureCard}>
                    <HStack gap={4} style={{ alignItems: 'center' }}>
                      <View style={[styles.featureBadge, { backgroundColor: colors.translucent.light }]}> 
                        <Text style={styles.featureIcon}>{feature.icon}</Text>
                      </View>
                      <VStack gap={1} style={{ flex: 1 }}>
                        <Text style={[styles.featureTitle, { color: colors.foreground.primary }]}> 
                          {feature.title}
                        </Text>
                        <Text style={[styles.featureDescription, { color: colors.foreground.secondary }]}> 
                          {feature.description}
                        </Text>
                        <Text style={[styles.featureProgress, { color: colors.accent.primary }]}> 
                          {feature.progress}
                        </Text>
                      </VStack>
                      <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
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
  featuresContainer: {
    marginTop: 8,
  },
  featureCard: {
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featureBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  featureDescription: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  featureProgress: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  arrow: {
    fontSize: 24,
    fontWeight: '600',
  },
});

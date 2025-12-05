/**
 * FeatureScreenLayout Component
 * 
 * A standardized container for feature screens with consistent layout, animations, and styling.
 * Part of the Design Language System (DLS) Screen Layout Pattern.
 * 
 * @see /app/DLS.md - Tab Screen Pattern documentation
 * 
 * @example
 * ```tsx
 * <FeatureScreenLayout
 *   title="Play Chess"
 *   subtitle="Choose your game mode to get started"
 *   statsRow={
 *     <HStack gap={3}>
 *       <StatCard value="🔥 7" label="Streak" />
 *     </HStack>
 *   }
 * >
 *   <FeatureCard
 *     icon="🌐"
 *     title="Online Play"
 *     description="Find opponents worldwide"
 *     onPress={() => setMode('online')}
 *     delay={200}
 *   />
 * </FeatureScreenLayout>
 * ```
 */

import type { ReactNode } from 'react';
import { StyleSheet, View, Text, SafeAreaView, Platform, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { VStack } from '@/ui/primitives/Stack';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { typographyTokens } from '@/ui/tokens/typography';

const { width } = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && width >= 1024;

interface FeatureScreenLayoutProps {
  /** Large title displayed at the top (e.g., "Play Chess") */
  title: string;
  
  /** Subtitle text below the title (e.g., "Choose your game mode") */
  subtitle: string;
  
  /** Optional stats row (rendered between header and cards) */
  statsRow?: ReactNode;
  
  /** Card components to display (use FeatureCard for consistency) */
  children: ReactNode;
  
  /** Custom max width for content (default: 600) */
  maxWidth?: number;
}

export function FeatureScreenLayout({
  title,
  subtitle,
  statsRow,
  children,
  maxWidth = 600,
}: FeatureScreenLayoutProps) {
  const colors = useColors();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={[styles.gradientBg, { backgroundColor: colors.background.primary }]} />
      
      <VStack 
        gap={8} 
        // @ts-expect-error - React Native style array type mismatch
        style={[
          styles.content,
          { maxWidth },
          isDesktop ? styles.contentDesktop : undefined,
        ]}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          <VStack gap={3} style={styles.headerSection}>
            <Text style={[styles.title, { color: colors.accent.primary }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{subtitle}</Text>
          </VStack>
        </Animated.View>

        {/* Optional Stats Row */}
        {statsRow && (
          <Animated.View entering={FadeInUp.duration(400).delay(150)}>
            {statsRow}
          </Animated.View>
        )}

        {/* Cards Container */}
        <VStack gap={4} style={styles.cardsContainer}>
          {children}
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  contentDesktop: {
    paddingHorizontal: 48,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: typographyTokens.fontSize['4xl'],
    fontWeight: typographyTokens.fontWeight.extrabold,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typographyTokens.fontSize.lg,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: typographyTokens.fontWeight.medium,
  },
  cardsContainer: {
    width: '100%',
  },
});

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

import React from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View, Text, Platform, useWindowDimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { VStack } from '@/ui/primitives/Stack';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { typographyTokens } from '@/ui/tokens/typography';
import { spacingScale } from '@/ui/tokens/spacing';
import { GlobalContainer } from '@/ui/primitives/GlobalContainer';

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
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const isCompact = (Platform.OS !== 'web' && isLandscape) || width <= 480;
  const containerPadding = isCompact ? spacingScale.gutter : spacingScale.md;

  const contentStyle = {
    maxWidth,
    padding: containerPadding,
    ...(isDesktop ? styles.contentDesktop : {}),
    alignSelf: 'center',
  } as const;

  const cardsStyle = { ...styles.cardsContainer, alignItems: 'stretch' } as const;

  const wrappedChildren = React.Children.map(children, (child) => (
    <View style={{ width: '100%', minWidth: 0 }}>{child as React.ReactNode}</View>
  ));

  const scrollContentContainerStyle = [
    styles.scrollContent,
    isDesktop ? { alignItems: 'center' } : { alignItems: 'stretch' },
  ];

  return (
    <GlobalContainer scrollable contentContainerStyle={scrollContentContainerStyle} style={styles.container}>
      <View style={{ ...styles.gradientBg, backgroundColor: colors.background.primary }} />

      <View style={contentStyle}>
        <VStack gap={8}>
          {/* Header Section */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <VStack gap={3} style={styles.headerSection}>
              <Text style={[styles.title, { color: colors.foreground.primary }]}>{title}</Text>
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
          <VStack gap={4} style={cardsStyle}>
            {wrappedChildren}
          </VStack>
        </VStack>
      </View>

      {/* Debug Badge - Dev Only */}
      {__DEV__ && (
        <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 9999, backgroundColor: '#00000066', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 }}>
          <Text style={{ color: '#fff', fontSize: 10 }}>{`w:${Math.round(width)} pad:${containerPadding} max:${maxWidth}`}</Text>
        </View>
      )}
    </GlobalContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    width: '100%',
    paddingBottom: spacingScale.sectionGap,
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
    fontSize: 32, // More refined, less heavy
    fontWeight: typographyTokens.fontWeight.bold, // Less heavy than extrabold
    textAlign: 'center',
    letterSpacing: -0.3, // Tighter spacing
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

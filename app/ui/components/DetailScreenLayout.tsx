/**
 * DetailScreenLayout Component
 * 
 * A standardized layout for detail/secondary screens with consistent styling.
 * Complements FeatureScreenLayout for the second-level screens in navigation hierarchy.
 * Part of the Design Language System (DLS).
 * 
 * @see /app/docs/design-language-system.md
 * 
 * @example
 * ```tsx
 * <DetailScreenLayout
 *   title="Interactive Lessons"
 *   subtitle="Complete lessons to unlock more content"
 *   onBack={() => router.back()}
 * >
 *   <Card variant="elevated">
 *     <Text>Lesson content...</Text>
 *   </Card>
 * </DetailScreenLayout>
 * ```
 */

import type { ReactNode } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { VStack } from '@/ui/primitives/Stack';
import { Icon } from '@/ui/icons';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { typographyTokens } from '@/ui/tokens/typography';
import { spacingTokens } from '@/ui/tokens/spacing';

const { width } = Dimensions.get('window');
const isDesktop = Platform.OS === 'web' && width >= 1024;

interface DetailScreenLayoutProps {
  /** Screen title */
  title: string;
  
  /** Optional subtitle */
  subtitle?: string;
  
  /** Back button handler (optional - uses default back if not provided) */
  onBack?: () => void;
  
  /** Screen content */
  children: ReactNode;
  
  /** Custom max width for content (default: 800) */
  maxWidth?: number;
  
  /** Enable scroll view (default: true) */
  scrollable?: boolean;
}

export function DetailScreenLayout({
  title,
  subtitle,
  onBack,
  children,
  maxWidth = 800,
  scrollable = true,
}: DetailScreenLayoutProps) {
  const colors = useColors();
  
  const header = (
    <Animated.View entering={FadeInUp.duration(400).delay(100)}>
      <VStack gap={3} style={styles.headerSection}>
        {onBack && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
            accessibilityLabel="Go back"
          >
            <Icon name="chevron-left" size={20} color={colors.accent.primary} />
            <Text style={[styles.backButtonText, { color: colors.accent.primary }]}>
              Back
            </Text>
          </TouchableOpacity>
        )}
        
        <Text style={[styles.title, { color: colors.foreground.primary }]}>
          {title}
        </Text>
        
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
            {subtitle}
          </Text>
        )}
      </VStack>
    </Animated.View>
  );

  const contentContainer = (
    <Animated.View entering={FadeInDown.duration(400).delay(200)}>
      <VStack gap={4} style={styles.contentContainer}>
        {children}
      </VStack>
    </Animated.View>
  );

  const content = (
    <VStack 
      gap={6} 
      style={[
        styles.content,
        { maxWidth },
        isDesktop ? styles.contentDesktop : undefined,
      ]}
    >
      {header}
      {contentContainer}
    </VStack>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {scrollable ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacingTokens[8],
  },
  content: {
    flex: 1,
    padding: spacingTokens[5],
    alignSelf: 'center',
    width: '100%',
  },
  contentDesktop: {
    paddingHorizontal: spacingTokens[10],
  },
  headerSection: {
    marginBottom: spacingTokens[4],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: spacingTokens[2],
    paddingHorizontal: spacingTokens[3],
    marginBottom: spacingTokens[3],
    gap: spacingTokens[1],
  },
  backButtonText: {
    fontFamily: typographyTokens.fontFamily.primarySemiBold,
    fontSize: typographyTokens.fontSize.base,
    fontWeight: typographyTokens.fontWeight.semibold,
  },
  title: {
    fontFamily: typographyTokens.fontFamily.display,
    fontSize: typographyTokens.fontSize['3xl'],
    fontWeight: typographyTokens.fontWeight.extrabold,
    letterSpacing: -0.5,
    marginBottom: spacingTokens[2],
  },
  subtitle: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontSize: typographyTokens.fontSize.base,
    lineHeight: 24,
    fontWeight: typographyTokens.fontWeight.medium,
  },
  contentContainer: {
    width: '100%',
  },
});

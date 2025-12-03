/**
 * FeatureCard Component
 * 
 * A standardized card for feature screens with consistent animation and interaction.
 * Part of the Design Language System (DLS) Screen Layout Pattern.
 * 
 * @see /app/DLS.md - Tab Screen Pattern documentation
 * 
 * @example
 * ```tsx
 * <FeatureCard
 *   icon="globe"
 *   title="Online Play"
 *   description="Find opponents worldwide"
 *   progress="1245 rating • 34 games"
 *   onPress={() => setMode('online')}
 *   delay={200}
 * />
 * ```
 */

import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { InteractivePressable } from '@/ui/primitives/InteractivePressable';
import { Icon, type IconName } from '@/ui/icons';
import { VStack } from '@/ui/primitives/Stack';
import { useColors } from '@/ui/hooks/useThemeTokens';
import { typographyTokens } from '@/ui/tokens/typography';
import { spacingTokens } from '@/ui/tokens/spacing';

interface FeatureCardProps {
  /** Icon name from icon library (e.g., "globe", "robot", "book") */
  icon: IconName;
  
  /** Card title (e.g., "Online Play") */
  title: string;
  
  /** Description text (e.g., "Find opponents worldwide") */
  description: string;
  
  /** Optional progress/info text (e.g., "1245 rating • 34 games") */
  progress?: string;
  
  /** Press handler */
  onPress: () => void;
  
  /** Animation delay in milliseconds (stagger by 100ms: 200, 300, 400...) */
  delay?: number;
  
  /** Custom card variant (default: "elevated") */
  variant?: 'elevated' | 'gradient';
}

export function FeatureCard({
  icon,
  title,
  description,
  progress,
  onPress,
  delay = 200,
  variant = 'elevated',
}: FeatureCardProps) {
  const colors = useColors();
  
  return (
    <Animated.View entering={FadeInDown.duration(500).delay(delay)}>
      <Card
        variant={variant}
        size="lg"
        hoverable
        pressable
        style={styles.card}
      >
        <InteractivePressable
          onPress={onPress}
          scaleOnPress={true}
          pressScale={0.98}
          hapticFeedback={true}
          hapticStyle="light"
          style={styles.cardInner}
        >
          <View style={[styles.iconBadge, { backgroundColor: colors.accent.primary + '15' }]}>
            <Icon name={icon} size={32} color={colors.accent.primary} />
          </View>
          <VStack gap={1} style={styles.contentContainer}>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.foreground.secondary }]}>{description}</Text>
            {progress && <Text style={[styles.progress, { color: colors.accent.primary }]}>{progress}</Text>}
          </VStack>
          <Text style={[styles.arrow, { color: colors.accent.primary }]}>→</Text>
        </InteractivePressable>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingTokens[4],
    padding: spacingTokens[1],
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: typographyTokens.fontFamily.displayMedium,
    fontSize: typographyTokens.fontSize.xl,
    fontWeight: typographyTokens.fontWeight.bold,
    marginBottom: spacingTokens[1],
    letterSpacing: -0.4,
  },
  description: {
    fontFamily: typographyTokens.fontFamily.primary,
    fontSize: typographyTokens.fontSize.base,
    lineHeight: 20,
  },
  progress: {
    fontFamily: typographyTokens.fontFamily.primaryMedium,
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.semibold,
    marginTop: spacingTokens[1],
  },
  arrow: {
    fontSize: 24,
    fontWeight: '600',
  },
});

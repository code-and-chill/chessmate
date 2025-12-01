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
 *   icon="🌐"
 *   title="Online Play"
 *   description="Find opponents worldwide"
 *   progress="1245 rating • 34 games"
 *   onPress={() => setMode('online')}
 *   delay={200}
 * />
 * ```
 */

import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, useColors } from '@/ui';

interface FeatureCardProps {
  /** Emoji icon (e.g., "🌐", "🤖", "📚") */
  icon: string;
  
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
        <TouchableOpacity
          style={styles.cardInner}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <Text style={styles.icon}>{icon}</Text>
          <VStack gap={1} style={styles.contentContainer}>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.foreground.secondary }]}>{description}</Text>
            {progress && <Text style={[styles.progress, { color: colors.accent.primary }]}>{progress}</Text>}
          </VStack>
        </TouchableOpacity>
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
    gap: 20,
    padding: 4,
  },
  icon: {
    fontSize: 48,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    // color set dynamically from theme
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    // color set dynamically from theme
    lineHeight: 20,
  },
  progress: {
    fontSize: 13,
    // color set dynamically from theme
    fontWeight: '600',
    marginTop: 4,
  },
});

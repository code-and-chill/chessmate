import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Card, VStack, HStack, Text, Box, InteractivePressable, Icon } from '@/ui';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { shadowTokens } from '@/ui/tokens/shadows';

export interface SelectionCardProps {
  /** Main label text */
  label: string;
  /** Secondary text (e.g., "Rating: 1200" or "RAPID") */
  subtitle?: string;
  /** Icon name from Icon component, or emoji string */
  icon: string | React.ReactNode;
  /** Color for the icon background and accents */
  accentColor: string;
  /** Whether this card is currently selected */
  isSelected: boolean;
  /** Called when the card is pressed */
  onSelect: () => void;
  /** Animation delay index for staggered entrance */
  index?: number;
  /** Accessibility label override */
  accessibilityLabel?: string;
}

/**
 * A consistent selection card for option grids (bot difficulty, time controls, etc.)
 * Features:
 * - Fixed height for consistent grid alignment
 * - Animated selection state with border highlight
 * - Theme-aware styling
 */
export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  subtitle,
  icon,
  accentColor,
  isSelected,
  onSelect,
  index = 0,
  accessibilityLabel,
}) => {
  const { colors } = useThemeTokens();
  
  const scale = useSharedValue(isSelected ? 1.02 : 1);

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.02 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: 2,
    borderColor: isSelected ? colors.accent.primary : 'transparent',
    borderRadius: radiusTokens.lg,
    overflow: 'hidden' as const,
  }));

  const renderIcon = () => {
    if (typeof icon === 'string') {
      // Check if it's an emoji (starts with a non-letter char or contains emoji)
      const isEmoji = /^\p{Emoji}/u.test(icon) || icon.length <= 2;
      
      if (isEmoji) {
        return <Text style={styles.emojiIcon}>{icon}</Text>;
      }
      
      // It's an icon name
      return <Icon name={icon as any} size={22} color={accentColor} />;
    }
    
    // It's a ReactNode
    return icon;
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(200 + index * 60).duration(400)}
      style={styles.cardWrapper}
    >
      <InteractivePressable
        onPress={onSelect}
        accessibilityLabel={accessibilityLabel || `Select ${label}`}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        hapticStyle="light"
        style={styles.cardPressable}
      >
        <Animated.View style={[animatedStyle, styles.cardAnimatedWrapper]}>
          <Card 
            variant="elevated" 
            size="md" 
            style={[
              styles.card,
              isSelected && { backgroundColor: colors.background.tertiary },
            ]}
          >
            <HStack gap={spacingTokens[3]} alignItems="center" style={styles.cardContent}>
              {/* Icon */}
              <Box
                width={48}
                height={48}
                radius="full"
                alignItems="center"
                justifyContent="center"
                backgroundColor={accentColor + '20'}
                style={styles.iconContainer}
              >
                {renderIcon()}
              </Box>

              {/* Title and Subtitle */}
              <VStack gap={spacingTokens[1]} style={styles.textContainer} justifyContent="center">
                <Text 
                  variant="body" 
                  weight="bold" 
                  style={[styles.label, { color: colors.foreground.primary }]}
                >
                  {label}
                </Text>
                {subtitle && (
                  <HStack gap={spacingTokens[1]} alignItems="center">
                    <Icon name="star" size={12} color={accentColor} />
                    <Text 
                      variant="caption" 
                      weight="medium"
                      style={[styles.subtitle, { color: colors.foreground.secondary }]}
                    >
                      {subtitle}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </Card>
        </Animated.View>
      </InteractivePressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    height: 88,
  },
  cardPressable: {
    width: '100%',
    height: '100%',
  },
  cardAnimatedWrapper: {
    width: '100%',
    height: '100%',
  },
  card: {
    marginBottom: 0,
    height: '100%',
    width: '100%',
  },
  cardContent: {
    padding: spacingTokens[3],
    height: '100%',
    justifyContent: 'center',
  },
  iconContainer: {
    ...shadowTokens.sm,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 16,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  emojiIcon: {
    fontSize: 22,
    textAlign: 'center',
  },
});

export default SelectionCard;

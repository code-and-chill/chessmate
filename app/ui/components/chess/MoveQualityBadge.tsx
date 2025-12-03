/**
 * MOVE QUALITY BADGE COMPONENT
 * 
 * Visual indicator for chess move quality classification.
 * Displays badges with appropriate colors and symbols for:
 * - Brilliant (‼) - Exceptional move with creative/tactical merit
 * - Best (✓) - Objectively strongest move
 * - Great (✓) - Excellent move
 * - Good (✓) - Solid move
 * - Book (📖) - Opening book move
 * - Inaccuracy (?!) - Suboptimal move
 * - Mistake (?) - Significant error
 * - Blunder (??) - Critical error
 * - Miss (?!) - Missed winning opportunity
 * 
 * Features:
 * - Animated entrance with scale/fade
 * - Theme-aware colors
 * - Multiple size variants
 * - Optional label text
 * - Hover/press animations (web)
 * 
 * @packageDocumentation
 */

import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Text } from '@/ui/primitives/Text';
import { Box } from '@/ui/primitives/Box';
import {
  getMoveQualityColor,
  moveQualitySymbols,
  moveQualityLabels,
} from '@/ui/tokens/feedback';
import { useIsDark } from '@/ui/hooks/useThemeTokens';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { animationPresets } from '@/ui/animations/presets';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Move quality classification types
 */
export type MoveQuality =
  | 'brilliant'
  | 'best'
  | 'great'
  | 'good'
  | 'book'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'miss';

/**
 * Badge size variants
 */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Badge style variants
 */
export type BadgeVariant = 'solid' | 'outlined' | 'subtle';

/**
 * MoveQualityBadge component props
 */
export type MoveQualityBadgeProps = {
  /**
   * Move quality classification
   */
  quality: MoveQuality;

  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize;

  /**
   * Badge style variant
   * @default 'solid'
   */
  variant?: BadgeVariant;

  /**
   * Show label text alongside symbol
   * @default false
   */
  showLabel?: boolean;

  /**
   * Animate entrance on mount
   * @default true
   */
  animated?: boolean;

  /**
   * Animation entrance delay (ms)
   * @default 0
   */
  delay?: number;

  /**
   * Press handler (optional)
   */
  onPress?: () => void;

  /**
   * Custom style override
   */
  style?: ViewStyle;
};

/**
 * Size configurations
 */
const sizeConfig: Record<BadgeSize, { height: number; fontSize: number; padding: number }> = {
  xs: { height: 20, fontSize: 11, padding: spacingTokens[1] },
  sm: { height: 24, fontSize: 12, padding: spacingTokens[2] },
  md: { height: 28, fontSize: 14, padding: spacingTokens[2] },
  lg: { height: 32, fontSize: 16, padding: spacingTokens[3] },
};

/**
 * MoveQualityBadge component
 * 
 * @example
 * ```tsx
 * <MoveQualityBadge quality="brilliant" />
 * <MoveQualityBadge quality="blunder" showLabel />
 * <MoveQualityBadge quality="best" size="lg" variant="outlined" />
 * ```
 */
export const MoveQualityBadge: React.FC<MoveQualityBadgeProps> = ({
  quality,
  size = 'md',
  variant = 'solid',
  showLabel = false,
  animated = true,
  delay = 0,
  onPress,
  style,
}) => {
  const isDark = useIsDark();
  const scale = useSharedValue(animated ? 0 : 1);
  const opacity = useSharedValue(animated ? 0 : 1);
  const pressScale = useSharedValue(1);

  // Entrance animation
  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        scale.value = withSpring(1, animationPresets.spring.bouncy);
        opacity.value = withTiming(1, animationPresets.timing.normal);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [animated, delay, scale, opacity]);

  // Get colors
  const primaryColor = getMoveQualityColor(quality, 'primary', isDark);
  const backgroundColor = getMoveQualityColor(quality, 'background', isDark);
  const borderColor = getMoveQualityColor(quality, 'border', isDark);

  // Get symbol and label
  const symbol = moveQualitySymbols[quality];
  const label = moveQualityLabels[quality];

  // Size configuration
  const config = sizeConfig[size];

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value * pressScale.value }],
      opacity: opacity.value,
    };
  });

  // Variant styles
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'solid':
        return {
          backgroundColor: primaryColor,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: primaryColor,
        };
      case 'subtle':
        return {
          backgroundColor,
          borderWidth: 1,
          borderColor,
        };
    }
  };

  // Text color based on variant
  const getTextColor = (): string => {
    if (variant === 'solid') {
      // White text on solid backgrounds
      return isDark ? '#FAFAFA' : '#FFFFFF';
    }
    return primaryColor;
  };

  // Press handlers
  const handlePressIn = () => {
    pressScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, animationPresets.spring.gentle);
  };

  const containerStyle: ViewStyle = {
    height: config.height,
    paddingHorizontal: config.padding * 1.5,
    borderRadius: radiusTokens.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingTokens[1],
    ...getVariantStyles(),
  };

  const textStyle: TextStyle = {
    fontSize: config.fontSize,
    fontWeight: '700',
    color: getTextColor(),
    letterSpacing: 0.2,
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[containerStyle, animatedStyle, style]}
      >
        <Text style={textStyle}>{symbol}</Text>
        {showLabel && <Text style={textStyle}>{label}</Text>}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={[containerStyle, animatedStyle, style]}>
      <Text style={textStyle}>{symbol}</Text>
      {showLabel && <Text style={textStyle}>{label}</Text>}
    </Animated.View>
  );
};

/**
 * Grouped badge list component for showing multiple move qualities
 */
export type MoveQualityListProps = {
  /**
   * Array of move quality classifications with counts
   */
  qualities: Array<{
    quality: MoveQuality;
    count: number;
  }>;

  /**
   * Badge size
   * @default 'sm'
   */
  size?: BadgeSize;

  /**
   * Badge variant
   * @default 'subtle'
   */
  variant?: BadgeVariant;

  /**
   * Show labels
   * @default true
   */
  showLabels?: boolean;

  /**
   * Layout direction
   * @default 'row'
   */
  direction?: 'row' | 'column';

  /**
   * Gap between badges
   * @default 2
   */
  gap?: number;

  /**
   * Animate badges on mount
   * @default true
   */
  animated?: boolean;

  /**
   * Stagger delay between badge animations
   * @default 50
   */
  staggerDelay?: number;
};

/**
 * MoveQualityList component
 * Displays a list of move quality badges with counts
 * 
 * @example
 * ```tsx
 * <MoveQualityList
 *   qualities={[
 *     { quality: 'brilliant', count: 2 },
 *     { quality: 'good', count: 5 },
 *     { quality: 'inaccuracy', count: 3 },
 *     { quality: 'blunder', count: 1 },
 *   ]}
 * />
 * ```
 */
export const MoveQualityList: React.FC<MoveQualityListProps> = ({
  qualities,
  size = 'sm',
  variant = 'subtle',
  showLabels = true,
  direction = 'row',
  gap = 2,
  animated = true,
  staggerDelay = 50,
}) => {
  return (
    <Box
      style={{
        flexDirection: direction,
        flexWrap: 'wrap',
        gap: spacingTokens[gap as keyof typeof spacingTokens],
      }}
    >
      {qualities.map((item, index) => (
        <Box
          key={item.quality}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacingTokens[1] }}
        >
          <MoveQualityBadge
            quality={item.quality}
            size={size}
            variant={variant}
            showLabel={showLabels}
            animated={animated}
            delay={animated ? index * staggerDelay : 0}
          />
          {item.count > 1 && (
            <Text
              style={{
                fontSize: size === 'xs' ? 11 : size === 'sm' ? 12 : 14,
                fontWeight: '600',
                color: '#6B7280',
              }}
            >
              × {item.count}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  );
};

/**
 * Hook to categorize moves by quality for analysis
 */
export const useMoveQualityCounts = (
  moves: Array<{ quality?: MoveQuality }>
): Array<{ quality: MoveQuality; count: number }> => {
  return React.useMemo(() => {
    const counts: Partial<Record<MoveQuality, number>> = {};

    moves.forEach((move) => {
      if (move.quality) {
        counts[move.quality] = (counts[move.quality] || 0) + 1;
      }
    });

    // Convert to array and sort by quality priority
    const qualityOrder: MoveQuality[] = [
      'brilliant',
      'best',
      'great',
      'good',
      'book',
      'inaccuracy',
      'mistake',
      'blunder',
      'miss',
    ];

    return qualityOrder
      .filter((quality) => counts[quality] && counts[quality]! > 0)
      .map((quality) => ({
        quality,
        count: counts[quality]!,
      }));
  }, [moves]);
};

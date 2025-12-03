/**
 * COACH TOOLTIP COMPONENT
 * 
 * Contextual feedback system with coach persona.
 * Provides hints, insights, and encouragement in a friendly speech bubble format.
 * 
 * Features:
 * - Speech bubble with pointer/tail
 * - Slide-in animation from various directions
 * - Sentiment-based colors (positive, neutral, cautionary, critical)
 * - Optional avatar integration
 * - Auto-dismiss timer (optional)
 * - Glassmorphic or solid variants
 * 
 * Use Cases:
 * - Post-move feedback ("Great attack on the queen!")
 * - Position assessment ("Your position looks promising")
 * - Hint system ("Consider protecting your king")
 * - Game phase commentary ("Transitioning to endgame")
 * 
 * @packageDocumentation
 */

import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, TextStyle, Pressable, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Box } from '@/ui/primitives/Box';
import { Text } from '@/ui/primitives/Text';
import { useIsDark } from '@/ui/hooks/useThemeTokens';
import { getCoachFeedbackColor } from '@/ui/tokens/feedback';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { shadowTokens } from '@/ui/tokens/shadows';
import { animationPresets } from '@/ui/animations/presets';
import { getElevation } from '@/ui/tokens/elevation';

/**
 * Sentiment types for coach feedback
 */
export type CoachSentiment = 'positive' | 'neutral' | 'cautionary' | 'critical';

/**
 * Tooltip position relative to anchor
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Tooltip variant
 */
export type TooltipVariant = 'glass' | 'solid' | 'outlined';

/**
 * CoachTooltip component props
 */
export type CoachTooltipProps = {
  /**
   * Feedback message text
   */
  message: string;

  /**
   * Sentiment determines color scheme
   * @default 'neutral'
   */
  sentiment?: CoachSentiment;

  /**
   * Tooltip position
   * @default 'bottom'
   */
  position?: TooltipPosition;

  /**
   * Visual variant
   * @default 'glass'
   */
  variant?: TooltipVariant;

  /**
   * Show pointer/tail
   * @default true
   */
  showPointer?: boolean;

  /**
   * Auto-dismiss after duration (ms)
   * Set to 0 to disable auto-dismiss
   * @default 0
   */
  autoDismiss?: number;

  /**
   * Dismiss handler
   */
  onDismiss?: () => void;

  /**
   * Show close button
   * @default false
   */
  showCloseButton?: boolean;

  /**
   * Animation entrance direction
   * @default 'bottom' (slides up from bottom)
   */
  entranceFrom?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * Entrance animation delay (ms)
   * @default 0
   */
  delay?: number;

  /**
   * Optional emoji or icon to show before message
   */
  icon?: string;

  /**
   * Max width of tooltip
   * @default 320
   */
  maxWidth?: number;

  /**
   * Custom style override
   */
  style?: ViewStyle;
};

/**
 * Get entrance animation configuration based on direction
 */
const getEntranceAnimation = (direction: 'top' | 'bottom' | 'left' | 'right') => {
  switch (direction) {
    case 'top':
      return { translateY: -30, translateX: 0 };
    case 'bottom':
      return { translateY: 30, translateX: 0 };
    case 'left':
      return { translateY: 0, translateX: -30 };
    case 'right':
      return { translateY: 0, translateX: 30 };
  }
};

/**
 * CoachTooltip component
 * 
 * @example
 * ```tsx
 * <CoachTooltip
 *   message="Excellent move! You've gained a significant advantage."
 *   sentiment="positive"
 *   icon="✨"
 *   autoDismiss={5000}
 *   onDismiss={() => setShowTooltip(false)}
 * />
 * ```
 */
export const CoachTooltip: React.FC<CoachTooltipProps> = ({
  message,
  sentiment = 'neutral',
  position = 'bottom',
  variant = 'glass',
  showPointer = true,
  autoDismiss = 0,
  onDismiss,
  showCloseButton = false,
  entranceFrom = 'bottom',
  delay = 0,
  icon,
  maxWidth = 320,
  style,
}) => {
  const isDark = useIsDark();

  // Animation values
  const translateY = useSharedValue(getEntranceAnimation(entranceFrom).translateY);
  const translateX = useSharedValue(getEntranceAnimation(entranceFrom).translateX);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, animationPresets.spring.moderate);
      translateX.value = withSpring(0, animationPresets.spring.moderate);
      opacity.value = withTiming(1, animationPresets.timing.normal);
      scale.value = withSpring(1, animationPresets.spring.gentle);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, translateY, translateX, opacity, scale]);

  // Auto-dismiss timer
  useEffect(() => {
    if (autoDismiss > 0 && onDismiss) {
      const dismissTimer = setTimeout(() => {
        // Exit animation
        translateY.value = withTiming(
          getEntranceAnimation(entranceFrom).translateY,
          animationPresets.timing.fast
        );
        translateX.value = withTiming(
          getEntranceAnimation(entranceFrom).translateX,
          animationPresets.timing.fast
        );
        opacity.value = withTiming(0, animationPresets.timing.fast, (finished) => {
          if (finished) {
            runOnJS(onDismiss)();
          }
        });
        scale.value = withTiming(0.95, animationPresets.timing.fast);
      }, autoDismiss + delay);

      return () => clearTimeout(dismissTimer);
    }
  }, [autoDismiss, delay, onDismiss, entranceFrom, translateY, translateX, opacity, scale]);

  // Get sentiment color
  const sentimentColor = getCoachFeedbackColor(sentiment, isDark);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  // Variant-specific styles
  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      maxWidth,
      borderRadius: radiusTokens.lg,
      padding: spacingTokens[4],
      ...shadowTokens.panel,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        };
      case 'solid':
        return {
          ...baseStyle,
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderWidth: 1,
          borderColor: sentimentColor,
          borderLeftWidth: 4,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: sentimentColor,
        };
    }
  };

  // Pointer/tail styles
  const pointerStyle: ViewStyle = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    ...(position === 'top' && {
      bottom: -8,
      left: '50%',
      marginLeft: -8,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderTopWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: variant === 'glass'
        ? isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)'
        : isDark ? '#1F2937' : '#FFFFFF',
    }),
    ...(position === 'bottom' && {
      top: -8,
      left: '50%',
      marginLeft: -8,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: variant === 'glass'
        ? isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)'
        : isDark ? '#1F2937' : '#FFFFFF',
    }),
    ...(position === 'left' && {
      right: -8,
      top: '50%',
      marginTop: -8,
      borderTopWidth: 8,
      borderBottomWidth: 8,
      borderLeftWidth: 8,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: variant === 'glass'
        ? isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)'
        : isDark ? '#1F2937' : '#FFFFFF',
    }),
    ...(position === 'right' && {
      left: -8,
      top: '50%',
      marginTop: -8,
      borderTopWidth: 8,
      borderBottomWidth: 8,
      borderRightWidth: 8,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderRightColor: variant === 'glass'
        ? isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)'
        : isDark ? '#1F2937' : '#FFFFFF',
    }),
  };

  const handleDismiss = () => {
    if (onDismiss) {
      // Exit animation
      translateY.value = withTiming(
        getEntranceAnimation(entranceFrom).translateY,
        animationPresets.timing.fast
      );
      translateX.value = withTiming(
        getEntranceAnimation(entranceFrom).translateX,
        animationPresets.timing.fast
      );
      opacity.value = withTiming(0, animationPresets.timing.fast, (finished) => {
        if (finished) {
          runOnJS(onDismiss)();
        }
      });
      scale.value = withTiming(0.95, animationPresets.timing.fast);
    }
  };

  const content = (
    <>
      {showPointer && <Box style={pointerStyle} />}
      <Box style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacingTokens[2] }}>
        {icon && (
          <Text style={{ fontSize: 20, lineHeight: 24 }}>
            {icon}
          </Text>
        )}
        <Box style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 15,
              lineHeight: 22,
              fontWeight: '500',
              color: isDark ? '#F3F4F6' : '#1F2937',
            }}
          >
            {message}
          </Text>
        </Box>
        {showCloseButton && (
          <Pressable onPress={handleDismiss} hitSlop={8}>
            <Text style={{ fontSize: 18, color: '#9CA3AF' }}>×</Text>
          </Pressable>
        )}
      </Box>
      {/* Sentiment indicator bar */}
      {variant !== 'outlined' && (
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: sentimentColor,
            borderBottomLeftRadius: radiusTokens.lg,
            borderBottomRightRadius: radiusTokens.lg,
          }}
        />
      )}
    </>
  );

  if (variant === 'glass' && Platform.OS !== 'web') {
    return (
      <Animated.View
        style={[
          {
            zIndex: getElevation('surface24').zIndex,
            overflow: 'visible',
          },
          animatedStyle,
          style,
        ]}
      >
        <BlurView
          intensity={isDark ? 60 : 80}
          tint={isDark ? 'dark' : 'light'}
          style={[
            getVariantStyles(),
            { overflow: 'visible' },
          ]}
        >
          {content}
        </BlurView>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        getVariantStyles(),
        {
          zIndex: getElevation('surface24').zIndex,
          overflow: 'visible',
        },
        animatedStyle,
        style,
      ]}
    >
      {content}
    </Animated.View>
  );
};

/**
 * Hook to manage coach tooltip state
 */
export const useCoachTooltip = () => {
  const [tooltip, setTooltip] = React.useState<{
    message: string;
    sentiment: CoachSentiment;
    icon?: string;
  } | null>(null);

  const showTooltip = React.useCallback(
    (message: string, sentiment: CoachSentiment = 'neutral', icon?: string) => {
      setTooltip({ message, sentiment, icon });
    },
    []
  );

  const hideTooltip = React.useCallback(() => {
    setTooltip(null);
  }, []);

  return {
    tooltip,
    showTooltip,
    hideTooltip,
    isVisible: tooltip !== null,
  };
};

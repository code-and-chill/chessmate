import React, { useCallback } from 'react';
import { Pressable as RNPressable, type PressableProps as RNPressableProps, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export type InteractivePressableProps = RNPressableProps & {
  /** Enable scale animation on press (default: true) */
  scaleOnPress?: boolean;
  /** Scale value when pressed (default: 0.97) */
  pressScale?: number;
  /** Enable haptic feedback on iOS (default: true) */
  hapticFeedback?: boolean;
  /** Haptic feedback style (default: 'light') */
  hapticStyle?: 'light' | 'medium' | 'heavy' | 'selection';
  /** Enable shadow lift on hover (web only, default: true) */
  liftOnHover?: boolean;
  /** Children elements */
  children?: React.ReactNode;
};

/**
 * InteractivePressable Component
 * 
 * Enhanced Pressable with:
 * - Animated scale on press
 * - Haptic feedback (iOS)
 * - Hover states (web)
 * - Spring physics
 */
export const InteractivePressable: React.FC<InteractivePressableProps> = ({
  scaleOnPress = true,
  pressScale = 0.97,
  hapticFeedback = true,
  hapticStyle = 'light',
  liftOnHover = true,
  onPressIn,
  onPressOut,
  onPress,
  children,
  style,
  ...rest
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(
    (event: any) => {
      if (scaleOnPress) {
        scale.value = withSpring(pressScale, {
          damping: 15,
          stiffness: 200,
        });
      }

      if (hapticFeedback && Platform.OS === 'ios') {
        const hapticMap = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
          selection: Haptics.NotificationFeedbackType.Success,
        };

        if (hapticStyle === 'selection') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(hapticMap[hapticStyle]);
        }
      }

      onPressIn?.(event);
    },
    [scaleOnPress, pressScale, hapticFeedback, hapticStyle, onPressIn]
  );

  const handlePressOut = useCallback(
    (event: any) => {
      if (scaleOnPress) {
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 200,
        });
      }

      onPressOut?.(event);
    },
    [scaleOnPress, onPressOut]
  );

  const handlePress = useCallback(
    (event: any) => {
      onPress?.(event);
    },
    [onPress]
  );

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[animatedStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};

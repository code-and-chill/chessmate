/**
 * Animation Utilities – Reusable animation presets for common patterns
 * 
 * Usage:
 *   const scaleAnimValue = useRef(new Animated.Value(0)).current;
 *   useEffect(() => {
 *     animations.fadeIn(scaleAnimValue, { duration: 300 }).start();
 *   }, []);
 */

import { Animated } from 'react-native';
import { motionTokens } from '../tokens/motion';

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: 'linear' | 'in' | 'out' | 'inOut';
}

/**
 * Fade-in animation
 */
export const fadeIn = (
  animValue: Animated.Value,
  options: AnimationOptions = {}
) => {
  animValue.setValue(0);
  return Animated.timing(animValue, {
    toValue: 1,
    duration: options.duration ?? motionTokens.duration.normal,
    delay: options.delay ?? 0,
    useNativeDriver: true,
  });
};

/**
 * Fade-out animation
 */
export const fadeOut = (
  animValue: Animated.Value,
  options: AnimationOptions = {}
) => {
  return Animated.timing(animValue, {
    toValue: 0,
    duration: options.duration ?? motionTokens.duration.normal,
    delay: options.delay ?? 0,
    useNativeDriver: true,
  });
};

/**
 * Scale-up animation (grow)
 */
export const scaleUp = (
  animValue: Animated.Value,
  options: AnimationOptions & { from?: number; to?: number } = {}
) => {
  animValue.setValue(options.from ?? 0.8);
  return Animated.timing(animValue, {
    toValue: options.to ?? 1,
    duration: options.duration ?? motionTokens.duration.normal,
    delay: options.delay ?? 0,
    useNativeDriver: true,
  });
};

/**
 * Scale-down animation (shrink)
 */
export const scaleDown = (
  animValue: Animated.Value,
  options: AnimationOptions & { from?: number; to?: number } = {}
) => {
  animValue.setValue(options.from ?? 1);
  return Animated.timing(animValue, {
    toValue: options.to ?? 0.8,
    duration: options.duration ?? motionTokens.duration.normal,
    delay: options.delay ?? 0,
    useNativeDriver: true,
  });
};

/**
 * Pulse animation (scale in and out repeatedly)
 */
export const pulse = (animValue: Animated.Value, options: AnimationOptions = {}) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 1.05,
        duration: (options.duration ?? motionTokens.duration.slow) / 2,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: (options.duration ?? motionTokens.duration.slow) / 2,
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Shake animation (horizontal)
 */
export const shake = (
  animValue: Animated.Value,
  options: AnimationOptions & { intensity?: number } = {}
) => {
  const intensity = options.intensity ?? 10;
  return Animated.sequence([
    Animated.timing(animValue, { toValue: intensity, duration: 50, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: -intensity, duration: 100, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: intensity, duration: 100, useNativeDriver: true }),
    Animated.timing(animValue, { toValue: 0, duration: 50, useNativeDriver: true }),
  ]);
};

/**
 * Bounce animation (vertical scale)
 */
export const bounce = (animValue: Animated.Value, options: AnimationOptions = {}) => {
  return Animated.sequence([
    Animated.timing(animValue, {
      toValue: 1.1,
      duration: (options.duration ?? motionTokens.duration.normal) / 2,
      useNativeDriver: true,
    }),
    Animated.timing(animValue, {
      toValue: 1,
      duration: (options.duration ?? motionTokens.duration.normal) / 2,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Slide-in animation (horizontal)
 */
export const slideInHorizontal = (
  animValue: Animated.Value,
  options: AnimationOptions & { distance?: number; direction?: 'left' | 'right' } = {}
) => {
  const distance = options.distance ?? 100;
  const startValue = options.direction === 'right' ? -distance : distance;
  animValue.setValue(startValue);

  return Animated.timing(animValue, {
    toValue: 0,
    duration: options.duration ?? motionTokens.duration.normal,
    delay: options.delay ?? 0,
    useNativeDriver: true,
  });
};

/**
 * Slide-in animation (vertical)
 */
export const slideInVertical = (
  animValue: Animated.Value,
  options: AnimationOptions & { distance?: number; direction?: 'up' | 'down' } = {}
) => {
  const distance = options.distance ?? 100;
  const startValue = options.direction === 'down' ? -distance : distance;
  animValue.setValue(startValue);

  return Animated.timing(animValue, {
    toValue: 0,
    duration: options.duration ?? motionTokens.duration.normal,
    delay: options.delay ?? 0,
    useNativeDriver: true,
  });
};

/**
 * Rotate animation
 */
export const rotate = (
  animValue: Animated.Value,
  options: AnimationOptions & { from?: number; to?: number } = {}
) => {
  animValue.setValue(options.from ?? 0);
  return Animated.timing(animValue, {
    toValue: options.to ?? 360,
    duration: options.duration ?? motionTokens.duration.slow,
    delay: options.delay ?? 0,
    useNativeDriver: true,
  });
};

/**
 * Spin animation (rotate loop)
 */
export const spin = (animValue: Animated.Value, options: AnimationOptions = {}) => {
  return Animated.loop(
    Animated.timing(animValue, {
      toValue: 360,
      duration: options.duration ?? motionTokens.duration.slower,
      useNativeDriver: true,
    })
  );
};

/**
 * Combined fade and scale animation
 */
export const fadeInScale = (
  animValue: Animated.Value,
  options: AnimationOptions & { scale?: number } = {}
) => {
  return Animated.parallel([
    fadeIn(animValue, options),
    scaleUp(animValue, { ...options, to: options.scale ?? 1 }),
  ]);
};

/**
 * Combined fade and slide animation
 */
export const fadeInSlide = (
  animValue: Animated.Value,
  options: AnimationOptions & { distance?: number; direction?: 'left' | 'right' | 'up' | 'down' } = {}
) => {
  const isVertical = options.direction === 'up' || options.direction === 'down';
  return Animated.parallel([
    fadeIn(animValue, options),
    isVertical
      ? slideInVertical(animValue, options as any)
      : slideInHorizontal(animValue, options as any),
  ]);
};

export const animations = {
  fadeIn,
  fadeOut,
  scaleUp,
  scaleDown,
  pulse,
  shake,
  bounce,
  slideInHorizontal,
  slideInVertical,
  rotate,
  spin,
  fadeInScale,
  fadeInSlide,
};

export default animations;

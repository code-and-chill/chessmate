/**
 * ANIMATION PRESETS LIBRARY
 * 
 * Standardized animation configurations for consistent micro-interactions.
 * Built on react-native-reanimated v4 with declarative presets.
 * 
 * Animation Categories:
 * - Entrance: fadeIn, slideUp, slideDown, scaleEnter, bounceIn
 * - Exit: fadeOut, slideOut, scaleExit, bounceOut
 * - Attention: pulse, shake, bounce, glow
 * - Celebration: confetti, trophy, fireworks
 * - Feedback: success, error, warning, info
 * 
 * Usage:
 * ```tsx
 * import { animationPresets } from '@/ui/animations/presets';
 * import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
 * 
 * const animatedStyle = useAnimatedStyle(() => ({
 *   opacity: withTiming(1, animationPresets.fadeIn.config),
 * }));
 * ```
 * 
 * @packageDocumentation
 */

import type { WithTimingConfig, WithSpringConfig } from 'react-native-reanimated';
import { Easing } from 'react-native-reanimated';

/**
 * Timing configuration presets
 */
export const timingConfigs = {
  instant: {
    duration: 100,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  fast: {
    duration: 150,
    easing: Easing.out(Easing.ease),
  } as WithTimingConfig,

  normal: {
    duration: 200,
    easing: Easing.inOut(Easing.ease),
  } as WithTimingConfig,

  moderate: {
    duration: 250,
    easing: Easing.inOut(Easing.ease),
  } as WithTimingConfig,

  slow: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  } as WithTimingConfig,

  slower: {
    duration: 400,
    easing: Easing.inOut(Easing.ease),
  } as WithTimingConfig,

  slowest: {
    duration: 500,
    easing: Easing.inOut(Easing.ease),
  } as WithTimingConfig,
};

/**
 * Spring configuration presets
 */
export const springConfigs = {
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  } as WithSpringConfig,

  moderate: {
    damping: 15,
    stiffness: 200,
    mass: 1,
  } as WithSpringConfig,

  snappy: {
    damping: 10,
    stiffness: 250,
    mass: 0.8,
  } as WithSpringConfig,

  bouncy: {
    damping: 8,
    stiffness: 180,
    mass: 1.2,
  } as WithSpringConfig,

  elastic: {
    damping: 6,
    stiffness: 150,
    mass: 1.5,
  } as WithSpringConfig,
};

/**
 * Entrance animation presets
 */
export const entranceAnimations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: timingConfigs.normal,
  },

  fadeInUp: {
    from: { opacity: 0, translateY: 20 },
    to: { opacity: 1, translateY: 0 },
    config: timingConfigs.moderate,
  },

  fadeInDown: {
    from: { opacity: 0, translateY: -20 },
    to: { opacity: 1, translateY: 0 },
    config: timingConfigs.moderate,
  },

  slideUp: {
    from: { translateY: 50, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    config: timingConfigs.moderate,
  },

  slideDown: {
    from: { translateY: -50, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
    config: timingConfigs.moderate,
  },

  slideLeft: {
    from: { translateX: 50, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    config: timingConfigs.moderate,
  },

  slideRight: {
    from: { translateX: -50, opacity: 0 },
    to: { translateX: 0, opacity: 1 },
    config: timingConfigs.moderate,
  },

  scaleEnter: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: springConfigs.gentle,
  },

  bounceIn: {
    from: { scale: 0.3, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: springConfigs.bouncy,
  },

  zoomIn: {
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: springConfigs.snappy,
  },
};

/**
 * Exit animation presets
 */
export const exitAnimations = {
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    config: timingConfigs.fast,
  },

  fadeOutUp: {
    from: { opacity: 1, translateY: 0 },
    to: { opacity: 0, translateY: -20 },
    config: timingConfigs.fast,
  },

  fadeOutDown: {
    from: { opacity: 1, translateY: 0 },
    to: { opacity: 0, translateY: 20 },
    config: timingConfigs.fast,
  },

  slideOutUp: {
    from: { translateY: 0, opacity: 1 },
    to: { translateY: -50, opacity: 0 },
    config: timingConfigs.fast,
  },

  slideOutDown: {
    from: { translateY: 0, opacity: 1 },
    to: { translateY: 50, opacity: 0 },
    config: timingConfigs.fast,
  },

  scaleExit: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.8, opacity: 0 },
    config: timingConfigs.fast,
  },

  bounceOut: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0.3, opacity: 0 },
    config: springConfigs.snappy,
  },

  zoomOut: {
    from: { scale: 1, opacity: 1 },
    to: { scale: 0, opacity: 0 },
    config: timingConfigs.fast,
  },
};

/**
 * Attention-seeking animation presets
 */
export const attentionAnimations = {
  pulse: {
    from: { scale: 1 },
    to: { scale: 1.05 },
    loop: true,
    config: { duration: 800, easing: Easing.inOut(Easing.ease) } as WithTimingConfig,
  },

  shake: {
    keyframes: [
      { translateX: 0 },
      { translateX: -10 },
      { translateX: 10 },
      { translateX: -10 },
      { translateX: 10 },
      { translateX: 0 },
    ],
    config: { duration: 400, easing: Easing.linear } as WithTimingConfig,
  },

  bounce: {
    from: { translateY: 0 },
    to: { translateY: -10 },
    loop: true,
    config: springConfigs.bouncy,
  },

  glow: {
    from: { opacity: 0.6 },
    to: { opacity: 1 },
    loop: true,
    config: { duration: 1000, easing: Easing.inOut(Easing.ease) } as WithTimingConfig,
  },

  wiggle: {
    keyframes: [
      { rotate: '0deg' },
      { rotate: '-5deg' },
      { rotate: '5deg' },
      { rotate: '-5deg' },
      { rotate: '5deg' },
      { rotate: '0deg' },
    ],
    config: { duration: 500, easing: Easing.linear } as WithTimingConfig,
  },

  heartbeat: {
    keyframes: [
      { scale: 1 },
      { scale: 1.1 },
      { scale: 1 },
      { scale: 1.1 },
      { scale: 1 },
    ],
    config: { duration: 1200, easing: Easing.ease } as WithTimingConfig,
  },
};

/**
 * Interaction animation presets
 */
export const interactionAnimations = {
  buttonPress: {
    from: { scale: 1 },
    to: { scale: 0.97 },
    config: springConfigs.snappy,
  },

  buttonRelease: {
    from: { scale: 0.97 },
    to: { scale: 1 },
    config: springConfigs.gentle,
  },

  cardHover: {
    from: { scale: 1, translateY: 0 },
    to: { scale: 1.02, translateY: -4 },
    config: timingConfigs.normal,
  },

  cardPress: {
    from: { scale: 1 },
    to: { scale: 0.98 },
    config: timingConfigs.fast,
  },

  ripple: {
    from: { scale: 0, opacity: 0.6 },
    to: { scale: 2, opacity: 0 },
    config: { duration: 600, easing: Easing.out(Easing.ease) } as WithTimingConfig,
  },
};

/**
 * Feedback animation presets
 */
export const feedbackAnimations = {
  success: {
    keyframes: [
      { scale: 1, opacity: 0 },
      { scale: 1.2, opacity: 1 },
      { scale: 1, opacity: 1 },
    ],
    config: springConfigs.bouncy,
  },

  error: {
    keyframes: [
      { translateX: 0 },
      { translateX: -10 },
      { translateX: 10 },
      { translateX: -10 },
      { translateX: 10 },
      { translateX: 0 },
    ],
    config: { duration: 400, easing: Easing.linear } as WithTimingConfig,
  },

  warning: {
    from: { opacity: 0.6 },
    to: { opacity: 1 },
    loop: true,
    config: { duration: 600, easing: Easing.inOut(Easing.ease) } as WithTimingConfig,
  },

  info: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: timingConfigs.normal,
  },
};

/**
 * Chess-specific animation presets
 */
export const chessAnimations = {
  pieceMove: {
    from: { translateX: 0, translateY: 0 },
    to: { translateX: 0, translateY: 0 }, // Will be set dynamically
    config: { duration: 250, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
  },

  pieceDrop: {
    from: { scale: 1.1, opacity: 0.8 },
    to: { scale: 1, opacity: 1 },
    config: springConfigs.gentle,
  },

  pieceCapture: {
    keyframes: [
      { scale: 1, opacity: 1 },
      { scale: 1.2, opacity: 0.5 },
      { scale: 0, opacity: 0 },
    ],
    config: { duration: 300, easing: Easing.in(Easing.ease) } as WithTimingConfig,
  },

  checkHighlight: {
    from: { opacity: 0 },
    to: { opacity: 0.7 },
    loop: true,
    config: { duration: 500, easing: Easing.inOut(Easing.ease) } as WithTimingConfig,
  },

  evalBarShift: {
    from: { height: 0 },
    to: { height: 0 }, // Will be set dynamically
    config: springConfigs.moderate,
  },

  brilliantMove: {
    keyframes: [
      { scale: 1, opacity: 1 },
      { scale: 1.15, opacity: 1 },
      { scale: 1, opacity: 1 },
    ],
    config: springConfigs.bouncy,
  },

  blunderShake: {
    keyframes: [
      { translateX: 0 },
      { translateX: -8 },
      { translateX: 8 },
      { translateX: -8 },
      { translateX: 8 },
      { translateX: 0 },
    ],
    config: { duration: 400, easing: Easing.linear } as WithTimingConfig,
  },
};

/**
 * Celebration animation presets
 */
export const celebrationAnimations = {
  confetti: {
    keyframes: [
      { translateY: 0, rotate: '0deg', opacity: 1 },
      { translateY: 100, rotate: '360deg', opacity: 0 },
    ],
    config: { duration: 2000, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
  },

  trophy: {
    keyframes: [
      { scale: 0, translateY: 50, opacity: 0 },
      { scale: 1.2, translateY: -10, opacity: 1 },
      { scale: 1, translateY: 0, opacity: 1 },
    ],
    config: springConfigs.bouncy,
  },

  fireworks: {
    keyframes: [
      { scale: 0, opacity: 1 },
      { scale: 1.5, opacity: 0.8 },
      { scale: 2, opacity: 0 },
    ],
    config: { duration: 1000, easing: Easing.out(Easing.ease) } as WithTimingConfig,
  },

  starBurst: {
    keyframes: [
      { scale: 0, rotate: '0deg', opacity: 1 },
      { scale: 1.5, rotate: '180deg', opacity: 0 },
    ],
    config: { duration: 800, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
  },
};

/**
 * Complete animation presets object
 */
export const animationPresets = {
  timing: timingConfigs,
  spring: springConfigs,
  entrance: entranceAnimations,
  exit: exitAnimations,
  attention: attentionAnimations,
  interaction: interactionAnimations,
  feedback: feedbackAnimations,
  chess: chessAnimations,
  celebration: celebrationAnimations,
} as const;

/**
 * Stagger delay helper
 * Creates sequential delays for list animations
 */
export const getStaggerDelay = (index: number, baseDelay = 50): number => {
  return index * baseDelay;
};

/**
 * Sequence delay helper
 * Creates delays for sequential animations
 */
export const getSequenceDelay = (step: number, stepDuration = 200): number => {
  return step * stepDuration;
};

/**
 * Loop animation helper configuration
 */
export const loopConfig = {
  continuous: -1, // Infinite loop
  once: 1,
  twice: 2,
  thrice: 3,
} as const;

/**
 * Motion Tokens
 * app/ui/tokens/motion.ts
 * 
 * Motion scale: 120-180ms (buttons) | 180-250ms (cards) | 250-300ms (pages)
 */

export const motionTokens = {
  duration: {
    instant: 100,
    fast: 150,      // Buttons, toggles
    normal: 200,    // Card hover, micro-interactions
    moderate: 250,  // Modals, drawers
    slow: 300,      // Page transitions
    slower: 400,    // Complex animations
    slowest: 500,   // Hero animations
  },
  easing: {
    linear: 'linear' as const,
    in: 'cubic-bezier(0.4, 0, 1, 1)' as const,
    out: 'cubic-bezier(0, 0, 0.2, 1)' as const,
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)' as const,
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)' as const,
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' as const,
  },
} as const;

/**
 * Interaction states and transforms
 */
export const microInteractions = {
  // Scale transforms
  scalePress: 0.97,        // Button press
  scaleHover: 1.02,        // Card hover
  scaleActive: 0.98,       // Active state
  
  // Opacity states
  opacityDisabled: 0.5,    // Disabled elements
  opacityHover: 0.8,       // Subtle hover
  opacityPressed: 0.7,     // Pressed state
  opacityGhost: 0.6,       // Ghost buttons
  
  // Elevations (translateY)
  liftHover: -2,           // Cards lift on hover
  liftPressed: -1,         // Subtle press feedback
} as const;

/**
 * Gesture feedback patterns
 */
export const gesturePatterns = {
  // Button feedback
  button: {
    duration: motionTokens.duration.fast,
    easing: motionTokens.easing.inOut,
    scale: microInteractions.scalePress,
  },
  
  // Card hover
  cardHover: {
    duration: motionTokens.duration.normal,
    easing: motionTokens.easing.out,
    scale: microInteractions.scaleHover,
    lift: microInteractions.liftHover,
  },
  
  // Modal/drawer
  modal: {
    duration: motionTokens.duration.moderate,
    easing: motionTokens.easing.inOut,
  },
  
  // Page transition
  pageTransition: {
    duration: motionTokens.duration.slow,
    easing: motionTokens.easing.out,
  },
} as const;

export type MotionDuration = typeof motionTokens.duration[keyof typeof motionTokens.duration];
export type MotionEasing = typeof motionTokens.easing[keyof typeof motionTokens.easing];

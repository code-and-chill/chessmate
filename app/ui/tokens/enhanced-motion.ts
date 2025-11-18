/**
 * Enhanced Motion & Animation Tokens
 * Sophisticated transitions and micro-interactions for AI-inspired UX
 */

export const enhancedMotionTokens = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 250,
    smooth: 350,
    slow: 500,
    slower: 700,
  },
  easing: {
    // Standard easing functions
    linear: 'linear' as const,
    in: 'cubic-bezier(0.4, 0, 1, 1)' as const,
    out: 'cubic-bezier(0, 0, 0.2, 1)' as const,
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)' as const,
    
    // AI-inspired smooth easing
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)' as const,
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' as const,
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' as const,
  },
  spring: {
    gentle: { tension: 120, friction: 14 },
    moderate: { tension: 170, friction: 26 },
    snappy: { tension: 210, friction: 20 },
  },
};

export const microInteractions = {
  // Scale transformations
  scalePress: 0.97,
  scaleHover: 1.02,
  scaleActive: 0.95,
  scaleFocus: 1.01,
  
  // Opacity states
  opacityDisabled: 0.4,
  opacityMuted: 0.6,
  opacityHover: 0.8,
  opacityFull: 1,
  
  // Blur effects
  blurLight: 8,
  blurMedium: 16,
  blurHeavy: 24,
  
  // Rotation for loading states
  rotateLoading: '360deg',
  
  // Fade transitions
  fadeIn: {
    from: 0,
    to: 1,
  },
  fadeOut: {
    from: 1,
    to: 0,
  },
  
  // Slide transitions
  slideUp: {
    from: { translateY: 20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
  },
  slideDown: {
    from: { translateY: -20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
  },
};

/**
 * Gesture configurations for smooth interactions
 */
export const gestureConfig = {
  swipe: {
    threshold: 50,
    velocity: 0.3,
  },
  drag: {
    threshold: 10,
    damping: 0.8,
  },
  longPress: {
    duration: 500,
  },
};

/**
 * Animation presets for common patterns
 */
export const animationPresets = {
  fadeIn: {
    duration: enhancedMotionTokens.duration.normal,
    easing: enhancedMotionTokens.easing.out,
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    duration: enhancedMotionTokens.duration.fast,
    easing: enhancedMotionTokens.easing.in,
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideInUp: {
    duration: enhancedMotionTokens.duration.smooth,
    easing: enhancedMotionTokens.easing.smooth,
    from: { translateY: 20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
  },
  slideInDown: {
    duration: enhancedMotionTokens.duration.smooth,
    easing: enhancedMotionTokens.easing.smooth,
    from: { translateY: -20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
  },
  scaleIn: {
    duration: enhancedMotionTokens.duration.smooth,
    easing: enhancedMotionTokens.easing.bounce,
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
  },
  pulse: {
    duration: enhancedMotionTokens.duration.slower,
    easing: enhancedMotionTokens.easing.inOut,
    loop: true,
    from: { scale: 1 },
    to: { scale: 1.05 },
  },
};

/**
 * Loading animation variants
 */
export const loadingAnimations = {
  spinner: {
    duration: 1000,
    easing: enhancedMotionTokens.easing.linear,
    loop: true,
    from: { rotate: '0deg' },
    to: { rotate: '360deg' },
  },
  pulse: {
    duration: 1500,
    easing: enhancedMotionTokens.easing.inOut,
    loop: true,
    from: { opacity: 0.4, scale: 1 },
    to: { opacity: 1, scale: 1.1 },
  },
  dots: {
    duration: 1200,
    easing: enhancedMotionTokens.easing.inOut,
    loop: true,
    stagger: 200,
  },
};

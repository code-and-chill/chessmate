/**
 * Motion Tokens
 * app/ui/tokens/motion.ts
 */

export const motionTokens = {
  duration: {
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 500,
  },
  easing: {
    linear: 'linear' as const,
    in: 'cubic-bezier(0.4, 0, 1, 1)' as const,
    out: 'cubic-bezier(0, 0, 0.2, 1)' as const,
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)' as const,
  },
};

export const microInteractions = {
  scalePress: 0.98,
  scaleHover: 1.01,
  opacityDisabled: 0.5,
};

/**
 * AI-Inspired Gradient Tokens
 * Sophisticated gradients for modern, AI-focused interfaces
 */

export const gradientTokens = {
  // Primary gradients (brand-aligned)
  primarySubtle: {
    colors: ['#667EEA', '#764BA2'],
    angle: 135,
    type: 'linear' as const,
  },
  primaryVibrant: {
    colors: ['#667EEA', '#764BA2', '#F093FB'],
    angle: 135,
    type: 'linear' as const,
  },
  
  // Neutral gradients (backgrounds)
  neutralLight: {
    colors: ['#F8F9FA', '#FFFFFF'],
    angle: 180,
    type: 'linear' as const,
  },
  neutralDark: {
    colors: ['#1A1A2E', '#16213E'],
    angle: 180,
    type: 'linear' as const,
  },
  
  // AI-inspired gradients (soft, sophisticated)
  aiBlue: {
    colors: ['#4A5FFF', '#6B8AFF', '#8BA7FF'],
    angle: 120,
    type: 'linear' as const,
  },
  aiPurple: {
    colors: ['#8B5CF6', '#A78BFA', '#C4B5FD'],
    angle: 135,
    type: 'linear' as const,
  },
  aiTeal: {
    colors: ['#14B8A6', '#2DD4BF', '#5EEAD4'],
    angle: 120,
    type: 'linear' as const,
  },
  
  // Status gradients
  successGradient: {
    colors: ['#10B981', '#34D399'],
    angle: 135,
    type: 'linear' as const,
  },
  warningGradient: {
    colors: ['#F59E0B', '#FBBF24'],
    angle: 135,
    type: 'linear' as const,
  },
  errorGradient: {
    colors: ['#EF4444', '#F87171'],
    angle: 135,
    type: 'linear' as const,
  },
  
  // Glass morphism
  glassMorphLight: {
    colors: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.3)'],
    angle: 135,
    type: 'linear' as const,
  },
  glassMorphDark: {
    colors: ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.1)'],
    angle: 135,
    type: 'linear' as const,
  },
  
  // Radial gradients for depth
  radialGlow: {
    colors: ['rgba(102, 126, 234, 0.3)', 'rgba(102, 126, 234, 0)'],
    type: 'radial' as const,
    position: 'center',
  },
  
  // Mesh gradients (multi-color)
  meshCool: {
    colors: ['#667EEA', '#764BA2', '#F093FB', '#4FACFE'],
    angle: 135,
    type: 'linear' as const,
  },
  meshWarm: {
    colors: ['#FA709A', '#FEE140', '#30CFD0', '#667EEA'],
    angle: 135,
    type: 'linear' as const,
  },
};

/**
 * Helper function to generate CSS gradient strings
 */
export const toGradientString = (gradient: typeof gradientTokens.primarySubtle): string => {
  if (gradient.type === 'radial') {
    return `radial-gradient(circle at ${gradient.position || 'center'}, ${gradient.colors.join(', ')})`;
  }
  return `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(', ')})`;
};

/**
 * Background overlay patterns for depth
 */
export const overlayPatterns = {
  dots: {
    size: 20,
    color: 'rgba(0, 0, 0, 0.05)',
    spacing: 40,
  },
  grid: {
    size: 1,
    color: 'rgba(0, 0, 0, 0.03)',
    spacing: 32,
  },
  noise: {
    opacity: 0.02,
    blend: 'multiply' as const,
  },
};

// Theme-aware resolver: returns gradient tokens resolved for current theme.
// This helper is non-breaking and consumers can opt-in to use theme-aware gradients
// via `getGradientTokens(isDark)` instead of the static `gradientTokens` when
// they want colors that adapt to light/dark mode.
import { semanticColors } from './colors';

export const getGradientTokens = (isDark: boolean) => {
  const colors = semanticColors(isDark);

  return {
    ...gradientTokens,
    glassMorphLight: { ...gradientTokens.glassMorphLight, colors: [colors.translucent.light, colors.translucent.medium] },
    glassMorphDark: { ...gradientTokens.glassMorphDark, colors: [colors.translucent.dark, colors.translucent.medium] },
    radialGlow: { ...gradientTokens.radialGlow, colors: [colors.accent.primary, 'transparent'] },
  } as const;
};

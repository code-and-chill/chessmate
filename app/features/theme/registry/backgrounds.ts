/**
 * Background Theme Registry
 * app/features/theme/registry/backgrounds.ts
 * 
 * Collection of background themes for the chess UI
 */

import type { BackgroundTheme } from '../domain/models';

/**
 * Light Solid Background
 */
export const lightSolidBackground: BackgroundTheme = {
  id: 'light-solid',
  name: 'Light',
  type: 'solid',
  solid: {
    color: '#F7FAFC',
  },
};

/**
 * Dark Solid Background
 */
export const darkSolidBackground: BackgroundTheme = {
  id: 'dark-solid',
  name: 'Dark',
  type: 'solid',
  solid: {
    color: '#1A202C',
  },
};

/**
 * Blue Gradient Background
 */
export const blueGradientBackground: BackgroundTheme = {
  id: 'blue-gradient',
  name: 'Blue Gradient',
  type: 'gradient',
  gradient: {
    colors: ['#667EEA', '#764BA2'],
    angle: 135,
  },
};

/**
 * Sunset Gradient Background
 */
export const sunsetGradientBackground: BackgroundTheme = {
  id: 'sunset-gradient',
  name: 'Sunset',
  type: 'gradient',
  gradient: {
    colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'],
    angle: 90,
    stops: [0, 0.5, 1],
  },
};

/**
 * Glass Morphism Background
 */
export const glassBackground: BackgroundTheme = {
  id: 'glass',
  name: 'Glass',
  type: 'glass',
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    blurRadius: 20,
    opacity: 0.9,
  },
};

/**
 * Dark Glass Background
 */
export const darkGlassBackground: BackgroundTheme = {
  id: 'dark-glass',
  name: 'Dark Glass',
  type: 'glass',
  glass: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    blurRadius: 15,
    opacity: 0.85,
  },
};

/**
 * Noise Texture Background
 */
export const noiseTextureBackground: BackgroundTheme = {
  id: 'noise-texture',
  name: 'Noise',
  type: 'texture',
  texture: {
    pattern: 'noise',
    color: '#2D3748',
    opacity: 0.05,
  },
};

/**
 * All background themes
 */
export const backgroundThemes: BackgroundTheme[] = [
  lightSolidBackground,
  darkSolidBackground,
  blueGradientBackground,
  sunsetGradientBackground,
  glassBackground,
  darkGlassBackground,
  noiseTextureBackground,
];

/**
 * Default background theme
 */
export const defaultBackgroundTheme = lightSolidBackground;

/**
 * Get background theme by ID
 */
export const getBackgroundTheme = (id: string): BackgroundTheme | undefined => {
  return backgroundThemes.find(theme => theme.id === id);
};

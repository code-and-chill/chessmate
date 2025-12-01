/**
 * Preset Theme Registry
 * app/features/theme/registry/presets.ts
 * 
 * Named bundles of board + pieces + background themes
 */

import type { PresetTheme } from '../domain/models';

/**
 * Classic Preset (Traditional chess.com style)
 */
export const classicPreset: PresetTheme = {
  id: 'classic',
  name: 'Classic',
  description: 'Traditional chess board with warm brown tones',
  boardThemeId: 'classic',
  pieceThemeId: 'classic',
  backgroundThemeId: 'light-solid',
  tags: ['classic', 'traditional', 'light'],
};

/**
 * Modern Dark Preset
 */
export const modernDarkPreset: PresetTheme = {
  id: 'modern-dark',
  name: 'Modern Dark',
  description: 'Sleek dark theme for night owls',
  boardThemeId: 'modern-dark',
  pieceThemeId: 'neo',
  backgroundThemeId: 'dark-solid',
  tags: ['dark', 'modern', 'minimal'],
};

/**
 * Marble Preset (Elegant white)
 */
export const marblePreset: PresetTheme = {
  id: 'marble',
  name: 'Marble',
  description: 'Elegant marble board with classic pieces',
  boardThemeId: 'marble',
  pieceThemeId: 'staunton',
  backgroundThemeId: 'light-solid',
  tags: ['elegant', 'light', 'classic'],
};

/**
 * Wood Preset (Natural tones)
 */
export const woodPreset: PresetTheme = {
  id: 'wood',
  name: 'Wood',
  description: 'Warm wooden board with traditional feel',
  boardThemeId: 'wood',
  pieceThemeId: 'classic',
  backgroundThemeId: 'light-solid',
  tags: ['warm', 'natural', 'traditional'],
};

/**
 * Neon Preset (Cyberpunk style)
 */
export const neonPreset: PresetTheme = {
  id: 'neon',
  name: 'Neon',
  description: 'Futuristic cyberpunk chess experience',
  boardThemeId: 'neon',
  pieceThemeId: 'neo',
  backgroundThemeId: 'dark-solid',
  isPremium: true,
  tags: ['dark', 'neon', 'cyberpunk', 'modern'],
};

/**
 * Glass Preset (Glassmorphism)
 */
export const glassPreset: PresetTheme = {
  id: 'glass',
  name: 'Glass',
  description: 'Modern glassmorphism design',
  boardThemeId: 'glass',
  pieceThemeId: 'alpha',
  backgroundThemeId: 'blue-gradient',
  isPremium: true,
  tags: ['modern', 'glass', 'gradient'],
};

/**
 * All preset themes
 */
export const presetThemes: PresetTheme[] = [
  classicPreset,
  modernDarkPreset,
  marblePreset,
  woodPreset,
  neonPreset,
  glassPreset,
];

/**
 * Default preset theme
 */
export const defaultPreset = classicPreset;

/**
 * Get preset theme by ID
 */
export const getPreset = (id: string): PresetTheme | undefined => {
  return presetThemes.find(preset => preset.id === id);
};

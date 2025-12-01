/**
 * Theme Feature Public API
 * app/features/theme/index.ts
 * 
 * Export all theme-related components, hooks, and types
 */

// Store and hooks
export { useThemeStore, useTheme } from './stores/useThemeStore';

// Components
export { BackgroundLayer } from './components/BackgroundLayer';
export { ThemeSelector } from './components/ThemeSelector';

// Domain models
export type {
  BoardTheme,
  PieceTheme,
  BackgroundTheme,
  PresetTheme,
  ChessTheme,
  PieceSvgProps,
  ThemeState,
} from './domain/models';

// Registries
export {
  boardThemes,
  defaultBoardTheme,
  getBoardTheme,
} from './registry/boards';

export {
  pieceThemes,
  defaultPieceTheme,
  getPieceTheme,
} from './registry/pieces';

export {
  backgroundThemes,
  defaultBackgroundTheme,
  getBackgroundTheme,
} from './registry/backgrounds';

export {
  presetThemes,
  defaultPreset,
  getPreset,
} from './registry/presets';

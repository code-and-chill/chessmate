/**
 * Settings Feature Public API
 * features/settings/index.ts
 */

// Main screen
export { SettingsScreen } from './screens/SettingsScreen';
export type { SettingsScreenProps } from './screens/SettingsScreen';

// Components (if needed externally)
export { SettingsHub } from './components/SettingsHub';
export type { SettingsHubProps } from './components/SettingsHub';

// Hooks
export { useUserProfile, useUserStats, useUserPreferences } from './hooks';

// Types
export type {
  SettingsMode,
  UserProfile,
  UserStats,
  Achievement,
  GamePreferences,
  AppearanceSettings,
  SoundSettings,
  AnalysisSettings,
  UserPreferences,
  RecentGame,
} from './types';

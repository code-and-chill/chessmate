/**
 * Settings Feature Types
 * features/settings/types/settings.types.ts
 */

export type SettingsMode = 'hub' | 'profile' | 'stats' | 'achievements' | 'preferences' | 'appearance';

export type UserProfile = {
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinDate: string;
};

export type UserStats = {
  blitzRating: number;
  rapidRating: number;
  classicalRating: number;
  gamesPlayed: number;
  winRate: number;
};

export type Preference = {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoQueen: boolean;
  showCoordinates: boolean;
  moveConfirmation: boolean;
};

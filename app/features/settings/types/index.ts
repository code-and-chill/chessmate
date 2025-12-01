/**
 * Settings Feature Types
 * features/settings/types/index.ts
 */

export type SettingsMode = 'hub' | 'profile' | 'stats' | 'achievements' | 'preferences' | 'appearance';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  displayName?: string;
  bio?: string;
  country?: string;
  memberSince: string;
  ratings: {
    blitz: number;
    rapid: number;
    classical: number;
  };
}

export interface UserStats {
  timeControl: 'blitz' | 'rapid' | 'classical';
  rating: number;
  peak: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  insights: {
    bestOpening: string;
    avgMoveTime: string;
    currentStreak: string;
    ratingTrend: string;
  };
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  date?: string;
  progress?: string;
}

export interface GamePreferences {
  boardTheme: string;
  pieceSet: string;
  boardCoordinates: boolean;
  moveHighlighting: boolean;
  autoQueenPromotion: boolean;
  showLegalMoves: boolean;
  premovesEnabled: boolean;
  confirmMoves: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timeFormat: '12h' | '24h';
  notationStyle: 'algebraic' | 'descriptive';
  fontSize: 'small' | 'medium' | 'large';
}

export interface SoundSettings {
  soundEffects: boolean;
  moveAnimation: 'slow' | 'normal' | 'fast';
  pieceAnimation: boolean;
  vibration: boolean;
}

export interface AnalysisSettings {
  postGameAnalysis: 'manual' | 'automatic' | 'off';
  showEngineLines: boolean;
  evaluationBar: boolean;
  bestMoveHints: 'never' | 'after_game' | 'always';
}

/**
 * User Preferences matching account-api backend structure
 * Maps to AccountPreferences in account-api/app/domain/models/account_preferences.py
 */
export interface UserPreferences {
  // Backend fields (from account-api)
  board_theme: string;                    // "classic", "green", "brown", etc.
  piece_set: string;                      // "classic", "neo", "cburnett", etc.
  sound_enabled: boolean;                 // Master sound toggle
  animation_level: 'none' | 'minimal' | 'full';  // Animation intensity
  highlight_legal_moves: boolean;         // Show legal move indicators
  show_coordinates: boolean;              // Show board coordinates (a-h, 1-8)
  confirm_moves: boolean;                 // Require move confirmation
  default_time_control: 'bullet' | 'blitz' | 'rapid' | 'classical';  // Default game type
  auto_queen_promotion: boolean;          // Auto-promote pawns to queen
  
  // Frontend-only fields (TODO: Move to backend or separate state)
  // These are not persisted to account-api yet
  vibration?: boolean;                    // Haptic feedback (mobile only)
  piece_animation?: boolean;              // Piece movement animation
  
  // Analysis preferences (TODO: Add to backend)
  post_game_analysis?: 'manual' | 'automatic' | 'off';
  show_engine_lines?: boolean;
  evaluation_bar?: boolean;
  best_move_hints?: 'never' | 'after_game' | 'always';
}

/**
 * Helper to convert backend preferences to UI-friendly grouped format
 */
export interface UserPreferencesGrouped {
  game: GamePreferences;
  sound: SoundSettings;
  analysis: AnalysisSettings;
}

export interface RecentGame {
  id: string;
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  opponentRating: number;
  date: string;
  timeControl: string;
}

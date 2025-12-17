/**
 * Frontend-Only Settings Types
 * 
 * These types represent settings that are managed locally in the frontend
 * and are not persisted to the backend API.
 * 
 * These may be:
 * - Mobile-specific features (vibration, etc.)
 * - Temporary UI preferences
 * - Features not yet implemented in the backend
 */

/**
 * Frontend-only preferences that are not sent to the backend
 */
export interface FrontendOnlyPreferences {
  /**
   * Haptic feedback (mobile only)
   * Not persisted to backend as it's device-specific
   */
  vibration?: boolean;

  /**
   * Piece movement animation
   * This may be merged with animation_level in the future
   */
  piece_animation?: boolean;

  /**
   * Analysis preferences (not yet implemented in backend)
   * These will be moved to backend when the analysis API is ready
   */
  post_game_analysis?: 'manual' | 'automatic' | 'off';
  show_engine_lines?: boolean;
  evaluation_bar?: boolean;
  best_move_hints?: 'never' | 'after_game' | 'always';
}

/**
 * Combined preferences type that includes both backend and frontend-only settings
 */
export interface CombinedUserPreferences {
  // Backend preferences (from UserPreferences in index.ts)
  board_theme: string;
  piece_set: string;
  sound_enabled: boolean;
  animation_level: 'none' | 'minimal' | 'full';
  highlight_legal_moves: boolean;
  show_coordinates: boolean;
  confirm_moves: boolean;
  default_time_control: 'bullet' | 'blitz' | 'rapid' | 'classical';
  auto_queen_promotion: boolean;

  // Frontend-only preferences
  frontend?: FrontendOnlyPreferences;
}

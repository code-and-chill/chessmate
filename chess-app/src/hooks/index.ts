/**
 * Centralized hooks exports for the Chess app.
 * 
 * All custom React hooks are exported from this single file for easy importing.
 */

// Authentication
export { useAuth, type AuthContext } from './useAuth';

// Game management
export { useGame, type UseGameReturn } from './useGame';
export { useGameInteractivity, type GameInteractivity, type Color } from './useGameInteractivity';
export { useGameParticipant, type GameParticipant } from './useGameParticipant';

// Game discovery
export { useNowPlaying, type UseNowPlayingReturn } from './useNowPlaying';
export { useRecentGames, type UseRecentGamesReturn } from './useRecentGames';

// Puzzle features
export { usePuzzleHistory, type UsePuzzleHistoryReturn, type PuzzleAttempt } from './usePuzzleHistory';
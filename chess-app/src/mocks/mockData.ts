/**
 * Mock Data Generator
 * Provides realistic mock data for all API endpoints
 */

import type { Puzzle } from '../types/Puzzle';
import type { PuzzleAttemptResponse } from '../api/puzzleApi';
import type { Game } from '../types/game';
import type { GameState } from '../types/GameState';

/**
 * Generate mock puzzles with realistic data
 */
export const generateMockPuzzle = (id: string = 'puzzle-123'): Puzzle => ({
  id,
  fen: 'r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
  solutionMoves: ['Bxc6', 'bxc6', 'O-O'],
  sideToMove: 'w',
  difficulty: 'medium',
  themes: ['opening', 'tactics', 'development'],
  rating: 1600,
  initialDepth: 12,
});

/**
 * Generate daily puzzle
 */
export const generateMockDailyPuzzle = (): Puzzle => ({
  id: `puzzle-daily-${Date.now()}`,
  fen: '8/5pk1/2p3p1/1pPp1pP1/1P1Pp3/2P1K3/7R/8 w - - 0 1',
  solutionMoves: ['Rxh7', 'Kg7', 'Rh5'],
  sideToMove: 'w',
  difficulty: 'hard',
  themes: ['endgame', 'tactics', 'sacrifice'],
  rating: 1900,
  initialDepth: 18,
});

/**
 * Generate mock game
 */
export const generateMockGame = (id: string = 'game-123'): Game => ({
  id,
  player1: 'player-1',
  player2: 'player-2',
  status: 'ongoing',
  moves: [],
});

/**
 * Generate mock game state
 */
export const generateMockGameState = (): GameState => ({
  board: Array(8)
    .fill(null)
    .map(() => Array(8).fill('')),
  turn: 'white',
  status: 'ongoing',
});

/**
 * Generate mock games
 */
export const generateMockGames = (count: number = 5): Game[] => {
  const games: Game[] = [];
  for (let i = 0; i < count; i++) {
    games.push(generateMockGame(`game-${i + 1}`));
  }
  return games;
};

/**
 * Generate mock game states
 */
export const generateMockGameStates = (count: number = 5): GameState[] => {
  const games: GameState[] = [];
  for (let i = 0; i < count; i++) {
    games.push(generateMockGameState());
  }
  return games;
};

/**
 * Generate mock puzzle attempt response
 */
export const generateMockPuzzleAttemptResponse = (
  puzzleId: string = 'puzzle-123'
): PuzzleAttemptResponse => ({
  id: `attempt-${Date.now()}`,
  puzzleId,
  ratingChange: Math.floor(Math.random() * 50) - 25,
  status: Math.random() > 0.3 ? 'SUCCESS' : 'FAILED',
});

/**
 * Generate mock user stats
 */
export const generateMockUserStats = (userId: string = 'user-123') => ({
  userId,
  puzzlesAttempted: 1250,
  puzzlesSolved: 945,
  currentRating: 1950,
  solveRate: 0.756,
  bestStreak: 87,
  currentStreak: 12,
  averageTimeMs: 45000,
  ratingHistory: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    rating: 1850 + Math.floor(Math.random() * 100) - 50,
  })),
});

/**
 * Generate mock user history
 */
export const generateMockUserHistory = (userId: string = 'user-123', limit: number = 10) => ({
  userId,
  history: Array.from({ length: limit }, (_, i) => ({
    puzzleId: `puzzle-${i + 1}`,
    puzzle: generateMockPuzzle(`puzzle-${i + 1}`),
    attempt: {
      status: Math.random() > 0.3 ? 'SUCCESS' : 'FAILED',
      timeSpentMs: Math.floor(Math.random() * 120000),
      hintsUsed: Math.floor(Math.random() * 3),
      ratingChange: Math.floor(Math.random() * 50) - 25,
    },
    completedAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
  })),
});

/**
 * Generate completed games
 */
export const generateCompletedGames = (count: number = 10): Game[] => {
  const games: Game[] = [];
  for (let i = 0; i < count; i++) {
    const game = generateMockGame(`history-${i + 1}`);
    game.status = 'completed';
    game.winner = Math.random() > 0.5 ? game.player1 : game.player2;
    game.moves = Array.from({ length: Math.floor(Math.random() * 50) }, () =>
      String.fromCharCode(97 + Math.floor(Math.random() * 8)) +
      String.fromCharCode(49 + Math.floor(Math.random() * 8)) +
      String.fromCharCode(97 + Math.floor(Math.random() * 8)) +
      String.fromCharCode(49 + Math.floor(Math.random() * 8))
    );
    games.push(game);
  }
  return games;
};

import { create } from 'zustand';

/**
 * Puzzle State Management
 * Manages puzzle solving, progress, and history
 */

export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  description?: string;
}

export interface PuzzleAttempt {
  puzzleId: string;
  solved: boolean;
  attemptedMoves: string[];
  timeSpent: number;
  timestamp: number;
}

export interface PuzzleState {
  // Current puzzle
  currentPuzzle: Puzzle | null;
  currentMoveIndex: number;
  userMoves: string[];
  isCorrect: boolean | null;
  hint: string | null;

  // History and stats
  history: PuzzleAttempt[];
  totalSolved: number;
  currentStreak: number;
  averageRating: number;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPuzzle: (puzzle: Puzzle) => void;
  makeUserMove: (move: string) => void;
  checkSolution: () => boolean;
  showHint: () => void;
  nextPuzzle: () => Promise<void>;
  retryPuzzle: () => void;
  recordAttempt: (attempt: PuzzleAttempt) => void;
  clearHistory: () => void;
  clearError: () => void;
}

export const usePuzzleStore = create<PuzzleState>((set, get) => ({
  // Initial state
  currentPuzzle: null,
  currentMoveIndex: 0,
  userMoves: [],
  isCorrect: null,
  hint: null,
  history: [],
  totalSolved: 0,
  currentStreak: 0,
  averageRating: 0,
  isLoading: false,
  error: null,

  // Actions
  loadPuzzle: (puzzle) =>
    set({
      currentPuzzle: puzzle,
      currentMoveIndex: 0,
      userMoves: [],
      isCorrect: null,
      hint: null,
      isLoading: false,
    }),

  makeUserMove: (move) => {
    const state = get();
    const newUserMoves = [...state.userMoves, move];
    
    set({
      userMoves: newUserMoves,
      currentMoveIndex: state.currentMoveIndex + 1,
    });

    // Auto-check solution after each move
    get().checkSolution();
  },

  checkSolution: () => {
    const state = get();
    if (!state.currentPuzzle) return false;

    const expectedMoves = state.currentPuzzle.moves;
    const userMoves = state.userMoves;

    // Check if all user moves match expected moves
    const isCorrect = userMoves.every((move, index) => move === expectedMoves[index]);
    const isComplete = isCorrect && userMoves.length === expectedMoves.length;

    set({
      isCorrect: isComplete ? true : userMoves.length > 0 ? isCorrect : null,
    });

    return isComplete;
  },

  showHint: () => {
    const state = get();
    if (!state.currentPuzzle) return;

    const nextMove = state.currentPuzzle.moves[state.userMoves.length];
    if (nextMove) {
      set({
        hint: `Try moving to ${nextMove}`,
      });
    }
  },

  nextPuzzle: async () => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Replace with actual API call
      // const puzzle = await puzzleApi.getNext();
      
      // Mock for now
      const mockPuzzle: Puzzle = {
        id: `puzzle-${Date.now()}`,
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moves: ['e2e4', 'e7e5'],
        rating: 1500,
        themes: ['opening'],
      };

      get().loadPuzzle(mockPuzzle);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load puzzle',
        isLoading: false,
      });
    }
  },

  retryPuzzle: () =>
    set({
      userMoves: [],
      currentMoveIndex: 0,
      isCorrect: null,
      hint: null,
    }),

  recordAttempt: (attempt) => {
    const state = get();
    const newHistory = [...state.history, attempt];
    const solved = attempt.solved ? state.totalSolved + 1 : state.totalSolved;
    const streak = attempt.solved ? state.currentStreak + 1 : 0;

    // Calculate average rating
    const solvedPuzzles = newHistory.filter((a) => a.solved);
    const avgRating = solvedPuzzles.length > 0
      ? solvedPuzzles.reduce((sum) => {
          const puzzle = state.currentPuzzle;
          return sum + (puzzle?.rating || 0);
        }, 0) / solvedPuzzles.length
      : 0;

    set({
      history: newHistory,
      totalSolved: solved,
      currentStreak: streak,
      averageRating: avgRating,
    });
  },

  clearHistory: () =>
    set({
      history: [],
      totalSolved: 0,
      currentStreak: 0,
      averageRating: 0,
    }),

  clearError: () => set({ error: null }),
}));

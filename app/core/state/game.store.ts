import { create } from 'zustand';

/**
 * Game State Management
 * Manages active game state, moves, position, and game status
 */

export type GameStatus = 'active' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
export type PlayerColor = 'white' | 'black';

export interface Move {
  from: string;
  to: string;
  piece: string;
  captured?: string;
  promotion?: string;
  timestamp: number;
  fen: string;
}

export interface GamePlayer {
  id: string;
  username: string;
  rating: number;
  color: PlayerColor;
  timeRemaining?: number;
}

export interface GameState {
  // Game data
  gameId: string | null;
  fen: string;
  moves: Move[];
  currentMoveIndex: number;
  status: GameStatus;
  turn: PlayerColor;
  inCheck: boolean;
  players: {
    white: GamePlayer | null;
    black: GamePlayer | null;
  };

  // UI state
  selectedSquare: string | null;
  highlightedSquares: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  initGame: (gameId: string, fen: string, players: { white: GamePlayer; black: GamePlayer }) => void;
  makeMove: (from: string, to: string, promotion?: string) => void;
  setFen: (fen: string) => void;
  selectSquare: (square: string | null) => void;
  setHighlightedSquares: (squares: string[]) => void;
  goToMove: (moveIndex: number) => void;
  setGameStatus: (status: GameStatus) => void;
  setInCheck: (inCheck: boolean) => void;
  updatePlayerTime: (color: PlayerColor, timeRemaining: number) => void;
  resetGame: () => void;
  clearError: () => void;
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  gameId: null,
  fen: INITIAL_FEN,
  moves: [],
  currentMoveIndex: -1,
  status: 'active',
  turn: 'white',
  inCheck: false,
  players: {
    white: null,
    black: null,
  },
  selectedSquare: null,
  highlightedSquares: [],
  isLoading: false,
  error: null,

  // Actions
  initGame: (gameId, fen, players) =>
    set({
      gameId,
      fen,
      players,
      moves: [],
      currentMoveIndex: -1,
      status: 'active',
      turn: 'white',
      inCheck: false,
      selectedSquare: null,
      highlightedSquares: [],
      error: null,
    }),

  makeMove: (from, to, promotion) => {
    const state = get();
    const move: Move = {
      from,
      to,
      piece: '', // TODO: Extract from FEN
      timestamp: Date.now(),
      fen: state.fen, // TODO: Calculate new FEN after move
      promotion,
    };

    set({
      moves: [...state.moves, move],
      currentMoveIndex: state.currentMoveIndex + 1,
      turn: state.turn === 'white' ? 'black' : 'white',
      selectedSquare: null,
      highlightedSquares: [],
    });
  },

  setFen: (fen) => set({ fen }),

  selectSquare: (square) =>
    set({
      selectedSquare: square,
      highlightedSquares: square ? [] : [], // TODO: Calculate legal moves
    }),

  setHighlightedSquares: (squares) => set({ highlightedSquares: squares }),

  goToMove: (moveIndex) => {
    const state = get();
    if (moveIndex < 0 || moveIndex >= state.moves.length) {
      // Go to initial position
      set({
        currentMoveIndex: -1,
        fen: INITIAL_FEN,
      });
    } else {
      set({
        currentMoveIndex: moveIndex,
        fen: state.moves[moveIndex].fen,
      });
    }
  },

  setGameStatus: (status) => set({ status }),

  setInCheck: (inCheck) => set({ inCheck }),

  updatePlayerTime: (color, timeRemaining) =>
    set((state) => {
      const player = state.players[color];
      return {
        players: {
          ...state.players,
          [color]: player ? { ...player, timeRemaining } : null,
        },
      };
    }),

  resetGame: () =>
    set({
      gameId: null,
      fen: INITIAL_FEN,
      moves: [],
      currentMoveIndex: -1,
      status: 'active',
      turn: 'white',
      inCheck: false,
      players: { white: null, black: null },
      selectedSquare: null,
      highlightedSquares: [],
      error: null,
    }),

  clearError: () => set({ error: null }),
}));

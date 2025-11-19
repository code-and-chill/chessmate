import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import type { Move } from '@/features/game';

export type GameStatus = 'in_progress' | 'ended';
export type GameResult = '1-0' | '0-1' | '1/2-1/2' | null;
export type PieceColor = 'w' | 'b';

export interface GameState {
  status: GameStatus;
  players: string[];
  moves: Move[];
  fen: string;
  sideToMove: PieceColor;
  endReason: string;
  result: GameResult;
  lastMove: { from: string; to: string } | null;
  capturedByWhite: string[];
  capturedByBlack: string[];
}

interface GameStateActions {
  makeMove: (from: string, to: string, promotion?: string) => void;
  endGame: (result: GameResult, reason: string) => void;
  resetGame: () => void;
}

const createInitialState = (): GameState => ({
  status: 'in_progress',
  players: ['Player 1', 'Player 2'],
  moves: [],
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  sideToMove: 'w',
  endReason: '',
  result: null,
  lastMove: null,
  capturedByWhite: [],
  capturedByBlack: [],
});

export function useGameState(): [GameState, GameStateActions] {
  const [chess] = useState(() => new Chess());
  const [gameState, setGameState] = useState<GameState>(createInitialState);

  const extractCapturedPieces = useCallback((history: any[]): { white: string[], black: string[] } => {
    const capturedByWhite: string[] = [];
    const capturedByBlack: string[] = [];

    history.forEach((move: any) => {
      if (move.captured) {
        const piece = move.captured.toLowerCase();
        if (move.color === 'w') {
          capturedByWhite.push(piece);
        } else {
          capturedByBlack.push(piece);
        }
      }
    });

    return { white: capturedByWhite, black: capturedByBlack };
  }, []);

  const makeMove = useCallback((from: string, to: string, promotion?: string) => {
    try {
      const moveResult = chess.move({
        from,
        to,
        promotion: promotion?.toLowerCase(),
      });

      if (!moveResult) {
        console.warn('Invalid move:', { from, to, promotion });
        return;
      }

      const history = chess.history({ verbose: true });
      const captured = extractCapturedPieces(history);
      const moveNumber = Math.floor((history.length - 1) / 2) + 1;

      const move: Move = {
        moveNumber,
        color: moveResult.color as PieceColor,
        san: moveResult.san,
      };

      let status: GameStatus = 'in_progress';
      let result: GameResult = null;
      let endReason = '';

      if (chess.isCheckmate()) {
        status = 'ended';
        result = chess.turn() === 'w' ? '0-1' : '1-0';
        endReason = 'Checkmate!';
      } else if (chess.isStalemate()) {
        status = 'ended';
        result = '1/2-1/2';
        endReason = 'Stalemate - Game is a draw';
      } else if (chess.isDraw()) {
        status = 'ended';
        result = '1/2-1/2';
        if (chess.isThreefoldRepetition()) {
          endReason = 'Draw by threefold repetition';
        } else if (chess.isInsufficientMaterial()) {
          endReason = 'Draw by insufficient material';
        } else {
          endReason = 'Draw by 50-move rule';
        }
      }

      setGameState((prev) => ({
        ...prev,
        moves: [...prev.moves, move],
        fen: chess.fen(),
        sideToMove: chess.turn() as PieceColor,
        lastMove: { from, to },
        capturedByWhite: captured.white,
        capturedByBlack: captured.black,
        status,
        result,
        endReason,
      }));
    } catch (error) {
      console.error('Error making move:', error);
    }
  }, [chess, extractCapturedPieces]);

  const endGame = useCallback((result: GameResult, reason: string) => {
    setGameState((prev) => ({
      ...prev,
      status: 'ended',
      result,
      endReason: reason,
    }));
  }, []);

  const resetGame = useCallback(() => {
    chess.reset();
    setGameState(createInitialState());
  }, [chess]);

  return [gameState, { makeMove, endGame, resetGame }];
}

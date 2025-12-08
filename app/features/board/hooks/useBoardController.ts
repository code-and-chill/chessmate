import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {Board, Color, Square} from '@/core/utils/chess';
import { useChessEngine } from '@/features/board/hooks/useChessEngine';
import type { Move } from '@/core/utils/chess/types';
import {isKingInCheck, toAlgebraic} from "@/core/utils/chess/logic";

export type UseBoardControllerOpts = {
  board: Board;
  fen: string;
  sideToMove: Color;
  myColor: Color;
  isLocalGame: boolean;
  isInteractive: boolean;
  animateMovements: boolean;
  reduceMotion: boolean;
  onMove?: (from: string, to: string, promotion?: string) => void | Promise<void>;
};

export function useBoardController(opts: UseBoardControllerOpts) {
  const { board, fen, sideToMove, myColor, isLocalGame, isInteractive, animateMovements, reduceMotion, onMove } = opts;

  const { load: engineLoad, getMoves, isValidMove } = useChessEngine(fen);
  useEffect(() => engineLoad(fen), [engineLoad, fen]);

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [animatingPiece, setAnimatingPiece] = useState<any | null>(null);

  const computeLegalMoves = useCallback((f: number, r: number): Move[] => {
    try {
      const piece = board[r]?.[f];
      if (!piece) return [];
      const querySide = (isLocalGame ? (piece.color as Color) : sideToMove) as Color;
      return getMoves(board, { file: f, rank: r }, querySide);
    } catch {
      return [];
    }
  }, [board, getMoves, isLocalGame, sideToMove]);

  const selectSquare = useCallback((f: number, r: number) => {
    setSelectedSquare({ file: f, rank: r });
    const moves = computeLegalMoves(f, r);
    setLegalMoves(moves.map(m => m.to));
  }, [computeLegalMoves]);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  const attemptMove = useCallback(async (toFile: number, toRank: number) => {
    if (__DEV__) console.debug('[useBoardController] attemptMove', { selectedSquare, toFile, toRank, sideToMove, myColor, isLocalGame });
     const from = selectedSquare;
     if (!from) return;

     const fromPiece = board[from.rank]?.[from.file];
     if (!fromPiece) { clearSelection(); return; }

     // For local games, validate moves for the piece's color (player controls both sides)
     const querySide = (isLocalGame ? (fromPiece.color as Color) : sideToMove) as Color;
     const valid = isValidMove(board, { file: from.file, rank: from.rank }, { file: toFile, rank: toRank }, querySide);
     if (__DEV__) console.debug('[useBoardController] validate', { from, fromPiece, querySide, toFile, toRank, valid });
     if (!valid) { if (__DEV__) console.debug('[useBoardController] invalid move cleared'); clearSelection(); return; }

    const fromAlg = toAlgebraic(from.file, from.rank);
    const toAlg = toAlgebraic(toFile, toRank);
    const isCapture = !!board[toRank]?.[toFile];

    if (!reduceMotion && animateMovements) {
      setAnimatingPiece({ id: `${fromAlg}-${toAlg}-${Date.now()}`, piece: fromPiece as any, fromFile: from.file, fromRank: from.rank, toFile, toRank, isCapture });
    }

    if (Platform.OS !== 'web') {
      try {
        if (isCapture) await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
    }

    if (onMove) {
      try { await onMove(fromAlg, toAlg); } catch {}
    }

    clearSelection();
  }, [selectedSquare, board, isValidMove, reduceMotion, animateMovements, onMove, clearSelection, sideToMove, isLocalGame, myColor]);

  const handleSquarePress = useCallback((file: number, rank: number) => {
    if (__DEV__) console.debug('[useBoardController] handleSquarePress', { file, rank, isInteractive, isLocalGame, sideToMove, myColor, selectedSquare });
     if (!isInteractive) return;
     if (!isLocalGame && sideToMove !== myColor) return;

    // In local games allow selecting any piece (player controls both sides), otherwise restrict to player's color
    const canSelect = (sqPiece: any) => {
      if (!sqPiece) return false;
      if (isLocalGame) return true;
      return sqPiece.color === myColor;
    };

    if (!selectedSquare) {
      if (canSelect(board[rank]?.[file])) {
        selectSquare(file, rank);
      }
      return;
    }

    const tappedPiece = board[rank]?.[file];
    const selectedPiece = selectedSquare ? board[selectedSquare.rank]?.[selectedSquare.file] : null;

    // If user tapped a square with a piece:
    // - If it's the same color as the selected piece, switch selection to that piece
    // - Otherwise (opponent piece), attempt a capture/move
    if (tappedPiece) {
      const isSameColorAsSelected = selectedPiece && tappedPiece.color === selectedPiece.color;
      if (canSelect(tappedPiece) && isSameColorAsSelected) {
        selectSquare(file, rank);
        return;
      }
      // else fallthrough to attemptMove to capture
    }

    void attemptMove(file, rank);
  }, [isInteractive, isLocalGame, sideToMove, myColor, selectedSquare, board, selectSquare, attemptMove]);

  const isMyKingInCheck = isKingInCheck(board, myColor);

  return { selectedSquare, legalMoves, animatingPiece: animatingPiece, handleSquarePress, clearSelection, isMyKingInCheck } as const;
}

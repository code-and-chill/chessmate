import { useCallback, useRef } from 'react';
import { ChessJsAdapter } from '@/core/utils/chess/adapters/chessjs-adapter';
import {Board, Color} from '@/core/utils/chess';
import type { Move } from '@/core/utils/chess/types';
import {boardToFen} from "@/core/utils/chess/logic";

export function useChessEngine(initialFen?: string) {
  const adapterRef = useRef<ChessJsAdapter | null>(null);
  if (!adapterRef.current) adapterRef.current = new ChessJsAdapter(initialFen);

  const load = useCallback((fen: string) => {
    adapterRef.current?.load(fen);
  }, []);

  const getMoves = useCallback((board: Board, from: { file: number; rank: number }, sideToMove: Color = 'w'): Move[] => {
    const fen = boardToFen(board, sideToMove);
    adapterRef.current?.load(fen);
    const fromAlg = String.fromCharCode(97 + from.file) + (from.rank + 1);
    const raw = adapterRef.current?.moves(fromAlg) ?? [];
    return raw.map(m => ({
      from: { file: m.from.charCodeAt(0) - 97, rank: parseInt(m.from[1], 10) - 1 },
      to: { file: m.to.charCodeAt(0) - 97, rank: parseInt(m.to[1], 10) - 1 },
      promotion: m.promotion ?? null,
    } as Move));
  }, []);

  const isValidMove = useCallback((board: Board, from: { file: number; rank: number }, to: { file: number; rank: number }, sideToMove: Color = 'w'): boolean => {
    const fen = boardToFen(board, sideToMove);
    adapterRef.current?.load(fen);
    const fromAlg = String.fromCharCode(97 + from.file) + (from.rank + 1);
    const raw = adapterRef.current?.moves(fromAlg) ?? [];
    return raw.some(m => m.to.charCodeAt(0) - 97 === to.file && parseInt(m.to[1], 10) - 1 === to.rank);
  }, []);

  return { load, getMoves, isValidMove } as const;
}


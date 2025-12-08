import { strategy as kingStrategy } from './king';
import { strategy as queenStrategy } from './queen';
import { strategy as rookStrategy } from './rook';
import { strategy as bishopStrategy } from './bishop';
import { strategy as knightStrategy } from './knight';
import { strategy as pawnStrategy } from './pawn';

import type { MoveStrategy } from './types';

export const strategies: Record<string, MoveStrategy> = {
  K: kingStrategy,
  Q: queenStrategy,
  R: rookStrategy,
  B: bishopStrategy,
  N: knightStrategy,
  P: pawnStrategy,
};

export const getStrategyForPiece = (pieceType: string) => strategies[pieceType.toUpperCase()];

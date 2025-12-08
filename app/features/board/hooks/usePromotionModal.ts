import { useState, useCallback } from 'react';
import {fenToBoard} from "@/core/utils/chess/logic";

export interface PromotionState {
  isVisible: boolean;
  move: { from: string; to: string } | null;
}

interface PromotionActions {
  checkPromotion: (from: string, to: string, fen: string, sideToMove: 'w' | 'b') => boolean;
  showPromotion: (from: string, to: string) => void;
  hidePromotion: () => void;
}

export function usePromotionModal(): [PromotionState, PromotionActions] {
  const [promotionState, setPromotionState] = useState<PromotionState>({
    isVisible: false,
    move: null,
  });

  const checkPromotion = useCallback((
    from: string,
    to: string,
    fen: string
  ): boolean => {
    const board = fenToBoard(fen);
    const fromRank = 8 - parseInt(from[1]);
    const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0);
    const piece = board[fromRank]?.[fromFile];

    if (!piece || piece.type.toLowerCase() !== 'p') {
      return false;
    }

    const toRank = parseInt(to[1]);
    return (piece.color === 'w' && toRank === 8) || (piece.color === 'b' && toRank === 1);
  }, []);

  const showPromotion = useCallback((from: string, to: string) => {
    setPromotionState({
      isVisible: true,
      move: { from, to },
    });
  }, []);

  const hidePromotion = useCallback(() => {
    setPromotionState({
      isVisible: false,
      move: null,
    });
  }, []);

  return [promotionState, { checkPromotion, showPromotion, hidePromotion }];
}

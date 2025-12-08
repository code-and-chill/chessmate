import type { Piece as EnginePiece } from '@/core/utils/chess';

export type BoardProps = {
  fen?: string;
  orientation?: 'white' | 'black';
  onMove?: (move: string) => void;
};

export type Piece = EnginePiece;

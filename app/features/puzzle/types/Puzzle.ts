// Definition of the Puzzle type

export interface Puzzle {
  id: string;
  fen: string;
  solutionMoves: string[];
  sideToMove: 'w' | 'b';
  difficulty: string;
  themes: string[];
  rating: number;
  initialDepth: number;
}
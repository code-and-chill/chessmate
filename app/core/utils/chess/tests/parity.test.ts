import { ChessJsEngine } from '../chessjs-engine';
import { boardToFEN } from '../utils';

describe('ChessJsEngine smoke / parity harness', () => {
  const engine = new ChessJsEngine();

  const cases = [
    {
      name: 'start position e2 pawn moves',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      from: { file: 4, rank: 1 }, // e2
    },
    {
      name: 'castling availability',
      fen: 'r3k2r/pppq1ppp/2np1n2/4p3/4P3/2NP1N2/PPP2PPP/R3K2R w KQkq - 0 1',
      from: { file: 4, rank: 0 }, // e1
    },
    {
      name: 'en passant possibility',
      fen: 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 2',
      from: { file: 3, rank: 4 }, // d5 (black pawn)
    }
  ];

  for (const tc of cases) {
    test(tc.name, () => {
      engine.load(tc.fen);
      const board = engine.board();
      // ask for verbose moves from the from-square
      const file = tc.from.file;
      const rank = tc.from.rank;
      const alg = String.fromCharCode(97 + file) + (rank + 1);
      const raw = engine.moves(alg);
      // snapshot a minimal representation
      expect(raw.map(r => ({ from: r.from, to: r.to, promotion: r.promotion ?? null }))).toMatchSnapshot();

      // sanity: converting board->FEN and reloading should produce same moves
      const fenFromBoard = boardToFEN(board as any, 'w');
      engine.load(fenFromBoard);
      const raw2 = engine.moves(alg);
      expect(raw2.map(r => r.to)).toEqual(raw.map(r => r.to));
    });
  }
});


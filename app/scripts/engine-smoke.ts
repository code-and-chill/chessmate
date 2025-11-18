/*
  Minimal engine smoke tests.
  Run: pnpm -C app run engine:smoke (after adding ts-node dev dep)
*/

import { applyMoveToFENSimple, parseFENToBoard, isStalemate } from "@/core/utils";

const assert = (cond: boolean, msg: string) => {
  if (!cond) {
    console.error("❌", msg);
    process.exitCode = 1;
  } else {
    console.log("✅", msg);
  }
};

const getFenParts = (fen: string) => fen.split(" ");
const getBoardPart = (fen: string) => getFenParts(fen)[0];
const getSideToMove = (fen: string) => getFenParts(fen)[1];
const getCastling = (fen: string) => getFenParts(fen)[2];
const getEnPassant = (fen: string) => getFenParts(fen)[3];

const pieceAt = (fen: string, file: number, rank: number): string | null => {
  const board = getBoardPart(fen).split("/");
  const row = board[7 - rank];
  let fileIdx = 0;
  for (const ch of row) {
    if (/\d/.test(ch)) {
      fileIdx += parseInt(ch, 10);
    } else {
      if (fileIdx === file) return ch;
      fileIdx++;
    }
  }
  return null;
};

(async () => {
  // 1) Basic non-stalemate after first move
  let fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  fen = applyMoveToFENSimple(fen, "e2e4");
  const board = parseFENToBoard(fen);
  assert(!isStalemate(board, "b"), "Black is not stalemated after e2e4");
  assert(getSideToMove(fen) === "b", "Side to move flips to black");
  assert(getEnPassant(fen) === "e3", "En passant target set to e3 after e2e4");

  // 2) Castling rook movement and rights removal (set a clear board with full rights)
  let castleFen = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
  castleFen = applyMoveToFENSimple(castleFen, "e1g1"); // White castles short
  assert(pieceAt(castleFen, 6, 0) === "K", "White king on g1 after O-O");
  assert(pieceAt(castleFen, 5, 0) === "R", "White rook on f1 after O-O");
  assert(!getCastling(castleFen).includes("K") && !getCastling(castleFen).includes("Q"), "White castling rights removed after king move");

  // 3) En passant capture sequence
  let epFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  epFen = applyMoveToFENSimple(epFen, "e2e4"); // set e3
  epFen = applyMoveToFENSimple(epFen, "d7d5"); // set d6
  epFen = applyMoveToFENSimple(epFen, "e4e5"); // clear en passant
  epFen = applyMoveToFENSimple(epFen, "f7f5"); // set f6
  epFen = applyMoveToFENSimple(epFen, "e5f6"); // en passant capture on f6
  assert(pieceAt(epFen, 5, 5)?.toUpperCase() === "P", "White pawn on f6 after en passant");
  assert(pieceAt(epFen, 5, 4) === null, "Captured black pawn removed from f5 after en passant");

  // 4) Promotion (force simple path)
  let promoFen = "8/P7/8/8/8/8/7p/4K2k w - - 0 1";
  promoFen = applyMoveToFENSimple(promoFen, "a7a8q");
  assert(pieceAt(promoFen, 0, 7) === "Q", "White pawn promoted to Queen on a8");

  console.log("\nSmoke tests finished with", process.exitCode === 1 ? "errors" : "success");
})();

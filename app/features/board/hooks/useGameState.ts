import { useState, useCallback, useRef } from 'react';
import { ChessJsAdapter } from '@/core/utils/chess/adapters/chessjs-adapter';
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
   // draw offer state (simple local model)
   offerPending?: boolean;
   offerFrom?: string | null;
 }

 interface GameStateActions {
   makeMove: (from: string, to: string, promotion?: string) => void;
   endGame: (result: GameResult, reason: string) => void;
   resetGame: () => void;
   // draw offer actions
   offerDraw: () => void;
   acceptDraw: () => void;
   declineDraw: () => void;
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

 export function useGameState(initial?: Partial<GameState> | null): [GameState, GameStateActions] {
     const [chess] = useState(() => new ChessJsAdapter(initial?.fen));

     const normalizeInitial = (init?: Partial<GameState> | null): GameState => {
       const base = createInitialState();
       if (!init) return base;

       // Merge known fields conservatively
       const merged: GameState = {
         ...base,
         ...('status' in init ? { status: (init as any).status as GameStatus } : {}),
         players: (init.players && init.players.length > 0) ? init.players : base.players,
         moves: (init.moves && Array.isArray(init.moves)) ? (init.moves as any) : base.moves,
         fen: typeof init.fen === 'string' ? init.fen : base.fen,
         // Accept both 'w'|'b' and 'white'|'black' from external sources
         sideToMove: ((): PieceColor => {
           const s = (init.sideToMove as any) ?? null;
           if (s === 'w' || s === 'b') return s;
           if (s === 'white') return 'w';
           if (s === 'black') return 'b';
           return base.sideToMove;
         })(),
         endReason: init.endReason ?? base.endReason,
         result: init.result ?? base.result,
         lastMove: init.lastMove ?? base.lastMove,
         capturedByWhite: init.capturedByWhite ?? base.capturedByWhite,
         capturedByBlack: init.capturedByBlack ?? base.capturedByBlack,
         offerPending: init.offerPending,
         offerFrom: init.offerFrom ?? base.offerFrom,
         // preserve local/offline flags if present so UI can adapt
         // Note: extend GameState interface if you expect mode/isLocal elsewhere
         ...(init as any).mode ? { mode: (init as any).mode } : {},
         ...(typeof (init as any).isLocal !== 'undefined') ? { isLocal: (init as any).isLocal } : {},
       };

       return merged;
     };

     const [gameState, setGameState] = useState<GameState>(() => normalizeInitial(initial ?? null));
     const offerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
       offerPending: false,
       offerFrom: null,
     }));
     if (offerTimerRef.current) {
       clearTimeout(offerTimerRef.current);
       offerTimerRef.current = null;
     }
   }, []);

   const offerDraw = useCallback(() => {
     setGameState((prev) => {
       if (prev.offerPending) return prev;
       return { ...prev, offerPending: true, offerFrom: prev.players[0] ?? 'Player' };
     });

     // Simulate opponent acceptance after 3s for now
     if (offerTimerRef.current) {
       clearTimeout(offerTimerRef.current);
     }
     offerTimerRef.current = setTimeout(() => {
       // accept draw
       setGameState((prev) => ({
         ...prev,
         status: 'ended',
         result: '1/2-1/2',
         endReason: 'Draw agreed',
         offerPending: false,
         offerFrom: null,
       }));
       offerTimerRef.current = null;
     }, 3000);
   }, []);

   const acceptDraw = useCallback(() => {
     if (offerTimerRef.current) {
       clearTimeout(offerTimerRef.current);
       offerTimerRef.current = null;
     }
     setGameState((prev) => ({
       ...prev,
       status: 'ended',
       result: '1/2-1/2',
       endReason: 'Draw agreed',
       offerPending: false,
       offerFrom: null,
     }));
   }, []);

   const declineDraw = useCallback(() => {
     if (offerTimerRef.current) {
       clearTimeout(offerTimerRef.current);
       offerTimerRef.current = null;
     }
     setGameState((prev) => ({ ...prev, offerPending: false, offerFrom: null }));
   }, []);

   const resetGame = useCallback(() => {
     chess.reset();
     if (offerTimerRef.current) {
       clearTimeout(offerTimerRef.current);
       offerTimerRef.current = null;
     }
     setGameState(createInitialState());
   }, [chess]);

   return [gameState, { makeMove, endGame, resetGame, offerDraw, acceptDraw, declineDraw }];
 }

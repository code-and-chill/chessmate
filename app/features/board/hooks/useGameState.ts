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
   // bot game state
   botId?: string;
   botColor?: PieceColor;
   isBotGame?: boolean;
 }

 interface GameStateActions {
   makeMove: (from: string, to: string, promotion?: string) => void;
   endGame: (result: GameResult, reason: string) => void;
   resetGame: () => void;
   updateFromApi: (apiGame: any) => void; // Update state from API response
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
         // bot game fields
         botId: (init as any).botId ?? (init as any).bot_id,
         botColor: (init as any).botColor ?? (init as any).bot_color,
         isBotGame: (init as any).isBotGame ?? (init as any).is_bot_game ?? (!!((init as any).botId || (init as any).bot_id)),
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

   const updateFromApi = useCallback((apiGame: any) => {
     // Map API response to game state format
     const apiMoves = (apiGame.moves ?? []).map((m: any) => ({
       moveNumber: m.move_number ?? m.moveNumber ?? 0,
       color: (m.color === 'w' || m.color === 'white' ? 'w' : 'b') as PieceColor,
       san: m.san ?? '',
     }));

     // Update chess instance with new FEN
     if (apiGame.fen) {
       try {
         chess.load(apiGame.fen);
         // Recalculate captured pieces from history
         const history = chess.history({ verbose: true });
         const captured = extractCapturedPieces(history);
         
         // Extract last move from moves array if available
         let lastMove: { from: string; to: string } | null = null;
         if (apiGame.moves && apiGame.moves.length > 0) {
           const lastMoveData = apiGame.moves[apiGame.moves.length - 1];
           if (lastMoveData?.from_square && lastMoveData?.to_square) {
             lastMove = {
               from: lastMoveData.from_square,
               to: lastMoveData.to_square,
             };
           }
         }

        setGameState((prev) => ({
          ...prev,
          fen: apiGame.fen ?? prev.fen,
          moves: apiMoves,
          sideToMove: ((apiGame.sideToMove ?? apiGame.side_to_move) === 'w' ? 'w' : 'b') as PieceColor,
          status: ((apiGame.status ?? prev.status) === 'ended' ? 'ended' : 'in_progress') as GameStatus,
          result: apiGame.result ?? prev.result,
          endReason: apiGame.endReason ?? apiGame.end_reason ?? prev.endReason,
          botId: apiGame.botId ?? apiGame.bot_id ?? prev.botId,
          botColor: ((apiGame.botColor ?? apiGame.bot_color) as PieceColor | undefined) ?? prev.botColor,
          isBotGame: (apiGame.botId ?? apiGame.bot_id) != null ? true : prev.isBotGame,
          lastMove: lastMove ?? prev.lastMove,
          capturedByWhite: captured.white,
          capturedByBlack: captured.black,
        }));
       } catch (e) {
         console.warn('Failed to update chess instance:', e);
       }
     }
   }, [chess, extractCapturedPieces]);

   return [gameState, { makeMove, endGame, resetGame, updateFromApi, offerDraw, acceptDraw, declineDraw }];
 }

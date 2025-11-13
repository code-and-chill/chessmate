export type Color = 'w' | 'b';
export type GameStatus = 'waiting_for_opponent' | 'in_progress' | 'ended';
export interface TimeControl {
    initialSeconds: number;
    incrementSeconds: number;
}
export interface Move {
    ply: number;
    moveNumber: number;
    color: Color;
    from: string;
    to: string;
    promotion?: string;
    san: string;
    playedAt: string;
    elapsedMs: number;
}
export interface GameState {
    id: string;
    status: GameStatus;
    rated: boolean;
    variantCode: string;
    white: {
        accountId: string;
        remainingMs: number;
    };
    black: {
        accountId: string;
        remainingMs: number;
    };
    sideToMove: Color;
    fen: string;
    moves: Move[];
    result: '1-0' | '0-1' | '1/2-1/2' | null;
    endReason: string | null;
    createdAt: string;
    startedAt?: string;
    endedAt?: string;
}
//# sourceMappingURL=game.d.ts.map
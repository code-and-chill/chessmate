import { GameState } from '../models/game';
export interface UseGameReturn {
    game: GameState | null;
    loading: boolean;
    error: Error | null;
    makeMove(from: string, to: string, promotion?: string): Promise<void>;
    resign(): Promise<void>;
    refresh(): Promise<void>;
}
export declare const useGame: (gameId: string, token: string, baseUrl?: string, pollInterval?: number) => UseGameReturn;
//# sourceMappingURL=useGame.d.ts.map
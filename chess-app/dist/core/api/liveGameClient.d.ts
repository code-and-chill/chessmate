/**
 * Live game API client - handles communication with live-game-api.
 */
import { GameState } from '../models/game';
export declare class LiveGameApiClient {
    private baseUrl;
    private token;
    constructor(baseUrl: string, token: string);
    private request;
    /**
     * Fetch current game state
     */
    getGame(gameId: string): Promise<GameState>;
    /**
     * Submit a move
     */
    makeMove(gameId: string, from: string, to: string, promotion?: string): Promise<GameState>;
    /**
     * Resign from the game
     */
    resign(gameId: string): Promise<GameState>;
}
//# sourceMappingURL=liveGameClient.d.ts.map
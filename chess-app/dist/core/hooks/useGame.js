// useGame hook - manages game state and interactions.
// Responsibilities:
// - Poll GET /v1/games/{game_id} from live-game-api
// - Expose current GameState
// - Provide actions: makeMove, resign, refresh
import { useState, useEffect, useCallback } from 'react';
import { LiveGameApiClient } from '../api/liveGameClient';
// Hook for managing live game state and interactions.
// @param gameId - The ID of the game to load
// @param token - Authentication token (typically from useAuth hook)
// @param baseUrl - Base URL for live-game-api (default: http://localhost:8001)
// @param pollInterval - Polling interval in ms (default: 1000)
export const useGame = (gameId, token, baseUrl = 'http://localhost:8001', pollInterval = 1000) => {
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const client = new LiveGameApiClient(baseUrl, token);
    // Fetch and update game state
    const refresh = useCallback(async () => {
        try {
            setError(null);
            const gameState = await client.getGame(gameId);
            setGame(gameState);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
            setLoading(false);
        }
    }, [gameId, client]);
    // Make a move
    const makeMove = useCallback(async (from, to, promotion) => {
        try {
            setError(null);
            const updatedGame = await client.makeMove(gameId, from, to, promotion);
            setGame(updatedGame);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
    }, [gameId, client]);
    // Resign from the game
    const resign = useCallback(async () => {
        try {
            setError(null);
            const updatedGame = await client.resign(gameId);
            setGame(updatedGame);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
    }, [gameId, client]);
    // Initial load and polling
    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, pollInterval);
        return () => clearInterval(interval);
    }, [refresh, pollInterval]);
    return {
        game,
        loading,
        error,
        makeMove,
        resign,
        refresh,
    };
};
//# sourceMappingURL=useGame.js.map
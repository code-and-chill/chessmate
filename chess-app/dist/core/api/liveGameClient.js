/**
 * Live game API client - handles communication with live-game-api.
 */
export class LiveGameApiClient {
    constructor(baseUrl, token) {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "token", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.baseUrl = baseUrl;
        this.token = token;
    }
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.token}`,
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Fetch current game state
     */
    async getGame(gameId) {
        return this.request('GET', `/v1/games/${gameId}`);
    }
    /**
     * Submit a move
     */
    async makeMove(gameId, from, to, promotion) {
        return this.request('POST', `/v1/games/${gameId}/moves`, {
            from,
            to,
            promotion,
        });
    }
    /**
     * Resign from the game
     */
    async resign(gameId) {
        return this.request('POST', `/v1/games/${gameId}/resign`, {});
    }
}
//# sourceMappingURL=liveGameClient.js.map
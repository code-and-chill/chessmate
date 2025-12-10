import { PuzzleApiClient } from '../puzzle.api';

describe('PuzzleApiClient', () => {
  const origFetch = global.fetch;
  const baseUrl = 'http://localhost:8000';
  let client: PuzzleApiClient;

  beforeEach(() => {
    client = new PuzzleApiClient(baseUrl);
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch = origFetch;
    jest.resetAllMocks();
  });

  it('parses JSON response and returns result', async () => {
    const payload = { id: 'p1', problem: { fen: 'fen-data' } };
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(payload),
    });

    const res = await client.getRandomPuzzle();
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(res.result).toEqual(payload);
  });

  it('handles empty body responses gracefully', async () => {
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({ ok: true, status: 200, text: async () => '' });

    const res = await client.getRandomPuzzle();
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(res.result).toBeUndefined();
  });

  it('handles 429 rate limit responses and extracts rateLimit', async () => {
    const body = { error: 'rate limited', rate_limit: { remaining: 0, resetAt: '2025-12-10T00:00:00Z' } };
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests', text: async () => JSON.stringify(body) });

    const res = await client.getRandomPuzzle();
    expect(res.ok).toBe(false);
    expect(res.status).toBe(429);
    expect(res.error).toBe('rate limited');
    expect(res.rateLimit).toEqual(body.rate_limit);
  });

  it('sends correct payload for submitAttempt', async () => {
    const attempt = {
      isDaily: false,
      movesPlayed: ['e2e4', 'e7e5'],
      status: 'IN_PROGRESS' as const,
      timeSpentMs: 1000,
      hintsUsed: 0,
    };

    // Capture the fetch call and return success
    // @ts-ignore
    global.fetch.mockImplementationOnce(async (url: string, options: any) => {
      expect(url).toBe(`${baseUrl}/api/v1/puzzles/${encodeURIComponent('p123')}/attempt`);
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body).toEqual({
        is_daily: attempt.isDaily,
        moves_played: attempt.movesPlayed,
        status: attempt.status,
        time_spent_ms: attempt.timeSpentMs,
        hints_used: attempt.hintsUsed,
      });
      return { ok: true, status: 200, text: async () => JSON.stringify({ id: 'att1', puzzleId: 'p123', ratingChange: 0, status: 'IN_PROGRESS' }) };
    });

    const res = await client.submitAttempt('p123', attempt);
    expect(res.ok).toBe(true);
    expect(res.result).toBeDefined();
    expect(res.result?.puzzleId).toBe('p123');
  });
});

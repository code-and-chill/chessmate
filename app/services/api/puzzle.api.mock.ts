import { delay } from './mock-data';
import type { IPuzzleApiClient } from './puzzle.api';
import type { ApiEnvelope, Puzzle, PuzzleAttempt, PuzzleAttemptResponse } from '@/types/puzzle';

export class MockPuzzleApiClient implements IPuzzleApiClient {
  async getRandomPuzzle(): Promise<ApiEnvelope<Puzzle>> {
    await delay(100);
    return {
      ok: true,
      status: 200,
      result: {
        id: 'p_random_1',
        problem: {
          fen: 'r1bq1rk1/ppp2ppp/2n2n2/2b1p3/4P3/2N2N2/PPPP1PPP/R1BQ1RK1 w - - 0 1',
          side_to_move: 'w',
          show_player_section: false,
        },
        fen: 'r1bqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        difficulty: 'easy',
        themes: ['tactics'],
      },
    } as ApiEnvelope<Puzzle>;
  }

  async submitAttempt(_puzzleId: string, _attempt: PuzzleAttempt): Promise<ApiEnvelope<PuzzleAttemptResponse>> {
    await delay(50);
    return { ok: true, status: 200, result: { id: `att_${Date.now()}`, puzzleId: _puzzleId, ratingChange: 0, status: 'IN_PROGRESS' } } as ApiEnvelope<PuzzleAttemptResponse>;
  }

  async getDailyPuzzle(_userId?: string): Promise<ApiEnvelope<Puzzle>> {
    await delay(80);
    return { ok: true, status: 200, result: { id: 'p_daily_1', problem: { fen: 'r2q1rk1/pp3ppp/2n1pn2/2bp4/2B1P3/2N2N2/PPPQ1PPP/R3K2R w KQ - 0 1', side_to_move: 'w' }, fen: 'r2q1rk1/pp3ppp/2n1pn2/2bp4/2B1P3/2N2N2/PPPQ1PPP/R3K2R w KQ - 0 1', difficulty: 'medium', themes: ['endgame'], rating: 1400, initialDepth: 3 } } as ApiEnvelope<Puzzle>;
  }

  async getPuzzle(puzzleId: string): Promise<ApiEnvelope<Puzzle>> {
    await delay(60);
    return { ok: true, status: 200, result: { id: puzzleId, problem: { fen: '2r3k1/1b3ppp/p1n1p3/1p1p4/3P4/1P3N2/PB3PPP/3R2K1 w - - 0 1', side_to_move: 'w' }, fen: '2r3k1/1b3ppp/p1n1p3/1p1p4/3P4/1P3N2/PB3PPP/3R2K1 w - - 0 1', difficulty: 'easy', themes: ['tactics'], rating: 1250, initialDepth: 2 } } as ApiEnvelope<Puzzle>;
  }

  async getPuzzlesByTheme(theme: string, limit: number = 10): Promise<ApiEnvelope<Puzzle[]>> {
    await delay(80);
    const results: Puzzle[] = [];
    for (let i = 0; i < limit; i++) {
      results.push({ id: `p_theme_${theme}_${i}`, problem: { fen: '2r3k1/1b3ppp/p1n1p3/1p1p4/3P4/1P3N2/PB3PPP/3R2K1 w - - 0 1', side_to_move: 'w' }, fen: '2r3k1/1b3ppp/p1n1p3/1p1p4/3P4/1P3N2/PB3PPP/3R2K1 w - - 0 1', difficulty: 'easy', themes: [theme], rating: 1200 + i, initialDepth: 1 });
    }
    return { ok: true, status: 200, result: results } as ApiEnvelope<Puzzle[]>;
  }

  async getUserHistory(_userId: string, limit: number = 10, offset: number = 0): Promise<ApiEnvelope<any>> {
    await delay(50);
    return { ok: true, status: 200, result: [ { puzzle_id: 'p1', status: 'SUCCESS', time_spent_ms: 12000, hints_used: 0, created_at: new Date().toISOString() } ] } as ApiEnvelope<any>;
  }

  // Implement missing getUserStats to satisfy IPuzzleApiClient
  async getUserStats(_userId: string): Promise<ApiEnvelope<any>> {
    await delay(40);
    return { ok: true, status: 200, result: { totalAttempts: 0, successfulAttempts: 0, currentStreak: 0, longestStreak: 0, averageRating: 1200 } } as ApiEnvelope<any>;
  }
}

/**
 * Mock Engine API Client
 * Provides realistic mock evaluations for development and testing
 */

import type {
  Candidate,
  EvaluatePositionRequest,
  EvaluatePositionResponse,
  HealthResponse,
  IEngineApiClient,
} from './engine.api';

/**
 * Generate mock candidates based on position type
 */
function generateMockCandidates(
  fen: string,
  sideToMove: 'w' | 'b',
  multiPv: number
): Candidate[] {
  // Detect position type from FEN
  const pieceCount = (fen.match(/[rnbqkpRNBQKP]/g) || []).length;
  const isOpening = pieceCount >= 30;
  const isEndgame = pieceCount <= 10;

  // Generate plausible mock moves
  const candidates: Candidate[] = [];
  const commonMoves = isOpening
    ? ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3']
    : isEndgame
    ? ['e4e5', 'd4d5', 'f3f4', 'c4c5', 'a4a5']
    : ['e4e5', 'd4d5', 'f4f5', 'c4c5', 'b4b5'];

  // Adjust for side to move
  const moves = sideToMove === 'b' 
    ? commonMoves.map(m => {
        // Flip move for black (simplified)
        const from = m.substring(0, 2);
        const to = m.substring(2, 4);
        const fromRank = parseInt(from[1]);
        const toRank = parseInt(to[1]);
        return `${from[0]}${9 - fromRank}${to[0]}${9 - toRank}`;
      })
    : commonMoves;

  for (let i = 0; i < Math.min(multiPv, moves.length); i++) {
    const evalValue = isOpening
      ? 0.20 - i * 0.05 // Opening: small advantages
      : isEndgame
      ? 0.50 - i * 0.15 // Endgame: larger swings
      : 0.30 - i * 0.08; // Middlegame: medium advantages

    candidates.push({
      move: moves[i] || `a${i + 1}a${i + 2}`,
      eval: Math.round(evalValue * 100) / 100,
      depth: 12 - i,
      pv: [moves[i] || `a${i + 1}a${i + 2}`, moves[i + 1] || `b${i + 1}b${i + 2}`],
    });
  }

  return candidates;
}

/**
 * Simulate analysis latency
 */
function simulateLatency(timeLimitMs: number): Promise<void> {
  const delay = Math.min(timeLimitMs, 200); // Cap at 200ms for mocks
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Mock Engine API Client
 */
export class MockEngineApiClient implements IEngineApiClient {
  /**
   * Evaluate a chess position (mock)
   */
  async evaluatePosition(
    request: EvaluatePositionRequest
  ): Promise<EvaluatePositionResponse> {
    // Simulate network latency
    await simulateLatency(request.time_limit_ms ?? 1000);

    const candidates = generateMockCandidates(
      request.fen,
      request.side_to_move,
      request.multi_pv ?? 1
    );

    return {
      candidates,
      fen: request.fen,
      time_ms: Math.min(request.time_limit_ms ?? 1000, 200),
    };
  }

  /**
   * Health check (mock)
   */
  async healthCheck(): Promise<HealthResponse> {
    return {
      status: 'ok',
      service: 'engine-cluster-api',
    };
  }
}

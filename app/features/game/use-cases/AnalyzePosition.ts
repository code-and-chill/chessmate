import type { IEngineRepository } from '../../board/repositories/IEngineRepository';
import type {
  EvaluatePositionRequest,
  EvaluatePositionResponse,
} from '@/services/api';

export interface AnalyzePositionParams {
  fen: string;
  sideToMove: 'w' | 'b';
  maxDepth?: number;
  timeLimitMs?: number;
  multiPv?: number;
}

export class AnalyzePositionError extends Error {
  constructor(message: string = 'Failed to analyze position') {
    super(message);
    this.name = 'AnalyzePositionError';
  }
}

/**
 * AnalyzePosition Use Case
 * 
 * Analyzes a chess position using the engine.
 * 
 * Business rules:
 * - FEN must be valid
 * - Analysis parameters must be within limits
 */
export class AnalyzePositionUseCase {
  constructor(private engineRepository: IEngineRepository) {}

  async execute(params: AnalyzePositionParams): Promise<EvaluatePositionResponse> {
    try {
      const request: EvaluatePositionRequest = {
        fen: params.fen,
        side_to_move: params.sideToMove,
        max_depth: params.maxDepth ?? 12,
        time_limit_ms: params.timeLimitMs ?? 1000,
        multi_pv: params.multiPv ?? 1,
      };

      return await this.engineRepository.evaluatePosition(request);
    } catch (error) {
      throw new AnalyzePositionError(
        error instanceof Error ? error.message : 'Failed to analyze position'
      );
    }
  }
}

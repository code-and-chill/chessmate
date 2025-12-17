import type {
  EvaluatePositionRequest,
  EvaluatePositionResponse,
  HealthResponse,
} from '@/services/api';

export interface IEngineRepository {
  /**
   * Evaluate a chess position and return candidate moves with evaluations
   */
  evaluatePosition(request: EvaluatePositionRequest): Promise<EvaluatePositionResponse>;

  /**
   * Health check endpoint
   */
  healthCheck(): Promise<HealthResponse>;
}

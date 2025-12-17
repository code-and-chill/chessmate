import type { IEngineApiClient } from '@/services/api';
import type { IEngineRepository } from './IEngineRepository';
import type {
  EvaluatePositionRequest,
  EvaluatePositionResponse,
  HealthResponse,
} from '@/services/api';

/**
 * Engine Repository Implementation
 * 
 * Wraps IEngineApiClient to provide repository abstraction.
 */
export class EngineRepository implements IEngineRepository {
  constructor(private apiClient: IEngineApiClient) {}

  async evaluatePosition(
    request: EvaluatePositionRequest
  ): Promise<EvaluatePositionResponse> {
    return this.apiClient.evaluatePosition(request);
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.apiClient.healthCheck();
  }
}

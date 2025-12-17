/**
 * Engine API Client
 * Communicates with engine-cluster-api for chess position evaluation
 */

/**
 * Candidate move from engine analysis
 */
export interface Candidate {
  /** Move in UCI notation (e.g., "e2e4") */
  move: string;
  /** Evaluation in pawns from side-to-move perspective */
  eval: number;
  /** Depth reached for this candidate */
  depth: number;
  /** Principal variation (line of moves) - optional */
  pv?: string[];
}

/**
 * Request to evaluate a chess position
 */
export interface EvaluatePositionRequest {
  /** Position in FEN notation */
  fen: string;
  /** Side to move: "w" for white, "b" for black */
  side_to_move: 'w' | 'b';
  /** Maximum search depth (1-30, default: 12) */
  max_depth?: number;
  /** Time limit in milliseconds (10-30000, default: 1000) */
  time_limit_ms?: number;
  /** Number of principal variations (1-10, default: 1) */
  multi_pv?: number;
}

/**
 * Response from position evaluation
 */
export interface EvaluatePositionResponse {
  /** List of candidate moves with evaluations */
  candidates: Candidate[];
  /** Echo of input FEN */
  fen: string;
  /** Analysis time in milliseconds */
  time_ms: number;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: string;
  service: string;
}

/**
 * Engine API Client Interface
 */
export interface IEngineApiClient {
  /**
   * Evaluate a chess position and return candidate moves with evaluations
   */
  evaluatePosition(request: EvaluatePositionRequest): Promise<EvaluatePositionResponse>;

  /**
   * Health check endpoint
   */
  healthCheck(): Promise<HealthResponse>;
}

/**
 * Engine API Client Implementation
 * Connects to engine-cluster-api for Stockfish-based position evaluation
 */
export class EngineApiClient implements IEngineApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:9000') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Internal request method
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(
        `Engine API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  /**
   * Evaluate a chess position
   */
  async evaluatePosition(
    request: EvaluatePositionRequest
  ): Promise<EvaluatePositionResponse> {
    // Set defaults matching backend
    const payload: EvaluatePositionRequest = {
      fen: request.fen,
      side_to_move: request.side_to_move,
      max_depth: request.max_depth ?? 12,
      time_limit_ms: request.time_limit_ms ?? 1000,
      multi_pv: request.multi_pv ?? 1,
    };

    return this.request<EvaluatePositionResponse>('POST', '/v1/evaluate', payload);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('GET', '/health');
  }
}

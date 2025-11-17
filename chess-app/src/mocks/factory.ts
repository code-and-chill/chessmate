/**
 * Mock API Client Factory
 * Manages creation and configuration of mock vs. real API clients
 * Allows runtime switching for testing scenarios
 */

import type { PuzzleApiClient } from '../api/puzzleApi';
import type { LiveGameApiClient } from '../api/liveGameClient';
import type { PlayApiClient } from '../api/playApi';
import { PuzzleApiClient as RealPuzzleApiClient } from '../api/puzzleApi';
import { LiveGameApiClient as RealLiveGameApiClient } from '../api/liveGameClient';
import { PlayApiClient as RealPlayApiClient } from '../api/playApi';
import { MockPuzzleApiClient } from './MockPuzzleApiClient';
import { MockLiveGameApiClient } from './MockLiveGameApiClient';
import { MockPlayApiClient } from './MockPlayApiClient';

/**
 * Mock configuration options
 */
export interface MockConfig {
  enabled: boolean;
  simulateDelay: number;
  simulateErrors: boolean;
  errorRate: number;
}

/**
 * Default mock configuration
 */
const DEFAULT_MOCK_CONFIG: MockConfig = {
  enabled: false,
  simulateDelay: 500,
  simulateErrors: false,
  errorRate: 0.1,
};

/**
 * Global mock configuration
 */
let mockConfig: MockConfig = { ...DEFAULT_MOCK_CONFIG };

/**
 * Get current mock configuration
 */
export const getMockConfig = (): MockConfig => ({ ...mockConfig });

/**
 * Update mock configuration
 */
export const setMockConfig = (config: Partial<MockConfig>): void => {
  mockConfig = { ...mockConfig, ...config };
};

/**
 * Enable mock mode
 */
export const enableMockMode = (): void => {
  setMockConfig({ enabled: true });
  console.log('[Mock Mode] Enabled - Using offline mock data');
};

/**
 * Disable mock mode
 */
export const disableMockMode = (): void => {
  setMockConfig({ enabled: false });
  console.log('[Mock Mode] Disabled - Using real API endpoints');
};

/**
 * Toggle mock mode
 */
export const toggleMockMode = (): boolean => {
  const newState = !mockConfig.enabled;
  setMockConfig({ enabled: newState });
  console.log(
    `[Mock Mode] ${newState ? 'Enabled' : 'Disabled'}`
  );
  return newState;
};

/**
 * Create Puzzle API client (mock or real)
 */
export const createPuzzleApiClient = (
  baseUrl: string = 'http://localhost:8000',
  overrideMock?: boolean
): PuzzleApiClient => {
  const useMock =
    overrideMock !== undefined ? overrideMock : mockConfig.enabled;

  if (useMock) {
    console.log('[PuzzleApiClient] Using mock client');
    return new MockPuzzleApiClient(baseUrl, mockConfig.simulateDelay);
  }

  console.log('[PuzzleApiClient] Using real client');
  return new RealPuzzleApiClient(baseUrl);
};

/**
 * Create Live Game API client (mock or real)
 */
export const createLiveGameApiClient = (
  baseUrl: string = 'http://localhost:8000',
  token: string = '',
  overrideMock?: boolean
): LiveGameApiClient => {
  const useMock =
    overrideMock !== undefined ? overrideMock : mockConfig.enabled;

  if (useMock) {
    console.log('[LiveGameApiClient] Using mock client');
    return new MockLiveGameApiClient(baseUrl, token, mockConfig.simulateDelay);
  }

  console.log('[LiveGameApiClient] Using real client');
  return new RealLiveGameApiClient(baseUrl, token);
};

/**
 * Create Play API client (mock or real)
 */
export const createPlayApiClient = (
  baseUrl: string = 'http://localhost:8000',
  token: string = '',
  overrideMock?: boolean
): PlayApiClient => {
  const useMock =
    overrideMock !== undefined ? overrideMock : mockConfig.enabled;

  if (useMock) {
    console.log('[PlayApiClient] Using mock client');
    return new MockPlayApiClient(baseUrl, token, mockConfig.simulateDelay);
  }

  console.log('[PlayApiClient] Using real client');
  return new RealPlayApiClient(baseUrl, token);
};

/**
 * Create all API clients at once
 */
export const createAllApiClients = (
  baseUrl: string = 'http://localhost:8000',
  token: string = '',
  overrideMock?: boolean
) => ({
  puzzleApi: createPuzzleApiClient(baseUrl, overrideMock),
  liveGameApi: createLiveGameApiClient(baseUrl, token, overrideMock),
  playApi: createPlayApiClient(baseUrl, token, overrideMock),
});

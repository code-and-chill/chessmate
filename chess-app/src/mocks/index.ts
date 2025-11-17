/**
 * Mock System Exports
 * Entry point for mock API infrastructure
 */

export { MockPuzzleApiClient } from './MockPuzzleApiClient';
export { MockLiveGameApiClient } from './MockLiveGameApiClient';
export { MockPlayApiClient } from './MockPlayApiClient';

export {
  enableMockMode,
  disableMockMode,
  toggleMockMode,
  getMockConfig,
  setMockConfig,
  createPuzzleApiClient,
  createLiveGameApiClient,
  createPlayApiClient,
  createAllApiClients,
  type MockConfig,
} from './factory';

export {
  generateMockPuzzle,
  generateMockDailyPuzzle,
  generateMockGame,
  generateMockGameState,
  generateMockGames,
  generateMockGameStates,
  generateMockPuzzleAttemptResponse,
  generateMockUserStats,
  generateMockUserHistory,
  generateCompletedGames,
} from './mockData';

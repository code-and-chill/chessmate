/**
 * Example: Using Mocks in your App
 * This file demonstrates practical integration patterns for the mock system
 */

// ============================================================================
// EXAMPLE 1: Enable mocks globally in your app entry point
// ============================================================================

// import { enableMockMode } from '@/mocks';
//
// export const initializeApp = () => {
//   // Enable mocks for development
//   if (__DEV__) {
//     enableMockMode();
//     console.log('App initialized with mock APIs');
//   }
// };

// ============================================================================
// EXAMPLE 2: Create API clients with hook
// ============================================================================

// import { useEffect, useState } from 'react';
// import { createAllApiClients } from '@/mocks';
//
// export const useApiClients = () => {
//   const [clients, setClients] = useState<any>(null);
//
//   useEffect(() => {
//     const allClients = createAllApiClients();
//     setClients(allClients);
//   }, []);
//
//   return clients;
// };

// ============================================================================
// EXAMPLE 3: Use in Puzzle Screen
// ============================================================================

// import { View, Text, Button } from 'react-native';
//
// export const PuzzleScreen = () => {
//   const [puzzle, setPuzzle] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const clients = useApiClients();
//
//   const loadDailyPuzzle = async () => {
//     if (!clients) return;
//     setLoading(true);
//     try {
//       const dailyPuzzle = await clients.puzzleApi.getDailyPuzzle();
//       setPuzzle(dailyPuzzle);
//     } catch (error) {
//       console.error('Failed to load puzzle:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   useEffect(() => {
//     loadDailyPuzzle();
//   }, [clients]);
//
//   if (!puzzle) {
//     return <Text>{loading ? 'Loading...' : 'Failed to load'}</Text>;
//   }
//
//   return (
//     <View>
//       <Text>Puzzle ID: {puzzle.id}</Text>
//       <Text>Rating: {puzzle.rating}</Text>
//       <Button title="Next Puzzle" onPress={loadDailyPuzzle} />
//     </View>
//   );
// };

// ============================================================================
// EXAMPLE 4: Live Game Flow
// ============================================================================

// import { useState } from 'react';
//
// export const LiveGameScreen = ({ gameId }: { gameId: string }) => {
//   const [gameState, setGameState] = useState(null);
//   const clients = useApiClients();
//
//   const loadGame = async () => {
//     if (!clients) return;
//     try {
//       const state = await clients.liveGameApi.getGame(gameId);
//       setGameState(state);
//     } catch (error) {
//       console.error('Failed to load game:', error);
//     }
//   };
//
//   const handleMove = async () => {
//     if (!clients) return;
//     try {
//       const updatedState = await clients.liveGameApi.makeMove(gameId);
//       setGameState(updatedState);
//     } catch (error) {
//       console.error('Move failed:', error);
//     }
//   };
//
//   useEffect(() => {
//     loadGame();
//   }, [gameId, clients]);
//
//   return (
//     <View>
//       {gameState && (
//         <>
//           <Text>Turn: {gameState.turn}</Text>
//           <Text>Status: {gameState.status}</Text>
//           <Button title="Make Move" onPress={handleMove} />
//         </>
//       )}
//     </View>
//   );
// };

// ============================================================================
// EXAMPLE 5: Settings Screen with Mock Toggle
// ============================================================================

// import { toggleMockMode, getMockConfig, setMockConfig } from '@/mocks';
// import { useState } from 'react';
//
// export const SettingsScreen = () => {
//   const [mockConfig, setLocalConfig] = useState(getMockConfig());
//
//   const handleToggleMocks = () => {
//     const newState = toggleMockMode();
//     setLocalConfig(getMockConfig());
//   };
//
//   const handleUpdateDelay = (delay: number) => {
//     setMockConfig({ simulateDelay: delay });
//     setLocalConfig(getMockConfig());
//   };
//
//   return (
//     <View>
//       <Text>Mock Mode: {mockConfig.enabled ? 'ON' : 'OFF'}</Text>
//       <Button title="Toggle Mocks" onPress={handleToggleMocks} />
//
//       <Text>Simulated Network Delay</Text>
//       <Button
//         title="100ms (Fast)"
//         onPress={() => handleUpdateDelay(100)}
//       />
//       <Button
//         title="500ms (Normal)"
//         onPress={() => handleUpdateDelay(500)}
//       />
//       <Button
//         title="2000ms (Slow)"
//         onPress={() => handleUpdateDelay(2000)}
//       />
//     </View>
//   );
// };

// ============================================================================
// EXAMPLE 6: Testing with Mocks
// ============================================================================

// import { setMockConfig, createAllApiClients } from '@/mocks';
//
// describe('Puzzle Integration', () => {
//   beforeEach(() => {
//     // Setup mocks for tests
//     setMockConfig({
//       enabled: true,
//       simulateDelay: 0, // No delay in tests
//     });
//   });
//
//   test('loads daily puzzle', async () => {
//     const { puzzleApi } = createAllApiClients();
//     const puzzle = await puzzleApi.getDailyPuzzle();
//
//     expect(puzzle).toBeDefined();
//     expect(puzzle.id).toBeDefined();
//     expect(puzzle.fen).toBeDefined();
//     expect(puzzle.solutionMoves).toBeDefined();
//   });
//
//   test('submits puzzle attempt', async () => {
//     const { puzzleApi } = createAllApiClients();
//     const result = await puzzleApi.submitAttempt('puzzle-123');
//
//     expect(result).toBeDefined();
//     expect(result.status).toMatch(/SUCCESS|FAILED/);
//     expect(result.ratingChange).toBeDefined();
//   });
//
//   test('creates new game', async () => {
//     const { playApi } = createAllApiClients();
//     const gameState = await playApi.createGame();
//
//     expect(gameState).toBeDefined();
//     expect(gameState.status).toBe('ongoing');
//   });
// });

// ============================================================================
// EXAMPLE 7: Demo Mode Setup
// ============================================================================

// import { setMockConfig } from '@/mocks';
//
// export const setupDemoMode = () => {
//   // For presentations/demos: instant responses, realistic appearance
//   setMockConfig({
//     enabled: true,
//     simulateDelay: 200, // Small delay for realism
//     simulateErrors: false,
//   });
// };

// ============================================================================
// EXAMPLE 8: Development Mode Setup
// ============================================================================

// export const setupDevMode = () => {
//   // For development: with network simulation
//   setMockConfig({
//     enabled: true,
//     simulateDelay: 500, // Realistic network delay
//     simulateErrors: false,
//   });
// };

// ============================================================================
// EXAMPLE 9: Generate Custom Mock Data
// ============================================================================

// import {
//   generateMockPuzzle,
//   generateMockGame,
//   generateMockUserStats,
// } from '@/mocks';
//
// export const createTestScenario = () => {
//   // Easy puzzle for testing
//   const easyPuzzle = generateMockPuzzle('easy-puzzle');
//
//   // Ongoing game
//   const game = generateMockGame('test-game-1');
//
//   // User with stats
//   const stats = generateMockUserStats('test-user');
//
//   return { easyPuzzle, game, stats };
// };

// ============================================================================
// EXAMPLE 10: Offline-First Architecture
// ============================================================================

// import { enableMockMode, createAllApiClients } from '@/mocks';
//
// export class OfflineFirstService {
//   private clients: any;
//   private cache: Map<string, any> = new Map();
//
//   constructor() {
//     // Always enable mocks for offline-first
//     enableMockMode();
//     this.clients = createAllApiClients();
//   }
//
//   async getPuzzle(puzzleId: string) {
//     // Check cache first
//     if (this.cache.has(puzzleId)) {
//       return this.cache.get(puzzleId);
//     }
//
//     // Fetch from API (mock or real)
//     const puzzle = await this.clients.puzzleApi.getPuzzle(puzzleId);
//
//     // Cache result
//     this.cache.set(puzzleId, puzzle);
//     return puzzle;
//   }
//
//   async createGame() {
//     return this.clients.playApi.createGame();
//   }
// }

/**
 * See README.md for complete usage documentation
 * and uncomment examples above to use them in your app
 */
export const mockExamplesDocumentation =
  'See /src/mocks/README.md for full documentation';

/**
 * API Context Provider - provides API clients to the app.
 * Supports both real and mock implementations via USE_MOCK_API flag.
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { AccountApiClient } from '../api/accountApi';
import { RatingApiClient } from '../api/ratingApi';
import { MatchmakingApiClient } from '../api/matchmakingApi';
import { MockAccountApiClient, MockRatingApiClient, MockMatchmakingApiClient } from '../api/mockClients';
import { PuzzleApiClient } from '../api/puzzleApi';
import { LiveGameApiClient } from '../api/liveGameClient';
import { PlayApiClient } from '../api/playApi';
import { useAuth } from './AuthContext';

interface ApiContextType {
  accountApi: AccountApiClient | MockAccountApiClient;
  ratingApi: RatingApiClient | MockRatingApiClient;
  matchmakingApi: MatchmakingApiClient | MockMatchmakingApiClient;
  puzzleApi: PuzzleApiClient;
  liveGameApi: LiveGameApiClient;
  playApi: PlayApiClient;
  useMockApi: boolean;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Feature flag: Use mock APIs by default for testing without backend
// Set EXPO_PUBLIC_USE_MOCK_API=false to use real APIs
const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false';

// API base URLs - configurable via environment variables
const API_BASE_URLS = {
  account: process.env.EXPO_PUBLIC_ACCOUNT_API_URL || 'http://localhost:8002',
  rating: process.env.EXPO_PUBLIC_RATING_API_URL || 'http://localhost:8003',
  matchmaking: process.env.EXPO_PUBLIC_MATCHMAKING_API_URL || 'http://localhost:8004',
  puzzle: process.env.EXPO_PUBLIC_PUZZLE_API_URL || 'http://localhost:8000',
  liveGame: process.env.EXPO_PUBLIC_LIVE_GAME_API_URL || 'http://localhost:8001',
  play: process.env.EXPO_PUBLIC_PLAY_API_URL || 'http://localhost:8001',
};

export function ApiProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  const clients = useMemo(() => {
    let accountApi: AccountApiClient | MockAccountApiClient;
    let ratingApi: RatingApiClient | MockRatingApiClient;
    let matchmakingApi: MatchmakingApiClient | MockMatchmakingApiClient;

    if (USE_MOCK_API) {
      // Use mock implementations for testing
      console.log('🎭 Using MOCK API clients');
      accountApi = new MockAccountApiClient();
      ratingApi = new MockRatingApiClient();
      matchmakingApi = new MockMatchmakingApiClient();
    } else {
      // Use real API implementations
      console.log('🌐 Using REAL API clients');
      accountApi = new AccountApiClient(API_BASE_URLS.account, token || undefined);
      ratingApi = new RatingApiClient(API_BASE_URLS.rating, token || undefined);
      matchmakingApi = new MatchmakingApiClient(API_BASE_URLS.matchmaking, token || undefined);

      // Update auth tokens when they change
      if (token) {
        accountApi.setAuthToken(token);
        ratingApi.setAuthToken(token);
        matchmakingApi.setAuthToken(token);
      }
    }

    // These always use real implementations (or can be mocked later if needed)
    const puzzleApi = new PuzzleApiClient(API_BASE_URLS.puzzle);
    const liveGameApi = new LiveGameApiClient(API_BASE_URLS.liveGame);
    const playApi = new PlayApiClient(API_BASE_URLS.play);

    return {
      accountApi,
      ratingApi,
      matchmakingApi,
      puzzleApi,
      liveGameApi,
      playApi,
      useMockApi: USE_MOCK_API,
    };
  }, [token]);

  return <ApiContext.Provider value={clients}>{children}</ApiContext.Provider>;
}

export function useApiClients() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiClients must be used within an ApiProvider');
  }
  return context;
}

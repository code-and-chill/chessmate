/**
 * API Context Provider - provides API clients to the app.
 * Supports both real and mock implementations via USE_MOCK_API flag.
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { 
  AuthApiClient,
  AccountApiClient,
  RatingApiClient,
  MatchmakingApiClient,
  LearningApiClient,
  SocialApiClient,
  MockAuthApiClient,
  MockAccountApiClient,
  MockRatingApiClient,
  MockMatchmakingApiClient,
  MockLearningApiClient,
  MockSocialApiClient,
  MockLiveGameApiClient,
  PuzzleApiClient,
  LiveGameApiClient,
  GameApiClient as PlayApiClient
} from '@/services/api';

interface ApiContextType {
  authApi: AuthApiClient | MockAuthApiClient;
  accountApi: AccountApiClient | MockAccountApiClient;
  ratingApi: RatingApiClient | MockRatingApiClient;
  matchmakingApi: MatchmakingApiClient | MockMatchmakingApiClient;
  learningApi: LearningApiClient | MockLearningApiClient;
  socialApi: SocialApiClient | MockSocialApiClient;
  puzzleApi: PuzzleApiClient;
  liveGameApi: LiveGameApiClient | MockLiveGameApiClient;
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
  learning: process.env.EXPO_PUBLIC_LEARNING_API_URL || 'http://localhost:8005',
};

export function ApiProvider({ children }: { children: ReactNode }) {
  const clients = useMemo(() => {
    let authApi: AuthApiClient | MockAuthApiClient;
    let accountApi: AccountApiClient | MockAccountApiClient;
    let ratingApi: RatingApiClient | MockRatingApiClient;
    let matchmakingApi: MatchmakingApiClient | MockMatchmakingApiClient;
    let learningApi: LearningApiClient | MockLearningApiClient;
    let socialApi: SocialApiClient | MockSocialApiClient;
    let liveGameApi: LiveGameApiClient | MockLiveGameApiClient;

    if (USE_MOCK_API) {
      // Use mock implementations for testing
      console.log('🎭 Using MOCK API clients');
      authApi = new MockAuthApiClient();
      accountApi = new MockAccountApiClient();
      ratingApi = new MockRatingApiClient();
      matchmakingApi = new MockMatchmakingApiClient();
      learningApi = new MockLearningApiClient();
      socialApi = new MockSocialApiClient();
      liveGameApi = new MockLiveGameApiClient();
    } else {
      // Use real API implementations
      console.log('🌐 Using REAL API clients');
      authApi = new AuthApiClient(API_BASE_URLS.account);
      accountApi = new AccountApiClient(API_BASE_URLS.account);
      ratingApi = new RatingApiClient(API_BASE_URLS.rating);
      matchmakingApi = new MatchmakingApiClient(API_BASE_URLS.matchmaking);
      learningApi = new LearningApiClient(API_BASE_URLS.learning);
      socialApi = new SocialApiClient(API_BASE_URLS.account);
      liveGameApi = new LiveGameApiClient(API_BASE_URLS.liveGame, "");
    }

    // These always use real implementations (or can be mocked later if needed)
    const puzzleApi = new PuzzleApiClient(API_BASE_URLS.puzzle);
    const playApi = new PlayApiClient(API_BASE_URLS.play, "");
    
    return {
      authApi,
      accountApi,
      ratingApi,
      matchmakingApi,
      learningApi,
      socialApi,
      puzzleApi,
      liveGameApi,
      playApi,
      useMockApi: USE_MOCK_API,
    };
  }, []);

  return <ApiContext.Provider value={clients}>{children}</ApiContext.Provider>;
}

export function useApiClients() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiClients must be used within an ApiProvider');
  }
  return context;
}

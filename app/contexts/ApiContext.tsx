import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { 
  AuthApiClient,
  AccountApiClient,
  RatingApiClient,
  MatchmakingApiClient,
  LearningApiClient,
  SocialApiClient,
  PuzzleApiClient,
  LiveGameApiClient,
  GameApiClient as PlayApiClient,
  PieceThemeApiClient,
} from '@/services/api';

import type { IAccountApiClient } from '@/services/api/account.api';
import type { IRatingApiClient } from '@/services/api/rating.api';
import type { IMatchmakingApiClient } from '@/services/api/matchmaking.api';
import type { ILearningApiClient } from '@/services/api/learning.api';
import type { ISocialApiClient } from '@/services/api/social.api';
import type { IPuzzleApiClient } from '@/services/api/puzzle.api';
import type { ILiveGameApiClient } from '@/services/api/live-game.api';
import type { IAuthApiClient } from '@/services/api/auth.api';
import type { IGameApiClient } from '@/services/api/game.api';
import type { IPieceThemeApiClient } from '@/services/api/piece-theme.api';

// Mock clients are conditionally imported to reduce production bundle size
// They are only loaded when USE_MOCK_API is true
const getMockClients = () => {
  // These require() calls are only executed when this function is called
  const { MockAuthApiClient } = require('@/services/api/auth.api.mock');
  const { MockAccountApiClient } = require('@/services/api/account.api.mock');
  const { MockRatingApiClient } = require('@/services/api/rating.api.mock');
  const { MockMatchmakingApiClient } = require('@/services/api/matchmaking.api.mock');
  const { MockLearningApiClient } = require('@/services/api/learning.api.mock');
  const { MockSocialApiClient } = require('@/services/api/social.api.mock');
  const { MockLiveGameApiClient } = require('@/services/api/live-game.api.mock');
  const { MockPuzzleApiClient } = require('@/services/api/puzzle.api.mock');
  const { MockGameApiClient } = require('@/services/api/game.api.mock');
  const { MockPieceThemeApiClient } = require('@/services/api/piece-theme.api.mock');

  return {
    MockAuthApiClient,
    MockAccountApiClient,
    MockRatingApiClient,
    MockMatchmakingApiClient,
    MockLearningApiClient,
    MockSocialApiClient,
    MockLiveGameApiClient,
    MockPuzzleApiClient,
    MockGameApiClient,
    MockPieceThemeApiClient,
  };
};

interface ApiContextType {
  authApi: IAuthApiClient;
  accountApi: IAccountApiClient;
  ratingApi: IRatingApiClient;
  matchmakingApi: IMatchmakingApiClient;
  learningApi: ILearningApiClient;
  socialApi: ISocialApiClient;
  puzzleApi: IPuzzleApiClient;
  liveGameApi: ILiveGameApiClient;
  playApi: IGameApiClient;
  pieceThemeApi: IPieceThemeApiClient;
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
  liveGame: process.env.EXPO_PUBLIC_LIVE_GAME_API_URL || 'http://localhost:8002',
  play: process.env.EXPO_PUBLIC_PLAY_API_URL || 'http://localhost:8002',
  learning: process.env.EXPO_PUBLIC_LEARNING_API_URL || 'http://localhost:8005',
};

export function ApiProvider({ children }: { children: ReactNode }) {
  const clients = useMemo(() => {
    let authApi: IAuthApiClient;
    let accountApi: IAccountApiClient;
    let ratingApi: IRatingApiClient;
    let matchmakingApi: IMatchmakingApiClient;
    let learningApi: ILearningApiClient;
    let socialApi: ISocialApiClient;
    let liveGameApi: ILiveGameApiClient;
    let puzzleApi: IPuzzleApiClient;
    let playApi: IGameApiClient;
    let pieceThemeApi: IPieceThemeApiClient;

    if (USE_MOCK_API) {
      // Lazy load mock implementations only when needed (reduces production bundle)
      const mocks = getMockClients();
      authApi = new mocks.MockAuthApiClient();
      accountApi = new mocks.MockAccountApiClient();
      ratingApi = new mocks.MockRatingApiClient();
      matchmakingApi = new mocks.MockMatchmakingApiClient();
      learningApi = new mocks.MockLearningApiClient();
      socialApi = new mocks.MockSocialApiClient();
      liveGameApi = new mocks.MockLiveGameApiClient();
      puzzleApi = new mocks.MockPuzzleApiClient();
      playApi = new mocks.MockGameApiClient();
      pieceThemeApi = new mocks.MockPieceThemeApiClient();
    } else {
      // Use real API implementations
      authApi = new AuthApiClient(API_BASE_URLS.account);
      accountApi = new AccountApiClient(API_BASE_URLS.account);
      ratingApi = new RatingApiClient(API_BASE_URLS.rating);
      matchmakingApi = new MatchmakingApiClient(API_BASE_URLS.matchmaking);
      learningApi = new LearningApiClient(API_BASE_URLS.learning);
      socialApi = new SocialApiClient(API_BASE_URLS.account);
      liveGameApi = new LiveGameApiClient(API_BASE_URLS.liveGame, '');
      puzzleApi = new PuzzleApiClient(API_BASE_URLS.puzzle);
      playApi = new PlayApiClient(API_BASE_URLS.play, '');
      pieceThemeApi = new PieceThemeApiClient();
    }
    
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
      pieceThemeApi,
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

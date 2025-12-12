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

import { MockAuthApiClient } from '@/services/api/auth.api.mock';
import { MockAccountApiClient } from '@/services/api/account.api.mock';
import { MockRatingApiClient } from '@/services/api/rating.api.mock';
import { MockMatchmakingApiClient } from '@/services/api/matchmaking.api.mock';
import { MockLearningApiClient } from '@/services/api/learning.api.mock';
import { MockSocialApiClient } from '@/services/api/social.api.mock';
import { MockLiveGameApiClient } from '@/services/api/live-game.api.mock';
import { MockPuzzleApiClient } from '@/services/api/puzzle.api.mock';
import { MockGameApiClient } from '@/services/api/game.api.mock';
import { MockPieceThemeApiClient } from '@/services/api/piece-theme.api.mock';
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
    let puzzleApi: PuzzleApiClient | MockPuzzleApiClient;
    let playApi: PlayApiClient | MockGameApiClient;
    let pieceThemeApi: PieceThemeApiClient;

    if (USE_MOCK_API) {
      // Use mock implementations for testing
      authApi = new MockAuthApiClient();
      accountApi = new MockAccountApiClient();
      ratingApi = new MockRatingApiClient();
      matchmakingApi = new MockMatchmakingApiClient();
      learningApi = new MockLearningApiClient();
      socialApi = new MockSocialApiClient();
      liveGameApi = new MockLiveGameApiClient();
      puzzleApi = new MockPuzzleApiClient();
      playApi = new MockGameApiClient();
      pieceThemeApi = new MockPieceThemeApiClient();
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

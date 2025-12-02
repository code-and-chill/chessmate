/**
 * Mock implementations of API clients for testing without backend.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MOCK_USER,
  MOCK_FRIENDS,
  MOCK_STATS,
  MOCK_ACHIEVEMENTS,
  MOCK_PREFERENCES,
  MOCK_LEADERBOARD_GLOBAL,
  MOCK_LEADERBOARD_FRIENDS,
  MOCK_LEADERBOARD_CLUB,
  MOCK_RATING_HISTORY,
  delay,
} from './mock-data';

import type { UserProfile, Friend, FriendRequest } from './account.api';
import type { UserPreferences } from '@/features/settings/types';
import type { RatingHistory, GameStats, LeaderboardEntry, Achievement } from './rating.api';
import type { MatchmakingRequest, MatchFound, QueueStatus } from './matchmaking.api';
import type { AuthResponse } from './auth.api';

const AUTH_TOKEN_KEY = '@chess_auth_token';
const AUTH_USER_KEY = '@chess_auth_user';

/**
 * Mock Auth API Client
 * Automatically provides a mock authenticated session on instantiation
 */
export class MockAuthApiClient {
  constructor() {
    // Auto-populate storage with mock session if not already authenticated
    this.initializeMockSession();
  }

  private async initializeMockSession() {
    try {
      const existingToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!existingToken) {
        console.log('🎭 Initializing mock authenticated session');
        const session = this.getMockSession();
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.token);
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
      }
    } catch (error) {
      console.error('Failed to initialize mock session:', error);
    }
  }
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay();
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'ChessMaster',
        email,
      },
    };
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    await delay();
    return {
      token: 'mock_token_' + Date.now(),
      user: {
        id: crypto.randomUUID(),
        username,
        email,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    await delay();
    return {
      token: 'mock_token_refreshed_' + Date.now(),
    };
  }

  async logout(token: string): Promise<void> {
    await delay();
  }

  async verifyToken(token: string): Promise<boolean> {
    await delay();
    return true;
  }

  /**
   * Get a mock authenticated session (for development/testing)
   * Use this to bypass login during development
   */
  getMockSession(): AuthResponse {
    return {
      token: 'mock_token_dev_' + Date.now(),
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'ChessMaster',
        email: 'dev@chessmate.com',
      },
    };
  }
}

/**
 * Mock Account API Client
 */
export class MockAccountApiClient {
  async getProfile(userId: string): Promise<UserProfile> {
    await delay();
    return MOCK_USER;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    await delay();
    return { ...MOCK_USER, ...updates };
  }

  async getFriends(userId: string): Promise<Friend[]> {
    await delay();
    return MOCK_FRIENDS;
  }

  async sendFriendRequest(fromUserId: string, toUsername: string): Promise<FriendRequest> {
    await delay();
    return {
      id: Date.now().toString(),
      fromUserId,
      fromUsername: MOCK_USER.username,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<void> {
    await delay();
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    await delay();
    return MOCK_FRIENDS.filter(f => 
      f.username.toLowerCase().includes(query.toLowerCase())
    ).map(f => ({
      ...MOCK_USER,
      id: f.id,
      username: f.username,
      avatar: f.avatar,
      ratings: {
        blitz: f.rating,
        rapid: f.rating - 50,
        classical: f.rating + 70,
      },
    }));
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    await delay();
    return MOCK_PREFERENCES;
  }

  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    await delay();
    // In a real implementation, this would persist to the backend
    // For now, just merge the updates with existing preferences (flat structure)
    return {
      ...MOCK_PREFERENCES,
      ...updates,
    };
  }

  setAuthToken(token: string) {
    // Mock implementation
  }
}

/**
 * Mock Rating API Client
 */
export class MockRatingApiClient {
  async getStats(userId: string, timeControl: string): Promise<GameStats> {
    await delay();
    const stats = MOCK_STATS[timeControl as keyof typeof MOCK_STATS] || MOCK_STATS.blitz;
    return { ...stats, timeControl: timeControl as any };
  }

  async getRatingHistory(userId: string, timeControl: string, days: number = 30): Promise<RatingHistory[]> {
    await delay();
    return MOCK_RATING_HISTORY;
  }

  async getLeaderboard(
    type: 'global' | 'friends' | 'club',
    timeControl: string,
    limit: number = 100
  ): Promise<LeaderboardEntry[]> {
    await delay();
    const leaderboards = {
      global: MOCK_LEADERBOARD_GLOBAL,
      friends: MOCK_LEADERBOARD_FRIENDS,
      club: MOCK_LEADERBOARD_CLUB,
    };
    return leaderboards[type];
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    await delay();
    return MOCK_ACHIEVEMENTS;
  }

  async updateRating(
    userId: string,
    gameId: string,
    timeControl: string,
    result: 'win' | 'loss' | 'draw',
    opponentRating: number
  ): Promise<{ newRating: number; change: number }> {
    await delay();
    const change = result === 'win' ? 15 : result === 'loss' ? -10 : 0;
    return {
      newRating: 1650 + change,
      change,
    };
  }

  setAuthToken(token: string) {
    // Mock implementation
  }
}

/**
 * Mock Matchmaking API Client
 */
export class MockMatchmakingApiClient {
  async joinQueue(request: MatchmakingRequest): Promise<QueueStatus> {
    await delay(300);
    return {
      inQueue: true,
      position: Math.floor(Math.random() * 10) + 1,
      estimatedWaitTime: 15,
    };
  }

  async leaveQueue(userId: string): Promise<void> {
    await delay(200);
  }

  async getQueueStatus(userId: string): Promise<QueueStatus> {
    await delay(200);
    return {
      inQueue: false,
    };
  }

  async pollForMatch(userId: string, timeout: number = 30000): Promise<MatchFound | null> {
    await delay(1500); // Simulate matchmaking time
    
    const opponents = MOCK_FRIENDS.filter(f => f.online && !f.playing);
    if (opponents.length === 0) {
      return null;
    }

    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    
    return {
      gameId: 'game_' + Date.now(),
      opponentId: opponent.id,
      opponentUsername: opponent.username,
      opponentRating: opponent.rating,
      timeControl: 'blitz',
      color: Math.random() > 0.5 ? 'white' : 'black',
    };
  }

  async createBotGame(
    userId: string,
    difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  ): Promise<{ gameId: string; color: 'white' | 'black' }> {
    await delay(500);
    return {
      gameId: 'bot_game_' + Date.now(),
      color: Math.random() > 0.5 ? 'white' : 'black',
    };
  }

  async createFriendChallenge(
    userId: string,
    friendId: string,
    timeControl: string
  ): Promise<{ gameId: string; challengeCode: string }> {
    await delay(500);
    return {
      gameId: 'friend_game_' + Date.now(),
      challengeCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };
  }

  async joinChallenge(
    userId: string,
    challengeCode: string
  ): Promise<{ gameId: string; color: 'white' | 'black' }> {
    await delay(500);
    return {
      gameId: 'friend_game_' + Date.now(),
      color: Math.random() > 0.5 ? 'white' : 'black',
    };
  }

  setAuthToken(token: string) {
    // Mock implementation
  }
}

/**
 * Mock Learning API Client
 */
export class MockLearningApiClient {
  private mockLessons = [
    {
      id: 'lesson-001',
      title: 'Chess Basics: Piece Movement',
      description: 'Learn how each chess piece moves and captures',
      category: 'theory' as const,
      difficulty: 'beginner' as const,
      duration: 15,
      topics: ['piece movement', 'captures', 'special moves'],
      content: [
        {
          type: 'text' as const,
          title: 'Introduction',
          content: 'In chess, each piece has unique movement patterns. Understanding these is fundamental to playing chess.',
        },
        {
          type: 'diagram' as const,
          title: 'The Knight',
          content: 'The knight moves in an L-shape: two squares in one direction and one square perpendicular.',
          fen: 'rnbqkbnr/pppppppp/8/8/4N3/8/PPPPPPPP/RNBQKB1R w KQkq - 0 1',
        },
      ],
      quiz: {
        id: 'quiz-001',
        questions: [
          {
            id: 'q1',
            question: 'How many squares can a knight move from the center of an empty board?',
            options: ['4', '6', '8', '12'],
            correctAnswer: 2,
            explanation: 'A knight in the center can reach 8 different squares.',
          },
        ],
      },
    },
    {
      id: 'lesson-002',
      title: 'Opening Principles',
      description: 'Master the fundamental principles of chess openings',
      category: 'openings' as const,
      difficulty: 'beginner' as const,
      duration: 20,
      topics: ['center control', 'piece development', 'king safety'],
      content: [
        {
          type: 'text' as const,
          title: 'The Three Principles',
          content: '1. Control the center\n2. Develop your pieces\n3. Castle early',
        },
        {
          type: 'interactive' as const,
          title: 'Practice',
          content: 'Try applying these principles in this position',
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        },
      ],
      quiz: {
        id: 'quiz-002',
        questions: [
          {
            id: 'q1',
            question: 'Why is controlling the center important?',
            options: [
              'It looks nice',
              'It gives you more space and piece mobility',
              'It prevents the opponent from castling',
              'It automatically wins the game',
            ],
            correctAnswer: 1,
            explanation: 'Controlling the center gives your pieces more squares to move to and restricts your opponent.',
          },
        ],
      },
    },
    {
      id: 'lesson-003',
      title: 'Basic Tactics: Forks',
      description: 'Learn how to attack two pieces at once',
      category: 'tactics' as const,
      difficulty: 'intermediate' as const,
      duration: 25,
      topics: ['forks', 'knight forks', 'double attacks'],
      content: [
        {
          type: 'text' as const,
          title: 'What is a Fork?',
          content: 'A fork is when one piece attacks two or more enemy pieces simultaneously.',
        },
        {
          type: 'diagram' as const,
          title: 'Knight Fork Example',
          content: 'The knight can fork the king and rook',
          fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
        },
      ],
      quiz: {
        id: 'quiz-003',
        questions: [
          {
            id: 'q1',
            question: 'Which piece is most famous for forks?',
            options: ['Pawn', 'Knight', 'Bishop', 'Queen'],
            correctAnswer: 1,
            explanation: 'Knights are particularly good at forks because of their unique L-shaped movement.',
            fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          },
        ],
      },
    },
  ];

  async getAllLessons() {
    await delay();
    return this.mockLessons;
  }

  async getLessonById(lessonId: string) {
    await delay();
    const lesson = this.mockLessons.find(l => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    return lesson;
  }

  async getLessonsByCategory(category: string) {
    await delay();
    return this.mockLessons.filter(l => l.category === category);
  }

  async startLesson(lessonId: string) {
    await delay();
    console.log('Started lesson:', lessonId);
  }

  async completeLesson(lessonId: string, quizScore?: number) {
    await delay();
    console.log('Completed lesson:', lessonId, 'Score:', quizScore);
  }

  async getLessonProgress(lessonId: string) {
    await delay();
    return {
      lessonId,
      completed: false,
      progress: 45,
      timeSpent: 600,
    };
  }

  async updateProgress(lessonId: string, progress: number, timeSpent: number) {
    await delay(200);
    console.log('Updated progress:', lessonId, progress, timeSpent);
  }

  async getUserStats() {
    await delay();
    return {
      totalLessonsCompleted: 12,
      totalTimeSpent: 7200,
      averageQuizScore: 85,
      currentStreak: 3,
      longestStreak: 7,
      byCategory: {
        openings: { completed: 4, total: 8, averageScore: 88 },
        tactics: { completed: 5, total: 10, averageScore: 82 },
        endgames: { completed: 2, total: 6, averageScore: 90 },
        strategy: { completed: 1, total: 5, averageScore: 75 },
        theory: { completed: 0, total: 3, averageScore: 0 },
      },
      recentProgress: [
        {
          lessonId: 'lesson-001',
          completed: true,
          progress: 100,
          quizScore: 90,
          completedAt: new Date(Date.now() - 86400000).toISOString(),
          timeSpent: 900,
        },
      ],
    };
  }

  async submitQuiz(lessonId: string, answers: number[]) {
    await delay();
    const lesson = this.mockLessons.find(l => l.id === lessonId);
    if (!lesson?.quiz) throw new Error('No quiz found for lesson');
    
    const results = answers.map((answer, index) => 
      answer === lesson.quiz!.questions[index].correctAnswer
    );
    
    const score = Math.round((results.filter(r => r).length / results.length) * 100);
    
    return { score, results };
  }

  setAuthToken(token: string) {
    // Mock implementation
  }
}

/**
 * Mock Social API Client
 */
export class MockSocialApiClient {
  private mockFriends = [
    {
      id: 'friend-1',
      username: 'ChessMaster99',
      displayName: 'Alex',
      rating: 1650,
      online: true,
      playing: true,
      friendSince: '2024-06-15T10:00:00Z',
    },
    {
      id: 'friend-2',
      username: 'TacticalGenius',
      displayName: 'Sarah',
      rating: 1820,
      online: true,
      playing: false,
      friendSince: '2024-08-20T14:30:00Z',
    },
    {
      id: 'friend-3',
      username: 'PawnPusher',
      displayName: 'Mike',
      rating: 1450,
      online: false,
      playing: false,
      lastSeen: '2024-11-28T09:15:00Z',
      friendSince: '2024-09-10T16:45:00Z',
    },
  ];

  private mockClubs = [
    {
      id: 'club-1',
      name: 'Elite Chess Club',
      description: 'For advanced players 1800+',
      memberCount: 245,
      rating: 1850,
      isPublic: false,
      joined: true,
      admin: false,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'club-2',
      name: 'Beginners Paradise',
      description: 'Learn and grow together',
      memberCount: 1250,
      rating: 1200,
      isPublic: true,
      joined: false,
      admin: false,
      createdAt: '2024-03-01T12:00:00Z',
    },
  ];

  private mockTournaments = [
    {
      id: 'tourney-1',
      name: 'Weekend Blitz Arena',
      description: '3+0 blitz tournament',
      format: 'arena' as const,
      timeControl: '3+0',
      startTime: '2025-12-06T18:00:00Z',
      participants: 45,
      maxParticipants: 100,
      status: 'upcoming' as const,
      prizePool: 'Premium membership',
    },
    {
      id: 'tourney-2',
      name: 'Club Championship',
      description: 'Elite Chess Club monthly tournament',
      format: 'swiss' as const,
      timeControl: '15+10',
      startTime: '2025-12-05T20:00:00Z',
      participants: 32,
      maxParticipants: 32,
      status: 'live' as const,
      clubId: 'club-1',
    },
  ];

  async getFriends(userId: string) {
    await delay();
    return this.mockFriends;
  }

  async getFriendRequests(userId: string) {
    await delay();
    return [
      {
        id: 'req-1',
        from: {
          id: 'user-123',
          username: 'NewPlayer2025',
          rating: 1300,
        },
        status: 'pending' as const,
        sentAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }

  async sendFriendRequest(fromUserId: string, toUsername: string) {
    await delay();
    console.log('Sent friend request to:', toUsername);
  }

  async acceptFriendRequest(userId: string, requestId: string) {
    await delay();
    console.log('Accepted friend request:', requestId);
  }

  async declineFriendRequest(userId: string, requestId: string) {
    await delay();
    console.log('Declined friend request:', requestId);
  }

  async removeFriend(userId: string, friendId: string) {
    await delay();
    console.log('Removed friend:', friendId);
  }

  async searchUsers(query: string) {
    await delay();
    return [
      { id: 'user-1', username: 'ChessPlayer123', rating: 1500 },
      { id: 'user-2', username: 'TacticsKing', rating: 1700 },
    ].filter(u => u.username.toLowerCase().includes(query.toLowerCase()));
  }

  async getConversations(userId: string) {
    await delay();
    return this.mockFriends.map(friend => ({
      id: `conv-${friend.id}`,
      participant: friend,
      unreadCount: Math.floor(Math.random() * 3),
      messages: [],
    }));
  }

  async getConversation(userId: string, friendId: string) {
    await delay();
    const friend = this.mockFriends.find(f => f.id === friendId) || this.mockFriends[0];
    return {
      id: `conv-${friendId}`,
      participant: friend,
      unreadCount: 0,
      messages: [
        {
          id: 'msg-1',
          from: friendId,
          to: userId,
          content: 'Hey! Want to play a game?',
          read: true,
          sentAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };
  }

  async sendMessage(fromUserId: string, toUserId: string, content: string) {
    await delay();
    return {
      id: `msg-${Date.now()}`,
      from: fromUserId,
      to: toUserId,
      content,
      read: false,
      sentAt: new Date().toISOString(),
    };
  }

  async markAsRead(userId: string, conversationId: string) {
    await delay(200);
    console.log('Marked as read:', conversationId);
  }

  async getClubs() {
    await delay();
    return this.mockClubs;
  }

  async getMyClubs(userId: string) {
    await delay();
    return this.mockClubs.filter(c => c.joined);
  }

  async joinClub(userId: string, clubId: string) {
    await delay();
    console.log('Joined club:', clubId);
  }

  async leaveClub(userId: string, clubId: string) {
    await delay();
    console.log('Left club:', clubId);
  }

  async createClub(userId: string, name: string, description: string, isPublic: boolean) {
    await delay();
    return {
      id: `club-${Date.now()}`,
      name,
      description,
      memberCount: 1,
      rating: 1200,
      isPublic,
      joined: true,
      admin: true,
      createdAt: new Date().toISOString(),
    };
  }

  async getTournaments() {
    await delay();
    return this.mockTournaments;
  }

  async joinTournament(userId: string, tournamentId: string) {
    await delay();
    console.log('Joined tournament:', tournamentId);
  }

  async leaveTournament(userId: string, tournamentId: string) {
    await delay();
    console.log('Left tournament:', tournamentId);
  }

  setAuthToken(token: string) {
    // Mock implementation
  }
}

/**
 * Mock Live Game API Client
 */
export class MockLiveGameApiClient {
  async getGame(gameId: string) {
    await delay();
    return {
      id: gameId,
      white_player_id: 'player-1',
      black_player_id: 'player-2',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'active' as const,
      moves: [],
      time_control: '10+0',
      created_at: new Date().toISOString(),
    };
  }

  async makeMove(gameId: string, from: string, to: string, promotion?: string) {
    await delay();
    return {
      id: gameId,
      white_player_id: 'player-1',
      black_player_id: 'player-2',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      status: 'active' as const,
      moves: [{ from, to, promotion, timestamp: new Date().toISOString() }],
      time_control: '10+0',
      created_at: new Date().toISOString(),
    };
  }

  async resign(gameId: string) {
    await delay();
    return {
      id: gameId,
      white_player_id: 'player-1',
      black_player_id: 'player-2',
      fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
      status: 'completed' as const,
      result: 'white_wins' as const,
      moves: [],
      time_control: '10+0',
      created_at: new Date().toISOString(),
    };
  }

  async createBotGame(userId: string, difficulty: string, playerColor: 'white' | 'black') {
    await delay();
    return {
      gameId: `game-bot-${difficulty}-${Date.now()}`,
    };
  }

  async createFriendGame(creatorId: string, timeControl: string, playerColor: 'white' | 'black') {
    await delay();
    return {
      gameId: `game-friend-${Date.now()}`,
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
    };
  }

  async joinFriendGame(userId: string, inviteCode: string) {
    await delay();
    return {
      gameId: `game-friend-${inviteCode}`,
    };
  }
}

/**
 * Mock Puzzle API Client
 */
export class MockPuzzleApiClient {
  private mockPuzzles = [
    {
      id: 'puzzle-001',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
      solutionMoves: ['f3g5', 'h7h6', 'd1h5', 'g7g6', 'h5e5'],
      sideToMove: 'w' as const,
      rating: 1200,
      themes: ['fork', 'tactics'],
      difficulty: 'easy',
      initialDepth: 5,
    },
    {
      id: 'puzzle-002',
      fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 6',
      solutionMoves: ['c4f7', 'e8f7', 'f3g5', 'f7g8', 'g5e6'],
      sideToMove: 'w' as const,
      rating: 1400,
      themes: ['pin', 'tactics'],
      difficulty: 'medium',
      initialDepth: 5,
    },
    {
      id: 'puzzle-003',
      fen: 'r2qk2r/ppp2ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2QK2R w KQkq - 0 8',
      solutionMoves: ['d1d5', 'c6d8', 'c3d5', 'd8e6', 'd5e7'],
      sideToMove: 'w' as const,
      rating: 1600,
      themes: ['sacrifice', 'tactics'],
      difficulty: 'hard',
      initialDepth: 5,
    },
  ];

  async getDailyPuzzle() {
    await delay();
    return this.mockPuzzles[0];
  }

  async getPuzzle(puzzleId: string) {
    await delay();
    const puzzle = this.mockPuzzles.find(p => p.id === puzzleId);
    if (!puzzle) throw new Error('Puzzle not found');
    return puzzle;
  }

  async getRandomPuzzle() {
    await delay();
    const randomIndex = Math.floor(Math.random() * this.mockPuzzles.length);
    return this.mockPuzzles[randomIndex];
  }

  async getPuzzlesByTheme(theme: string) {
    await delay();
    return this.mockPuzzles.filter(p => p.themes.includes(theme));
  }

  async submitAttempt(puzzleId: string, attempt: Record<string, unknown>) {
    await delay();
    return {
      id: `attempt-${Date.now()}`,
      puzzleId,
      ratingChange: Math.random() > 0.5 ? 10 : -5,
      status: Math.random() > 0.5 ? 'SUCCESS' : 'FAILED',
    };
  }

  async getUserStats(_userId?: string) {
    await delay();
    return {
      totalAttempts: 45,
      successfulAttempts: 32,
      successRate: 71,
      averageRating: 1350,
      currentStreak: 3,
      longestStreak: 8,
      userRating: 1350,
      byDifficulty: {
        beginner: { attempted: 0, solved: 0 },
        easy: { attempted: 15, solved: 13 },
        medium: { attempted: 20, solved: 14 },
        hard: { attempted: 10, solved: 5 },
        expert: { attempted: 0, solved: 0 },
        master: { attempted: 0, solved: 0 },
      },
      byTheme: {
        fork: { attempted: 12, solved: 9 },
        pin: { attempted: 10, solved: 7 },
        skewer: { attempted: 8, solved: 5 },
        sacrifice: { attempted: 5, solved: 2 },
      },
      recentActivity: [
        {
          puzzleId: 'puzzle-001',
          date: new Date(Date.now() - 86400000).toISOString(),
          success: true,
          ratingChange: 10,
        },
      ],
    };
  }

  async getUserHistory(_userId?: string) {
    await delay();
    return [
      {
        id: 'attempt-1',
        puzzle_id: 'puzzle-001',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'SUCCESS',
        moves_played: ['f3g5', 'h7h6'],
        time_spent_ms: 45000,
        hints_used: 0,
        rating_change: 10,
      },
      {
        id: 'attempt-2',
        puzzle_id: 'puzzle-002',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        status: 'FAILED',
        moves_played: ['c4f7'],
        time_spent_ms: 120000,
        hints_used: 1,
        rating_change: -5,
      },
    ];
  }
}

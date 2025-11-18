/**
 * Mock data for testing without backend integration.
 */

export const MOCK_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  username: 'ChessPlayer2025',
  email: 'player@chess.com',
  avatar: '♔',
  bio: 'Chess enthusiast learning to improve my game. Love tactics and endgames!',
  country: '🇺🇸 United States',
  memberSince: '2025-11-15',
  ratings: {
    blitz: 1650,
    rapid: 1580,
    classical: 1720,
  },
};

export const MOCK_FRIENDS = [
  { id: '1', username: 'ChessMaster99', rating: 1850, online: true, playing: false, avatar: '♔' },
  { id: '2', username: 'TacticsGuru', rating: 1720, online: true, playing: true, avatar: '♕' },
  { id: '3', username: 'EndgameKing', rating: 1980, online: false, lastSeen: '2 hours ago', avatar: '♖' },
  { id: '4', username: 'BlitzQueen', rating: 1650, online: true, playing: false, avatar: '♛' },
  { id: '5', username: 'StrategyNinja', rating: 1890, online: false, lastSeen: '1 day ago', avatar: '♜' },
  { id: '6', username: 'PawnStorm', rating: 1580, online: true, playing: true, avatar: '♟' },
];

export const MOCK_STATS = {
  blitz: { rating: 1650, peak: 1720, games: 245, wins: 138, losses: 87, draws: 20, winRate: 56.3 },
  rapid: { rating: 1580, peak: 1640, games: 156, wins: 82, losses: 64, draws: 10, winRate: 52.6 },
  classical: { rating: 1720, peak: 1780, games: 55, wins: 32, losses: 18, draws: 5, winRate: 58.2 },
};

export const MOCK_ACHIEVEMENTS = [
  { id: '1', title: 'First Victory', description: 'Win your first game', unlocked: true, icon: '🎉', date: '2025-11-15', unlockedAt: '2025-11-15' },
  { id: '2', title: '100 Games', description: 'Play 100 games', unlocked: true, icon: '💯', date: '2025-11-16', unlockedAt: '2025-11-16' },
  { id: '3', title: 'Tactical Genius', description: 'Solve 50 puzzles', unlocked: true, icon: '🧩', date: '2025-11-17', unlockedAt: '2025-11-17' },
  { id: '4', title: 'Rating Milestone', description: 'Reach 1600 rating', unlocked: true, icon: '📊', date: '2025-11-17', unlockedAt: '2025-11-17' },
  { id: '5', title: 'Win Streak', description: 'Win 5 games in a row', unlocked: false, icon: '🔥', progress: { current: 3, total: 5 } },
  { id: '6', title: '500 Games', description: 'Play 500 games', unlocked: false, icon: '🎮', progress: { current: 456, total: 500 } },
  { id: '7', title: 'Checkmate Master', description: 'Deliver 100 checkmates', unlocked: false, icon: '♔', progress: { current: 67, total: 100 } },
  { id: '8', title: 'Tournament Winner', description: 'Win a tournament', unlocked: false, icon: '🏆', progress: { current: 0, total: 1 } },
];

export const MOCK_LEADERBOARD_GLOBAL = [
  { rank: 1, userId: '1', username: 'MagnusCarlsen', rating: 2850, games: 15240, winRate: 68.5, avatar: '👑' },
  { rank: 2, userId: '2', username: 'HikaruNakamura', rating: 2820, games: 18950, winRate: 67.2, avatar: '⚡' },
  { rank: 3, userId: '3', username: 'FabianoCaruana', rating: 2810, games: 12780, winRate: 66.8, avatar: '🎯' },
  { rank: 1247, userId: MOCK_USER.id, username: 'You', rating: 1650, games: 456, winRate: 54.2, avatar: '♟' },
];

export const MOCK_LEADERBOARD_FRIENDS = [
  { rank: 1, userId: '3', username: 'EndgameKing', rating: 1980, games: 890, winRate: 61.5, avatar: '♖' },
  { rank: 2, userId: '5', username: 'StrategyNinja', rating: 1890, games: 1240, winRate: 58.3, avatar: '♜' },
  { rank: 3, userId: '1', username: 'ChessMaster99', rating: 1850, games: 670, winRate: 57.8, avatar: '♔' },
  { rank: 7, userId: MOCK_USER.id, username: 'You', rating: 1650, games: 456, winRate: 54.2, avatar: '♟' },
];

export const MOCK_LEADERBOARD_CLUB = [
  { rank: 1, userId: '10', username: 'Sarah_Chess', rating: 1920, games: 780, winRate: 60.5, avatar: '♕' },
  { rank: 2, userId: '11', username: 'MikeBlitz', rating: 1875, games: 1020, winRate: 59.2, avatar: '⚡' },
  { rank: 3, userId: '12', username: 'TacticsPro', rating: 1840, games: 890, winRate: 58.6, avatar: '🎯' },
  { rank: 5, userId: MOCK_USER.id, username: 'You', rating: 1650, games: 456, winRate: 54.2, avatar: '♟' },
];

export const MOCK_RATING_HISTORY = [
  { date: '2025-11-01', rating: 1580, change: 0 },
  { date: '2025-11-03', rating: 1595, change: 15 },
  { date: '2025-11-05', rating: 1610, change: 15 },
  { date: '2025-11-07', rating: 1600, change: -10 },
  { date: '2025-11-09', rating: 1625, change: 25 },
  { date: '2025-11-11', rating: 1635, change: 10 },
  { date: '2025-11-13', rating: 1640, change: 5 },
  { date: '2025-11-15', rating: 1645, change: 5 },
  { date: '2025-11-17', rating: 1650, change: 5 },
];

/**
 * Simulate API delay for realistic testing
 */
export function delay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

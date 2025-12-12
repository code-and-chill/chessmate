import { delay, MOCK_FRIENDS } from './mock-data';
import type { ISocialApiClient } from './social.api';
import type { Friend, Tournament } from '@/types/social';

// Minimal mock store for clubs, conversations, tournaments
const MOCK_CLUBS = [
  { id: 'club_1', name: 'Local Players', description: 'Casual players in the area', avatar: '♔', memberCount: 42, rating: 1500, isPublic: true, joined: false, admin: false, createdAt: new Date().toISOString() },
  { id: 'club_2', name: 'Tactics Club', description: 'Solve puzzles together', avatar: '♕', memberCount: 120, rating: 1700, isPublic: true, joined: true, admin: false, createdAt: new Date().toISOString() },
];

const MOCK_TOURNAMENTS = [
  { id: 't1', name: 'Blitz Monthly', description: 'Monthly online blitz tournament', format: 'arena', timeControl: '3+2', startTime: new Date().toISOString(), participants: 64, status: 'upcoming', prizePool: '$100' },
  { id: 't2', name: 'Weekend Swiss', description: 'Weekend swiss format', format: 'swiss', timeControl: '5+0', startTime: new Date().toISOString(), participants: 32, status: 'upcoming' },
];

const MOCK_CONVERSATIONS: any[] = [];

export class MockSocialApiClient implements ISocialApiClient {
  private token?: string;

  setAuthToken(_token: string) {
    // noop for mock
  }

  // Friends
  async getFriends(_userId: string): Promise<Friend[]> {
    await delay(80);
    return (MOCK_FRIENDS as any[]).map(f => ({ id: f.id, username: f.username, rating: f.rating, online: f.online, playing: f.playing ?? false, avatar: f.avatar, lastSeen: f.lastSeen ?? new Date().toISOString(), friendSince: f.friendSince ?? new Date().toISOString() } as Friend));
  }

  async getFriendRequests(_userId: string) {
    await delay(60);
    return [] as any[];
  }

  async sendFriendRequest(fromUserId: string, toUsername: string): Promise<void> {
    await delay(100);
    // mock: no return value
  }

  async acceptFriendRequest(_userId: string, _requestId: string) {
    await delay(80);
  }

  async declineFriendRequest(_userId: string, _requestId: string) {
    await delay(80);
  }

  async removeFriend(_userId: string, friendId: string) {
    await delay(80);
    return;
  }

  async searchUsers(query: string) {
    await delay(100);
    return (MOCK_FRIENDS as any[])
      .filter(f => f.username.toLowerCase().includes(query.toLowerCase()))
      .map(f => ({ id: f.id, username: f.username, rating: f.rating }));
  }

  // Messaging
  async getConversations(_userId: string) {
    await delay(80);
    return MOCK_CONVERSATIONS;
  }

  async getConversation(_userId: string, friendId: string) {
    await delay(60);
    const convo = MOCK_CONVERSATIONS.find(c => c.participant?.id === friendId);
    if (convo) return convo;
    // return an empty conversation structure
    return { id: `convo_${friendId}`, participant: MOCK_FRIENDS.find(f => f.id === friendId) || { id: friendId, username: 'Unknown', rating: 1200 }, lastMessage: null, unreadCount: 0, messages: [] };
  }

  async sendMessage(fromUserId: string, toUserId: string, content: string) {
    await delay(60);
    const message = { id: String(Date.now()), from: fromUserId, to: toUserId, content, read: false, sentAt: new Date().toISOString() };
    // add to mock store
    let convo = MOCK_CONVERSATIONS.find(c => c.participant?.id === toUserId);
    if (!convo) {
      convo = { id: `convo_${toUserId}`, participant: MOCK_FRIENDS.find(f => f.id === toUserId) || { id: toUserId, username: 'Unknown', rating: 1200 }, lastMessage: message, unreadCount: 1, messages: [message] };
      MOCK_CONVERSATIONS.push(convo);
    } else {
      convo.messages.push(message);
      convo.lastMessage = message;
      convo.unreadCount = (convo.unreadCount || 0) + 1;
    }
    return message;
  }

  async markAsRead(_userId: string, conversationId: string) {
    await delay(40);
    const convo = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    if (convo) convo.unreadCount = 0;
  }

  // Clubs
  async getClubs() {
    await delay(80);
    return MOCK_CLUBS;
  }

  async getMyClubs(_userId: string) {
    await delay(60);
    return MOCK_CLUBS.filter(c => c.joined);
  }

  async joinClub(_userId: string, clubId: string) {
    await delay(80);
    const club = MOCK_CLUBS.find(c => c.id === clubId);
    if (club) {
      club.joined = true;
      club.memberCount = (club.memberCount || 0) + 1;
    }
  }

  async leaveClub(_userId: string, clubId: string) {
    await delay(80);
    const club = MOCK_CLUBS.find(c => c.id === clubId);
    if (club) {
      club.joined = false;
      club.memberCount = Math.max(0, (club.memberCount || 1) - 1);
    }
  }

  async createClub(_userId: string, name: string, description: string, isPublic: boolean) {
    await delay(100);
    const club = { id: `club_${Date.now()}`, name, description, avatar: '🏛', memberCount: 1, rating: 1200, isPublic, joined: true, admin: true, createdAt: new Date().toISOString() };
    MOCK_CLUBS.push(club);
    return club;
  }

  // Tournaments
  async getTournaments(): Promise<Tournament[]> {
    await delay(80);
    return MOCK_TOURNAMENTS.map(t => ({ ...t, format: t.format as any } as Tournament));
  }

  async joinTournament(_userId: string, tournamentId: string) {
    await delay(80);
    // no-op for mock
  }

  async leaveTournament(_userId: string, tournamentId: string) {
    await delay(80);
    // no-op for mock
  }
}

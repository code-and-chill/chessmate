/**
 * Social Context Provider - manages friends, messaging, clubs, and social features.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useApiClients } from './ApiContext';

export interface Friend {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  rating: number;
  online: boolean;
  playing: boolean;
  lastSeen?: string;
  friendSince: string;
}

export interface FriendRequest {
  id: string;
  from: {
    id: string;
    username: string;
    avatar?: string;
    rating: number;
  };
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  read: boolean;
  sentAt: string;
}

export interface Conversation {
  id: string;
  participant: Friend;
  lastMessage?: Message;
  unreadCount: number;
  messages: Message[];
}

export interface Club {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  memberCount: number;
  rating: number;
  isPublic: boolean;
  joined: boolean;
  admin: boolean;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  format: 'swiss' | 'knockout' | 'round-robin' | 'arena';
  timeControl: string;
  startTime: string;
  endTime?: string;
  participants: number;
  maxParticipants?: number;
  status: 'upcoming' | 'live' | 'finished';
  prizePool?: string;
  clubId?: string;
}

interface SocialContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  conversations: Conversation[];
  clubs: Club[];
  tournaments: Tournament[];
  isLoading: boolean;
  
  // Friends
  getFriends: () => Promise<Friend[]>;
  getFriendRequests: () => Promise<FriendRequest[]>;
  sendFriendRequest: (username: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<Array<{ id: string; username: string; rating: number }>>;
  
  // Messaging
  getConversations: () => Promise<Conversation[]>;
  getConversation: (friendId: string) => Promise<Conversation>;
  sendMessage: (friendId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  
  // Clubs
  getClubs: () => Promise<Club[]>;
  getMyClubs: () => Promise<Club[]>;
  joinClub: (clubId: string) => Promise<void>;
  leaveClub: (clubId: string) => Promise<void>;
  createClub: (name: string, description: string, isPublic: boolean) => Promise<Club>;
  
  // Tournaments
  getTournaments: () => Promise<Tournament[]>;
  joinTournament: (tournamentId: string) => Promise<void>;
  leaveTournament: (tournamentId: string) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { socialApi } = useApiClients();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getFriends = useCallback(async (): Promise<Friend[]> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      const result = await socialApi.getFriends(user.id);
      setFriends(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [user, socialApi]);

  const getFriendRequests = useCallback(async (): Promise<FriendRequest[]> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      const requests = await socialApi.getFriendRequests(user.id);
      setFriendRequests(requests);
      return requests;
    } finally {
      setIsLoading(false);
    }
  }, [user, socialApi]);

  const sendFriendRequest = useCallback(async (username: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.sendFriendRequest(user.id, username);
      console.log('Sent friend request to:', username);
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw error;
    }
  }, [user, socialApi]);

  const acceptFriendRequest = useCallback(async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.acceptFriendRequest(user.id, requestId);
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      console.log('Accepted friend request:', requestId);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      throw error;
    }
  }, [user, socialApi]);

  const declineFriendRequest = useCallback(async (requestId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.declineFriendRequest(user.id, requestId);
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      console.log('Declined friend request:', requestId);
    } catch (error) {
      console.error('Failed to decline friend request:', error);
      throw error;
    }
  }, [user, socialApi]);

  const removeFriend = useCallback(async (friendId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.removeFriend(user.id, friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
      console.log('Removed friend:', friendId);
    } catch (error) {
      console.error('Failed to remove friend:', error);
      throw error;
    }
  }, [user, socialApi]);

  const searchUsers = useCallback(async (query: string) => {
    try {
      return await socialApi.searchUsers(query);
    } catch (error) {
      console.error('Failed to search users:', error);
      throw error;
    }
  }, [socialApi]);

  const getConversations = useCallback(async (): Promise<Conversation[]> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    try {
      const convos = await socialApi.getConversations(user.id);
      setConversations(convos);
      return convos;
    } finally {
      setIsLoading(false);
    }
  }, [user, socialApi]);

  const getConversation = useCallback(async (friendId: string): Promise<Conversation> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await socialApi.getConversation(user.id, friendId);
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  }, [user, socialApi]);

  const sendMessage = useCallback(async (friendId: string, content: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.sendMessage(user.id, friendId, content);
      console.log('Sent message to:', friendId, content);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [user, socialApi]);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.markAsRead(user.id, conversationId);
      console.log('Marked as read:', conversationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
      throw error;
    }
  }, [user, socialApi]);

  const getClubs = useCallback(async (): Promise<Club[]> => {
    setIsLoading(true);
    try {
      const result = await socialApi.getClubs();
      setClubs(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [socialApi]);

  const getMyClubs = useCallback(async (): Promise<Club[]> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      return await socialApi.getMyClubs(user.id);
    } catch (error) {
      console.error('Failed to get my clubs:', error);
      throw error;
    }
  }, [user, socialApi]);

  const joinClub = useCallback(async (clubId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.joinClub(user.id, clubId);
      setClubs(prev => prev.map(c => c.id === clubId ? { ...c, joined: true, memberCount: c.memberCount + 1 } : c));
      console.log('Joined club:', clubId);
    } catch (error) {
      console.error('Failed to join club:', error);
      throw error;
    }
  }, [user, socialApi]);

  const leaveClub = useCallback(async (clubId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.leaveClub(user.id, clubId);
      setClubs(prev => prev.map(c => c.id === clubId ? { ...c, joined: false, memberCount: c.memberCount - 1 } : c));
      console.log('Left club:', clubId);
    } catch (error) {
      console.error('Failed to leave club:', error);
      throw error;
    }
  }, [user, socialApi]);

  const createClub = useCallback(async (name: string, description: string, isPublic: boolean): Promise<Club> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newClub = await socialApi.createClub(user.id, name, description, isPublic);
      setClubs(prev => [...prev, newClub]);
      return newClub;
    } catch (error) {
      console.error('Failed to create club:', error);
      throw error;
    }
  }, [user, socialApi]);

  const getTournaments = useCallback(async (): Promise<Tournament[]> => {
    setIsLoading(true);
    try {
      const result = await socialApi.getTournaments();
      setTournaments(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [socialApi]);

  const joinTournament = useCallback(async (tournamentId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.joinTournament(user.id, tournamentId);
      console.log('Joined tournament:', tournamentId);
    } catch (error) {
      console.error('Failed to join tournament:', error);
      throw error;
    }
  }, [user, socialApi]);

  const leaveTournament = useCallback(async (tournamentId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await socialApi.leaveTournament(user.id, tournamentId);
      console.log('Left tournament:', tournamentId);
    } catch (error) {
      console.error('Failed to leave tournament:', error);
      throw error;
    }
  }, [user, socialApi]);

  const value: SocialContextType = {
    friends,
    friendRequests,
    conversations,
    clubs,
    tournaments,
    isLoading,
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    searchUsers,
    getConversations,
    getConversation,
    sendMessage,
    markAsRead,
    getClubs,
    getMyClubs,
    joinClub,
    leaveClub,
    createClub,
    getTournaments,
    joinTournament,
    leaveTournament,
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}

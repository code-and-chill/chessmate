import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Card, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Input, 
  Avatar,
  useColors,
  useThemeTokens,
  InteractivePressable,
  SegmentedControl,
  Spacer,
} from '@/ui';
import { useSocial } from '@/contexts/SocialContext';
import type { Friend, FriendRequest } from '@/contexts/SocialContext';
import { spacingScale, spacingTokens, touchTargets } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { shadowTokens } from '@/ui/tokens/shadows';

type TabType = 'friends' | 'requests' | 'add';

export default function FriendsScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const { width } = useWindowDimensions();
  const {
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
  } = useSocial();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabType>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getFriendRequests(),
      ]);
      setFriends(friendsData || []);
      setRequests(requestsData || []);
    } catch (error) {
      console.error('Failed to load friends data:', error);
      setFriends([]);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [getFriends, getFriendRequests]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendRequest = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSendingRequest(true);
      await sendFriendRequest(searchQuery);
      Alert.alert('Request Sent', `Friend request sent to ${searchQuery}`);
      setSearchQuery('');
      setSelectedTab('friends');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to send friend request');
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      loadData();
      Alert.alert('Friend Added', 'You are now friends!');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to decline friend request');
    }
  };

  const handleRemoveFriend = (friendId: string, username: string) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${username} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(friendId);
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove friend');
            }
          },
        },
      ]
    );
  };

  const handleChallengeFriend = (friend: Friend) => {
    router.push({ pathname: '/play/friend', params: { friendId: friend.id } });
  };

  // Memoized filtered data
  const onlineFriends = useMemo(() => friends.filter((f) => f.online), [friends]);
  const offlineFriends = useMemo(() => friends.filter((f) => !f.online), [friends]);
  const pendingRequests = useMemo(() => requests.filter((r) => r.status === 'pending'), [requests]);

  // Responsive layout
  const isCompact = width < 640;
  const cardPadding = isCompact ? spacingTokens[3] : spacingTokens[4];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <VStack gap={spacingTokens[4]} style={styles.content}>
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <VStack gap={spacingTokens[1]}>
            <Text variant="display" weight="bold" style={styles.title}>
              Friends
            </Text>
            <Text variant="body" style={[styles.subtitle, { color: colors.foreground.secondary }]}>
              Connect with players, challenge friends, and build your chess community
            </Text>
            <HStack gap={spacingTokens[2]} style={styles.stats}>
              <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
              </Text>
              <Text variant="caption" style={{ color: colors.foreground.tertiary }}>•</Text>
              <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                {onlineFriends.length} online
              </Text>
            </HStack>
          </VStack>
        </Animated.View>

        {/* Tabs */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <SegmentedControl
            segments={['friends', 'requests', 'add']}
            selectedSegment={selectedTab}
            onSegmentChange={(tab) => setSelectedTab(tab as TabType)}
            labelFormatter={(tab) => {
              if (tab === 'friends') return `Friends (${friends.length})`;
              if (tab === 'requests') return `Requests (${pendingRequests.length})`;
              return 'Add Friend';
            }}
            style={styles.tabs}
          />
        </Animated.View>

        {/* Content */}
        {selectedTab === 'friends' && (
          <FriendsList
            onlineFriends={onlineFriends}
            offlineFriends={offlineFriends}
            onChallenge={handleChallengeFriend}
            onRemove={handleRemoveFriend}
            onMessage={(friend) => router.push({ pathname: '/social/messages', params: { friendId: friend.id } })}
            isLoading={isLoading}
            colors={colors}
            isCompact={isCompact}
          />
        )}

        {selectedTab === 'requests' && (
          <RequestsList
            requests={pendingRequests}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
            colors={colors}
            isCompact={isCompact}
          />
        )}

        {selectedTab === 'add' && (
          <AddFriendForm
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSend={handleSendRequest}
            isSending={isSendingRequest}
            colors={colors}
          />
        )}
      </VStack>
    </SafeAreaView>
  );
}

// Friend Card Component
interface FriendCardProps {
  friend: Friend;
  onChallenge: (friend: Friend) => void;
  onRemove: (friendId: string, username: string) => void;
  onMessage: (friend: Friend) => void;
  colors: ReturnType<typeof useThemeTokens>['colors'];
  index: number;
  isCompact: boolean;
}

const FriendCard: React.FC<FriendCardProps> = ({ 
  friend, 
  onChallenge, 
  onRemove, 
  onMessage,
  colors,
  index,
  isCompact,
}) => {
  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 50).duration(400)}>
      <Card variant="elevated" size="md" style={styles.friendCard}>
        <HStack gap={spacingTokens[3]} alignItems="center" style={styles.friendCardContent}>
          {/* Avatar & Info */}
          <HStack gap={spacingTokens[3]} alignItems="center" style={{ flex: 1, minWidth: 0 }}>
            <Avatar 
              name={friend.username} 
              size={isCompact ? 'md' : 'lg'}
              status={friend.online ? 'online' : 'offline'}
            />
            <VStack gap={spacingTokens[1]} style={{ flex: 1, minWidth: 0 }}>
              <HStack gap={spacingTokens[2]} alignItems="center">
                <Text 
                  variant="body" 
                  weight="semibold" 
                  style={[styles.friendName, { color: colors.foreground.primary }]}
                  numberOfLines={1}
                >
                  {friend.username}
                </Text>
              </HStack>
              <Text variant="caption" style={{ color: colors.foreground.secondary }}>
                Rating: {friend.rating}
              </Text>
            </VStack>
          </HStack>

          {/* Actions */}
          <HStack gap={spacingTokens[1]} alignItems="center">
            {friend.online && !friend.playing && (
              <InteractivePressable
                onPress={() => onChallenge(friend)}
                accessibilityLabel={`Challenge ${friend.username}`}
                hapticStyle="light"
                style={styles.actionButton}
              >
                <Text style={styles.actionIcon}>⚔️</Text>
              </InteractivePressable>
            )}
            <InteractivePressable
              onPress={() => onMessage(friend)}
              accessibilityLabel={`Message ${friend.username}`}
              hapticStyle="light"
              style={styles.actionButton}
            >
              <Text style={styles.actionIcon}>💬</Text>
            </InteractivePressable>
            <InteractivePressable
              onPress={() => onRemove(friend.id, friend.username)}
              accessibilityLabel={`Remove ${friend.username}`}
              hapticStyle="medium"
              style={[styles.actionButton, styles.removeButton]}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
            </InteractivePressable>
          </HStack>
        </HStack>
      </Card>
    </Animated.View>
  );
};

// Friends List Component
interface FriendsListProps {
  onlineFriends: Friend[];
  offlineFriends: Friend[];
  onChallenge: (friend: Friend) => void;
  onRemove: (friendId: string, username: string) => void;
  onMessage: (friend: Friend) => void;
  isLoading: boolean;
  colors: ReturnType<typeof useThemeTokens>['colors'];
  isCompact: boolean;
}

const FriendsList: React.FC<FriendsListProps> = ({
  onlineFriends,
  offlineFriends,
  onChallenge,
  onRemove,
  onMessage,
  isLoading,
  colors,
  isCompact,
}) => {
  if (isLoading) {
    return (
      <Card variant="elevated" size="md">
        <VStack gap={spacingTokens[3]} alignItems="center" style={styles.emptyState}>
          <Text variant="body" style={{ color: colors.foreground.secondary }}>
            Loading friends...
          </Text>
        </VStack>
      </Card>
    );
  }

  if (onlineFriends.length === 0 && offlineFriends.length === 0) {
    return (
      <Card variant="elevated" size="md">
        <VStack gap={spacingTokens[4]} alignItems="center" style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👥</Text>
          <VStack gap={spacingTokens[1]} alignItems="center">
            <Text variant="title" weight="semibold" style={{ color: colors.foreground.primary }}>
              No friends yet
            </Text>
            <Text variant="body" style={[styles.emptyText, { color: colors.foreground.secondary }]}>
              Add friends to play and chat together
            </Text>
          </VStack>
        </VStack>
      </Card>
    );
  }

  return (
    <VStack gap={spacingTokens[4]}>
      {onlineFriends.length > 0 && (
        <VStack gap={spacingTokens[3]}>
          <Text variant="label" weight="semibold" style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
            Online ({onlineFriends.length})
          </Text>
          {onlineFriends.map((friend, index) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onChallenge={onChallenge}
              onRemove={onRemove}
              onMessage={onMessage}
              colors={colors}
              index={index}
              isCompact={isCompact}
            />
          ))}
        </VStack>
      )}

      {offlineFriends.length > 0 && (
        <VStack gap={spacingTokens[3]}>
          <Text variant="label" weight="semibold" style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
            Offline ({offlineFriends.length})
          </Text>
          {offlineFriends.map((friend, index) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onChallenge={onChallenge}
              onRemove={onRemove}
              onMessage={onMessage}
              colors={colors}
              index={onlineFriends.length + index}
              isCompact={isCompact}
            />
          ))}
        </VStack>
      )}
    </VStack>
  );
};

// Request Card Component
interface RequestCardProps {
  request: FriendRequest;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  colors: ReturnType<typeof useThemeTokens>['colors'];
  index: number;
  isCompact: boolean;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onAccept, onDecline, colors, index, isCompact }) => {
  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 50).duration(400)}>
      <Card variant="elevated" size="md" style={styles.requestCard}>
        <HStack gap={spacingTokens[3]} alignItems="center" style={styles.requestCardContent}>
          <HStack gap={spacingTokens[3]} alignItems="center" style={{ flex: 1 }}>
            <Avatar 
              name={request.from.username} 
              size={isCompact ? 'md' : 'lg'}
              status="offline"
            />
            <VStack gap={spacingTokens[1]} style={{ flex: 1 }}>
              <Text variant="body" weight="semibold" style={{ color: colors.foreground.primary }}>
                {request.from.username}
              </Text>
              <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                {new Date(request.sentAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </VStack>
          </HStack>
          <HStack gap={spacingTokens[2]}>
            <Button
              variant="primary"
              size="sm"
              onPress={() => onAccept(request.id)}
              style={styles.acceptButton}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => onDecline(request.id)}
              style={styles.declineButton}
            >
              Decline
            </Button>
          </HStack>
        </HStack>
      </Card>
    </Animated.View>
  );
};

// Requests List Component
interface RequestsListProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  colors: ReturnType<typeof useThemeTokens>['colors'];
  isCompact: boolean;
}

const RequestsList: React.FC<RequestsListProps> = ({ requests, onAccept, onDecline, colors, isCompact }) => {
  if (requests.length === 0) {
    return (
      <Card variant="elevated" size="md">
        <VStack gap={spacingTokens[4]} alignItems="center" style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <VStack gap={spacingTokens[1]} alignItems="center">
            <Text variant="title" weight="semibold" style={{ color: colors.foreground.primary }}>
              No pending requests
            </Text>
            <Text variant="body" style={[styles.emptyText, { color: colors.foreground.secondary }]}>
              Friend requests will appear here
            </Text>
          </VStack>
        </VStack>
      </Card>
    );
  }

  return (
    <VStack gap={spacingTokens[3]}>
      {requests.map((request, index) => (
        <RequestCard
          key={request.id}
          request={request}
          onAccept={onAccept}
          onDecline={onDecline}
          colors={colors}
          index={index}
          isCompact={isCompact}
        />
      ))}
    </VStack>
  );
};

// Add Friend Form Component
interface AddFriendFormProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSend: () => void;
  isSending: boolean;
  colors: ReturnType<typeof useThemeTokens>['colors'];
}

const AddFriendForm: React.FC<AddFriendFormProps> = ({ searchQuery, onSearchChange, onSend, isSending, colors }) => {
  return (
    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
      <Card variant="elevated" size="md">
        <VStack gap={spacingTokens[4]}>
          <VStack gap={spacingTokens[1]}>
            <Text variant="title" weight="semibold" style={{ color: colors.foreground.primary }}>
              Add Friend
            </Text>
            <Text variant="body" style={{ color: colors.foreground.secondary }}>
              Enter username or email to send a friend request
            </Text>
          </VStack>
          
          <Input
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Username or email"
            autoCapitalize="none"
            variant="default"
          />
          
          <Button
            variant="primary"
            onPress={onSend}
            isLoading={isSending}
            disabled={!searchQuery.trim() || isSending}
            style={styles.sendButton}
          >
            Send Request
          </Button>
        </VStack>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacingScale.gutter,
    paddingTop: spacingTokens[3],
    paddingBottom: spacingTokens[6],
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  stats: {
    marginTop: spacingTokens[1],
  },
  tabs: {
    marginBottom: spacingTokens[2],
  },
  friendCard: {
    marginBottom: 0,
  },
  friendCardContent: {
    padding: spacingTokens[2],
    minHeight: touchTargets.minimum,
  },
  friendName: {
    fontSize: 16,
    letterSpacing: -0.2,
  },
  actionButton: {
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    borderRadius: radiusTokens.md,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadowTokens.xs,
  },
  removeButton: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  actionIcon: {
    fontSize: 18,
  },
  requestCard: {
    marginBottom: 0,
  },
  requestCardContent: {
    padding: spacingTokens[2],
    minHeight: touchTargets.minimum,
  },
  acceptButton: {
    minWidth: 80,
  },
  declineButton: {
    minWidth: 80,
  },
  sendButton: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  emptyState: {
    paddingVertical: spacingTokens[8],
    paddingHorizontal: spacingTokens[4],
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});

import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { useSocial } from '@/contexts/SocialContext';
import type { Friend, FriendRequest } from '@/contexts/SocialContext';
import { useThemeTokens } from '@/ui';

export default function FriendsScreen() {
  const router = useRouter();
  const { colors } = useThemeTokens();
  const {
    getFriends,
    getFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend,
    isLoading,
  } = useSocial();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriends(),
        getFriendRequests(),
      ]);
      setFriends(friendsData || []);
      setRequests(requestsData || []);
    } catch (error) {
      console.error('Failed to load friends data:', error);
      // Silently fail - user needs to be authenticated
      // Set empty arrays as fallback
      setFriends([]);
      setRequests([]);
    }
  };

  const handleSendRequest = async () => {
    if (!searchQuery.trim()) return;

    // In real app, search for user by username/email first
    await sendFriendRequest(searchQuery);
    Alert.alert('Request Sent', `Friend request sent to ${searchQuery}`);
    setSearchQuery('');
  };

  const handleAcceptRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
    loadData();
    Alert.alert('Friend Added', 'You are now friends!');
  };

  const handleDeclineRequest = async (requestId: string) => {
    await declineFriendRequest(requestId);
    loadData();
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
            await removeFriend(friendId);
            loadData();
          },
        },
      ]
    );
  };

  const handleChallengeFriend = (friend: Friend) => {
    Alert.alert(
      'Challenge Friend',
      `Challenge ${friend.username} to a game?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Challenge',
          onPress: () => router.push({ pathname: '/play/friend', params: { friendId: friend.id } }),
        },
      ]
    );
  };

  const renderFriendCard = ({ item, index }: { item: Friend; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <Card variant="default" size="md" style={{ marginBottom: 12 }}>
        <View style={styles.friendCard}>
          <View style={styles.friendInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.accent.primary }]}>
              <Text style={[styles.avatarText, { color: colors.accentForeground.primary }]}>
                {item.username[0].toUpperCase()}
              </Text>
            </View>
            <VStack gap={1} style={{ flex: 1 }}>
              <View style={styles.friendHeader}>
                <Text style={[styles.friendName, { color: colors.foreground.primary }]}>{item.username}</Text>
                {item.isOnline && <View style={[styles.onlineBadge, { backgroundColor: colors.success }]} />}
              </View>
              <Text style={[styles.friendRating, { color: colors.foreground.secondary }]}>Rating: {item.rating}</Text>
            </VStack>
          </View>
          
          <View style={styles.friendActions}>
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: colors.background.secondary,
                borderColor: colors.background.tertiary,
                borderWidth: 2,
              }]}
              onPress={() => handleChallengeFriend(item)}
            >
              <Text style={styles.actionButtonText}>⚔️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: colors.background.secondary,
                borderColor: colors.background.tertiary,
                borderWidth: 2,
              }]}
              onPress={() => router.push({ pathname: '/social/messages', params: { friendId: item.id } })}
            >
              <Text style={styles.actionButtonText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { 
                backgroundColor: colors.error + '20',
                borderColor: colors.error,
                borderWidth: 2,
              }]}
              onPress={() => handleRemoveFriend(item.id, item.username)}
            >
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderRequestCard = ({ item, index }: { item: FriendRequest; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <Card variant="default" size="md" style={{ marginBottom: 12 }}>
        <View style={styles.requestCard}>
          <View style={styles.requestInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.accent.primary }]}>
              <Text style={[styles.avatarText, { color: colors.accentForeground.primary }]}>
                {item.fromUsername[0].toUpperCase()}
              </Text>
            </View>
            <VStack gap={1} style={{ flex: 1 }}>
              <Text style={[styles.friendName, { color: colors.foreground.primary }]}>{item.fromUsername}</Text>
              <Text style={[styles.requestDate, { color: colors.foreground.secondary }]}>
                {new Date(item.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </VStack>
          </View>
          
          {item.status === 'pending' && (
            <View style={styles.requestActions}>
              <TouchableOpacity
                style={[styles.acceptButton, { 
                  backgroundColor: colors.success + '20',
                  borderColor: colors.success,
                  borderWidth: 2,
                }]}
                onPress={() => handleAcceptRequest(item.id)}
              >
                <Text style={[styles.acceptButtonText, { color: colors.success }]}>✓ Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.declineButton, { 
                  backgroundColor: colors.error + '20',
                  borderColor: colors.error,
                  borderWidth: 2,
                }]}
                onPress={() => handleDeclineRequest(item.id)}
              >
                <Text style={[styles.declineButtonText, { color: colors.error }]}>✗ Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Card>
    </Animated.View>
  );

  const onlineFriends = friends.filter((f) => f.isOnline);
  const offlineFriends = friends.filter((f) => !f.isOnline);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>Friends</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
              {friends.length} friends • {onlineFriends.length} online
            </Text>
          </Animated.View>

          {/* Tabs */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[
                  styles.tab, 
                  { 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.background.tertiary,
                  },
                  selectedTab === 'friends' && { 
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.accent.primary,
                  }
                ]}
                onPress={() => setSelectedTab('friends')}
              >
                <Text style={[
                  styles.tabText, 
                  { color: colors.foreground.secondary },
                  selectedTab === 'friends' && { color: colors.foreground.primary }
                ]}>
                  Friends ({friends.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab, 
                  { 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.background.tertiary,
                  },
                  selectedTab === 'requests' && { 
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.accent.primary,
                  }
                ]}
                onPress={() => setSelectedTab('requests')}
              >
                <Text style={[
                  styles.tabText, 
                  { color: colors.foreground.secondary },
                  selectedTab === 'requests' && { color: colors.foreground.primary }
                ]}>
                  Requests ({requests.filter((r) => r.status === 'pending').length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab, 
                  { 
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.background.tertiary,
                  },
                  selectedTab === 'add' && { 
                    backgroundColor: colors.background.tertiary,
                    borderColor: colors.accent.primary,
                  }
                ]}
                onPress={() => setSelectedTab('add')}
              >
                <Text style={[
                  styles.tabText, 
                  { color: colors.foreground.secondary },
                  selectedTab === 'add' && { color: colors.foreground.primary }
                ]}>
                  Add Friend
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Content */}
          {selectedTab === 'friends' && (
            <VStack gap={4}>
              {onlineFriends.length > 0 && (
                <VStack gap={2}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    Online ({onlineFriends.length})
                  </Text>
                  <FlatList
                    data={onlineFriends}
                    renderItem={renderFriendCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </VStack>
              )}
              
              {offlineFriends.length > 0 && (
                <VStack gap={2}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>
                    Offline ({offlineFriends.length})
                  </Text>
                  <FlatList
                    data={offlineFriends}
                    renderItem={renderFriendCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </VStack>
              )}

              {friends.length === 0 && (
                <Card variant="default" size="md">
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>👥</Text>
                    <Text style={[styles.emptyTitle, { color: colors.foreground.primary }]}>
                      No friends yet
                    </Text>
                    <Text style={[styles.emptyText, { color: colors.foreground.secondary }]}>
                      Add friends to play and chat together
                    </Text>
                    <TouchableOpacity
                      style={[styles.emptyButton, { backgroundColor: colors.accent.primary }]}
                      onPress={() => setSelectedTab('add')}
                    >
                      <Text style={[styles.emptyButtonText, { color: colors.accentForeground.primary }]}>
                        Add Friend
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              )}
            </VStack>
          )}

          {selectedTab === 'requests' && (
            <VStack gap={2}>
              {requests.filter((r) => r.status === 'pending').length === 0 ? (
                <Card variant="default" size="md">
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={[styles.emptyTitle, { color: colors.foreground.primary }]}>
                      No pending requests
                    </Text>
                    <Text style={[styles.emptyText, { color: colors.foreground.secondary }]}>
                      Friend requests will appear here
                    </Text>
                  </View>
                </Card>
              ) : (
                <FlatList
                  data={requests.filter((r) => r.status === 'pending')}
                  renderItem={renderRequestCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </VStack>
          )}

          {selectedTab === 'add' && (
            <Animated.View entering={FadeInDown.duration(500)}>
              <Card variant="default" size="md">
                <VStack gap={4} style={{ padding: 20 }}>
                  <Text style={[styles.addFriendTitle, { color: colors.foreground.primary }]}>
                    Add Friend
                  </Text>
                  <Text style={[styles.addFriendText, { color: colors.foreground.secondary }]}>
                    Enter username or email to send a friend request
                  </Text>
                  
                  <TextInput
                    style={[styles.searchInput, { 
                      backgroundColor: colors.background.secondary,
                      borderColor: colors.background.tertiary,
                      color: colors.foreground.primary,
                    }]}
                    placeholder="Username or email"
                    placeholderTextColor={colors.foreground.muted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                  />
                  
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      { backgroundColor: colors.accent.primary },
                      !searchQuery.trim() && { opacity: 0.5 },
                    ]}
                    onPress={handleSendRequest}
                    disabled={!searchQuery.trim()}
                  >
                    <Text style={[styles.sendButtonText, { color: colors.accentForeground.primary }]}>
                      Send Request
                    </Text>
                  </TouchableOpacity>
                </VStack>
              </Card>
            </Animated.View>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendCard: {
    padding: 16,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  friendRating: {
    fontSize: 14,
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 20,
  },
  requestCard: {
    padding: 16,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  requestDate: {
    fontSize: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  declineButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addFriendTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addFriendText: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
  },
  sendButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

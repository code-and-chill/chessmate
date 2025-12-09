import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, useThemeTokens } from '@/ui';
import { useSocial } from '@/contexts/SocialContext';
import type { Friend, FriendRequest } from '@/contexts/SocialContext';
import { GlobalContainer } from '@/ui/primitives/GlobalContainer';
import { spacingScale, spacingTokens } from '@/ui/tokens/spacing';
import { typographyTokens } from '@/ui/tokens/typography';
import { radiusScale } from '@/ui/tokens/radii';

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
  } = useSocial();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
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
    }
  }, [getFriends, getFriendRequests]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendRequest = async () => {
    if (!searchQuery.trim()) return;
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
      <Card variant="default" size="md" style={{ marginBottom: spacingScale.md }}>
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
                {item.online && <View style={[styles.onlineBadge, { backgroundColor: colors.success }]} />}
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
      <Card variant="default" size="md" style={{ marginBottom: spacingScale.md }}>
        <View style={styles.requestCard}>
          <View style={styles.requestInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.accent.primary }]}> 
              <Text style={[styles.avatarText, { color: colors.accentForeground.primary }]}> 
                {item.from.username[0].toUpperCase()}
              </Text>
            </View>
            <VStack gap={1} style={{ flex: 1 }}>
              <Text style={[styles.friendName, { color: colors.foreground.primary }]}>{item.from.username}</Text>
              <Text style={[styles.requestDate, { color: colors.foreground.secondary }]}>
                {new Date(item.sentAt).toLocaleDateString('en-US', {
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

  const onlineFriends = friends.filter((f) => f.online);
  const offlineFriends = friends.filter((f) => !f.online);

  return (
    <GlobalContainer scrollable contentContainerStyle={styles.scrollContent} style={styles.container}>
      <VStack style={styles.content} gap={6}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={[styles.title, { color: colors.foreground.primary }]}>{'Friends'}</Text>
          <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}> 
            {friends.length} friends • {onlineFriends.length} online
          </Text>
        </Animated.View>

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
                {`Friends (${friends.length})`}
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
                {`Requests (${requests.filter((r) => r.status === 'pending').length})`}
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
                {'Add Friend'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {selectedTab === 'friends' && (
          <VStack gap={4}>
            {onlineFriends.length > 0 && (
              <VStack gap={2}>
                <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}> 
                  {`Online (${onlineFriends.length})`}
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
                  {`Offline (${offlineFriends.length})`}
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
              <VStack gap={4} style={{ padding: spacingScale.cardPadding }}>
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
    </GlobalContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacingScale.sectionGap,
  },
  content: {
    paddingHorizontal: spacingScale.gutter,
    paddingTop: spacingScale.gutter,
  },
  title: {
    fontSize: typographyTokens.fontSize['4xl'],
    fontWeight: typographyTokens.fontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typographyTokens.fontSize.base,
    textAlign: 'center',
    marginTop: spacingScale.xs,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.md,
    borderRadius: radiusScale.button,
    alignItems: 'center',
    borderWidth: 2,
  },
  tabText: {
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: typographyTokens.fontSize.lg,
    fontWeight: typographyTokens.fontWeight.bold,
  },
  friendCard: {
    padding: spacingScale.cardPadding,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.gap,
    marginBottom: spacingScale.md,
  },
  avatar: {
    width: spacingScale.avatarLg,
    height: spacingScale.avatarLg,
    borderRadius: spacingScale.avatarLg / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typographyTokens.fontSize.xl,
    fontWeight: typographyTokens.fontWeight.bold,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.gap,
  },
  friendName: {
    fontSize: typographyTokens.fontSize.base,
    fontWeight: typographyTokens.fontWeight.bold,
  },
  onlineBadge: {
    width: spacingScale.sm,
    height: spacingScale.sm,
    borderRadius: spacingScale.sm / 2,
  },
  friendRating: {
    fontSize: typographyTokens.fontSize.sm,
  },
  friendActions: {
    flexDirection: 'row',
    gap: spacingScale.gap,
  },
  actionButton: {
    flex: 1,
    padding: spacingScale.md,
    borderRadius: radiusScale.button,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: typographyTokens.fontSize.xl,
  },
  requestCard: {
    padding: spacingScale.cardPadding,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingScale.gap,
    marginBottom: spacingScale.md,
  },
  requestDate: {
    fontSize: typographyTokens.fontSize.xs,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacingScale.gap,
  },
  acceptButton: {
    flex: 1,
    padding: spacingScale.md,
    borderRadius: radiusScale.button,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.bold,
  },
  declineButton: {
    flex: 1,
    padding: spacingScale.md,
    borderRadius: radiusScale.button,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: typographyTokens.fontSize.sm,
    fontWeight: typographyTokens.fontWeight.bold,
  },
  addFriendTitle: {
    fontSize: typographyTokens.fontSize.xl,
    fontWeight: typographyTokens.fontWeight.bold,
  },
  addFriendText: {
    fontSize: typographyTokens.fontSize.sm,
    lineHeight: Math.round(typographyTokens.fontSize.base * typographyTokens.lineHeight.normal),
  },
  searchInput: {
    padding: spacingScale.cardPadding,
    borderRadius: radiusScale.input,
    fontSize: typographyTokens.fontSize.base,
    borderWidth: 2,
  },
  sendButton: {
    padding: spacingScale.cardPadding,
    borderRadius: radiusScale.button,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: typographyTokens.fontSize.base,
    fontWeight: typographyTokens.fontWeight.bold,
  },
  emptyState: {
    padding: spacingScale.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: spacingTokens[9],
    marginBottom: spacingScale.md,
  },
  emptyTitle: {
    fontSize: typographyTokens.fontSize.xl,
    fontWeight: typographyTokens.fontWeight.bold,
    marginBottom: spacingScale.sm,
  },
  emptyText: {
    fontSize: typographyTokens.fontSize.sm,
    textAlign: 'center',
    marginBottom: spacingScale.xl,
  },
  emptyButton: {
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.xl,
    borderRadius: radiusScale.button,
  },
  emptyButtonText: {
    fontSize: typographyTokens.fontSize.base,
    fontWeight: typographyTokens.fontWeight.bold,
  },
});

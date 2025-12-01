/**
 * Friends View Component  
 * features/social/components/FriendsView.tsx
 */

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFriends } from '../hooks';
import type { Friend } from '../types';

export interface FriendsViewProps {
  onBack: () => void;
  userId: string;
}

export function FriendsView({ onBack, userId }: FriendsViewProps) {
  const { friends, loading, challengeFriend } = useFriends(userId);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const onlineFriends = filteredFriends.filter(f => f.online);
  const offlineFriends = filteredFriends.filter(f => !f.online);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Friends</Text>
      <Text style={styles.subtitle}>
        {friends.length} friends • {onlineFriends.length} online
      </Text>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search friends..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Add Friend Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>+ Add Friend</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.loadingText}>Loading friends...</Text>
      ) : (
        <>
          {/* Online Friends */}
          {onlineFriends.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Online Now ({onlineFriends.length})</Text>
              {onlineFriends.map(friend => (
                <FriendCard key={friend.id} friend={friend} onChallenge={challengeFriend} />
              ))}
            </View>
          )}

          {/* Offline Friends */}
          {offlineFriends.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Offline</Text>
              {offlineFriends.map(friend => (
                <FriendCard key={friend.id} friend={friend} onChallenge={challengeFriend} />
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

interface FriendCardProps {
  friend: Friend;
  onChallenge: (friendId: string) => void;
}

function FriendCard({ friend, onChallenge }: FriendCardProps) {
  return (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendAvatar}>{friend.avatar}</Text>
        <View style={styles.friendDetails}>
          <View style={styles.friendNameRow}>
            <Text style={styles.friendName}>{friend.username}</Text>
            {friend.online && <View style={styles.onlineIndicator} />}
          </View>
          <Text style={styles.friendRating}>
            {friend.rating} • {friend.online ? (friend.playing ? 'Playing' : 'Online') : friend.lastSeen}
          </Text>
        </View>
      </View>
      {friend.online && !friend.playing && (
        <TouchableOpacity style={styles.challengeButton} onPress={() => onChallenge(friend.id)}>
          <Text style={styles.challengeButtonText}>Challenge</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF9F0A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#FF9F0A',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  categorySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  friendDetails: {
    flex: 1,
  },
  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  friendRating: {
    fontSize: 13,
    color: '#666',
  },
  challengeButton: {
    backgroundColor: '#FF9F0A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  challengeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

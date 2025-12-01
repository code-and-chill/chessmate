/**
 * Social Hub Component
 * features/social/components/SocialHub.tsx
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSocialStats } from '../hooks';
import type { SocialMode } from '../types';

export interface SocialHubProps {
  onNavigate: (mode: SocialMode) => void;
  userId: string;
}

export function SocialHub({ onNavigate, userId }: SocialHubProps) {
  const { stats, loading } = useSocialStats(userId);

  if (loading || !stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Social</Text>
      <Text style={styles.subtitle}>Connect with the chess community</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Animated.View entering={FadeInDown.delay(0)} style={styles.statCard}>
          <Text style={styles.statValue}>{stats.onlineFriends}</Text>
          <Text style={styles.statLabel}>Online Friends</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statCard}>
          <Text style={styles.statValue}>{stats.clubs}</Text>
          <Text style={styles.statLabel}>Clubs</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statCard}>
          <Text style={styles.statValue}>{stats.unreadMessages}</Text>
          <Text style={styles.statLabel}>Unread</Text>
        </Animated.View>
      </View>

      {/* Main Cards */}
      <Animated.View entering={FadeInDown.delay(300)}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('friends')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👥</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Friends</Text>
              <Text style={styles.cardDescription}>See who's online • Challenge friends • View profiles</Text>
              <Text style={styles.cardProgress}>
                {stats.totalFriends} friends • {stats.onlineFriends} online
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400)}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('clubs')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏆</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Clubs</Text>
              <Text style={styles.cardDescription}>Join clubs • Compete in team matches • Club chat</Text>
              <Text style={styles.cardProgress}>Member of {stats.clubs} clubs</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500)}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('messages')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💬</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Messages</Text>
              <Text style={styles.cardDescription}>Direct messages • Club chat • Group conversations</Text>
              <Text style={styles.cardProgress}>{stats.unreadMessages} unread messages</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('leaderboard')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Leaderboards</Text>
              <Text style={styles.cardDescription}>Global rankings • Friend rankings • Club rankings</Text>
              <Text style={styles.cardProgress}>Ranked #{stats.globalRank || 'N/A'} globally</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#666',
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FF9F0A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardProgress: {
    fontSize: 13,
    color: '#FF9F0A',
    fontWeight: '500',
  },
});

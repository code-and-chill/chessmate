/**
 * Settings Hub - Main Entry Point
 * features/settings/components/SettingsHub.tsx
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useUserProfile, useUserStats } from '../hooks';
import type { SettingsMode } from '../types';

export interface SettingsHubProps {
  onNavigate: (mode: SettingsMode) => void;
  userId: string;
}

/**
 * Settings hub showing overview cards
 * Integrates with account-api and rating-api
 */
export function SettingsHub({ onNavigate, userId }: SettingsHubProps) {
  const { profile, loading: profileLoading } = useUserProfile(userId);
  const { stats, loading: statsLoading } = useUserStats(userId, 'blitz');

  const loading = profileLoading || statsLoading;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#5856D6" />
        <Text style={styles.loaderText}>Loading your settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile & Settings</Text>
      <Text style={styles.subtitle}>Customize your chess experience</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Text style={styles.profileAvatar}>{profile?.avatar || '♔'}</Text>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.username || 'Player'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || 'player@chess.com'}</Text>
          <Text style={styles.profileJoined}>
            Member since {profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Nov 2025'}
          </Text>
        </View>
      </View>

      {/* Quick Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.rating || 1650}</Text>
          <Text style={styles.statLabel}>Blitz Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.games || 0}</Text>
          <Text style={styles.statLabel}>Games Played</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.winRate.toFixed(0) || 0}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
      </View>

      {/* Navigation Cards */}
      <Animated.View entering={FadeInDown.duration(500).delay(100)}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('profile')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Profile</Text>
              <Text style={styles.cardDescription}>Edit profile • Update avatar • Bio</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(200)}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('stats')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Statistics</Text>
              <Text style={styles.cardDescription}>Rating history • Performance • Win/Loss records</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(300)}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('achievements')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏆</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Achievements</Text>
              <Text style={styles.cardDescription}>Unlock badges • Track milestones • View progress</Text>
              <Text style={styles.cardProgress}>12 of 45 unlocked</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(400)}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('preferences')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚙️</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Game Preferences</Text>
              <Text style={styles.cardDescription}>Board theme • Pieces • Sounds • Animations</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(500).delay(500)}>
        <TouchableOpacity style={styles.card} onPress={() => onNavigate('appearance')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎨</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Appearance</Text>
              <Text style={styles.cardDescription}>Theme • Language • Display settings</Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    fontSize: 64,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileJoined: {
    fontSize: 12,
    color: '#999',
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
    color: '#5856D6',
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
    color: '#5856D6',
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

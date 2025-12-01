import { View, StyleSheet } from 'react-native';
import { SocialScreen } from '@/features/social';

/**
 * Social Tab - Integrated with account-api and rating-api services
 * 
 * This tab now uses the properly structured social feature with:
 * - Service integration (account-api for friends, rating-api for leaderboards)
 * - Proper separation of concerns (hooks, components, types)
 * - Mock data support for development
 * - Following the same pattern as Settings and Play tabs
 */
export default function SocialTab() {
  // TODO: Get userId from auth context
  const userId = 'current-user-id';

  return (
    <View style={styles.container}>
      <SocialScreen userId={userId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Social</Text>
        <Text style={styles.subtitle}>Connect with the chess community</Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Online Friends</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Clubs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
        </View>

        {/* Main Cards */}
        <TouchableOpacity style={styles.card} onPress={() => setMode('friends')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👥</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Friends</Text>
              <Text style={styles.cardDescription}>See who's online • Challenge friends • View profiles</Text>
              <Text style={styles.cardProgress}>45 friends • 12 online</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setMode('clubs')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏆</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Clubs</Text>
              <Text style={styles.cardDescription}>Join clubs • Compete in team matches • Club chat</Text>
              <Text style={styles.cardProgress}>Member of 3 clubs • 128 members total</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setMode('chat')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💬</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Messages</Text>
              <Text style={styles.cardDescription}>Direct messages • Club chat • Group conversations</Text>
              <Text style={styles.cardProgress}>5 unread messages</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setMode('leaderboard')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Leaderboards</Text>
              <Text style={styles.cardDescription}>Global rankings • Friend rankings • Club rankings</Text>
              <Text style={styles.cardProgress}>Ranked #1,247 globally</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Friends view
  if (mode === 'friends') {
    const friends = [
      { id: '1', username: 'ChessMaster99', rating: 1850, online: true, playing: false, avatar: '♔' },
      { id: '2', username: 'TacticsGuru', rating: 1720, online: true, playing: true, avatar: '♕' },
      { id: '3', username: 'EndgameKing', rating: 1980, online: false, lastSeen: '2 hours ago', avatar: '♖' },
      { id: '4', username: 'BlitzQueen', rating: 1650, online: true, playing: false, avatar: '♛' },
      { id: '5', username: 'StrategyNinja', rating: 1890, online: false, lastSeen: '1 day ago', avatar: '♜' },
      { id: '6', username: 'PawnStorm', rating: 1580, online: true, playing: true, avatar: '♟' },
    ];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>45 friends • 12 online</Text>

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

        {/* Friends List */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Online Now ({friends.filter(f => f.online).length})</Text>
          {friends.filter(f => f.online).map(friend => (
            <FriendCard key={friend.id} {...friend} />
          ))}
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Offline</Text>
          {friends.filter(f => !f.online).map(friend => (
            <FriendCard key={friend.id} {...friend} />
          ))}
        </View>
      </ScrollView>
    );
  }

  // Clubs view
  if (mode === 'clubs') {
    const clubs = [
      { id: '1', name: 'Chess Enthusiasts', members: 1250, activity: 'Very Active', icon: '♔', role: 'Member' },
      { id: '2', name: 'Blitz Masters', members: 890, activity: 'Active', icon: '⚡', role: 'Admin' },
      { id: '3', name: 'Strategic Minds', members: 2100, activity: 'Moderate', icon: '🧠', role: 'Member' },
    ];

    const discoverClubs = [
      { id: '4', name: 'Endgame Academy', members: 3400, activity: 'Very Active', icon: '🎓' },
      { id: '5', name: 'Tactics Training', members: 1800, activity: 'Active', icon: '🎯' },
      { id: '6', name: 'Opening Theory Club', members: 950, activity: 'Active', icon: '📚' },
    ];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Clubs</Text>
        <Text style={styles.subtitle}>Member of 3 clubs</Text>

        {/* Create Club Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>+ Create Club</Text>
        </TouchableOpacity>

        {/* My Clubs */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>My Clubs</Text>
          {clubs.map(club => (
            <ClubCard key={club.id} {...club} />
          ))}
        </View>

        {/* Discover Clubs */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Discover</Text>
          {discoverClubs.map(club => (
            <ClubCard key={club.id} {...club} role={undefined} />
          ))}
        </View>
      </ScrollView>
    );
  }

  // Chat view
  if (mode === 'chat') {
    const conversations = [
      { id: '1', name: 'ChessMaster99', lastMessage: 'Good game! Rematch?', time: '2m ago', unread: 2, avatar: '♔', type: 'direct' },
      { id: '2', name: 'Chess Enthusiasts', lastMessage: 'Sarah: Tournament starting soon!', time: '15m ago', unread: 5, avatar: '♔', type: 'club' },
      { id: '3', name: 'TacticsGuru', lastMessage: 'Check out this puzzle', time: '1h ago', unread: 0, avatar: '♕', type: 'direct' },
      { id: '4', name: 'Blitz Masters', lastMessage: 'Mike: Anyone up for 3+0?', time: '2h ago', unread: 0, avatar: '⚡', type: 'club' },
      { id: '5', name: 'BlitzQueen', lastMessage: 'Thanks for the tips!', time: '1d ago', unread: 0, avatar: '♛', type: 'direct' },
    ];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>5 unread messages</Text>

        {/* Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Conversations List */}
        {conversations.map(conv => (
          <ChatPreview key={conv.id} {...conv} />
        ))}
      </ScrollView>
    );
  }

  // Leaderboard view
  if (mode === 'leaderboard') {
    const leaderboards = {
      global: [
        { rank: 1, username: 'MagnusCarlsen', rating: 2850, games: 15240, winRate: 68.5, avatar: '👑' },
        { rank: 2, username: 'HikaruNakamura', rating: 2820, games: 18950, winRate: 67.2, avatar: '⚡' },
        { rank: 3, username: 'FabianoCaruana', rating: 2810, games: 12780, winRate: 66.8, avatar: '🎯' },
        { rank: 1247, username: 'You', rating: 1650, games: 456, winRate: 54.2, avatar: '♟', highlight: true },
      ],
      friends: [
        { rank: 1, username: 'EndgameKing', rating: 1980, games: 890, winRate: 61.5, avatar: '♖' },
        { rank: 2, username: 'StrategyNinja', rating: 1890, games: 1240, winRate: 58.3, avatar: '♜' },
        { rank: 3, username: 'ChessMaster99', rating: 1850, games: 670, winRate: 57.8, avatar: '♔' },
        { rank: 7, username: 'You', rating: 1650, games: 456, winRate: 54.2, avatar: '♟', highlight: true },
      ],
      club: [
        { rank: 1, username: 'Sarah_Chess', rating: 1920, games: 780, winRate: 60.5, avatar: '♕' },
        { rank: 2, username: 'MikeBlitz', rating: 1875, games: 1020, winRate: 59.2, avatar: '⚡' },
        { rank: 3, username: 'TacticsPro', rating: 1840, games: 890, winRate: 58.6, avatar: '🎯' },
        { rank: 5, username: 'You', rating: 1650, games: 456, winRate: 54.2, avatar: '♟', highlight: true },
      ],
    };

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Leaderboards</Text>
        <Text style={styles.subtitle}>See where you rank</Text>

        {/* Leaderboard Tabs */}
        <View style={styles.categoryTabs}>
          <TouchableOpacity
            style={[styles.categoryTab, selectedLeaderboard === 'global' ? styles.categoryTabActive : undefined]}
            onPress={() => setSelectedLeaderboard('global')}
          >
            <Text style={[styles.categoryTabText, selectedLeaderboard === 'global' ? styles.categoryTabTextActive : undefined]}>
              Global
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryTab, selectedLeaderboard === 'friends' ? styles.categoryTabActive : undefined]}
            onPress={() => setSelectedLeaderboard('friends')}
          >
            <Text style={[styles.categoryTabText, selectedLeaderboard === 'friends' ? styles.categoryTabTextActive : undefined]}>
              Friends
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryTab, selectedLeaderboard === 'club' ? styles.categoryTabActive : undefined]}
            onPress={() => setSelectedLeaderboard('club')}
          >
            <Text style={[styles.categoryTabText, selectedLeaderboard === 'club' ? styles.categoryTabTextActive : undefined]}>
              Club
            </Text>
          </TouchableOpacity>
        </View>

        {/* Leaderboard Entries */}
        {leaderboards[selectedLeaderboard].map(entry => (
          <LeaderboardEntry key={entry.rank} {...entry} />
        ))}
      </ScrollView>
    );
  }

  return null;
}

// Helper Components

interface FriendCardProps {
  username: string;
  rating: number;
  online: boolean;
  playing?: boolean;
  lastSeen?: string;
  avatar: string;
}

function FriendCard({ username, rating, online, playing, lastSeen, avatar }: FriendCardProps) {
  return (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendAvatar}>{avatar}</Text>
        <View style={styles.friendDetails}>
          <View style={styles.friendNameRow}>
            <Text style={styles.friendName}>{username}</Text>
            {online && <View style={styles.onlineIndicator} />}
          </View>
          <Text style={styles.friendRating}>
            {rating} • {online ? (playing ? 'Playing' : 'Online') : lastSeen}
          </Text>
        </View>
      </View>
      {online && !playing && (
        <TouchableOpacity style={styles.challengeButton}>
          <Text style={styles.challengeButtonText}>Challenge</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface ClubCardProps {
  name: string;
  members: number;
  activity: string;
  icon: string;
  role?: string;
}

function ClubCard({ name, members, activity, icon, role }: ClubCardProps) {
  return (
    <View style={styles.clubCard}>
      <Text style={styles.clubIcon}>{icon}</Text>
      <View style={styles.clubDetails}>
        <Text style={styles.clubName}>{name}</Text>
        <Text style={styles.clubInfo}>
          {members.toLocaleString()} members • {activity}
        </Text>
        {role && <Text style={styles.clubRole}>{role}</Text>}
      </View>
      <TouchableOpacity style={role ? styles.viewButton : styles.joinButton}>
        <Text style={role ? styles.viewButtonText : styles.joinButtonText}>
          {role ? 'View' : 'Join'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface ChatPreviewProps {
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  type: 'direct' | 'club';
}

function ChatPreview({ name, lastMessage, time, unread, avatar, type }: ChatPreviewProps) {
  return (
    <TouchableOpacity style={styles.chatPreview}>
      <Text style={styles.chatAvatar}>{avatar}</Text>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, unread > 0 ? styles.chatNameUnread : undefined]}>{name}</Text>
          <Text style={styles.chatTime}>{time}</Text>
        </View>
        <Text style={[styles.chatMessage, unread > 0 ? styles.chatMessageUnread : undefined]} numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>
      {unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

interface LeaderboardEntryProps {
  rank: number;
  username: string;
  rating: number;
  games: number;
  winRate: number;
  avatar: string;
  highlight?: boolean;
}

function LeaderboardEntry({ rank, username, rating, games, winRate, avatar, highlight }: LeaderboardEntryProps) {
  return (
    <View style={[styles.leaderboardEntry, highlight ? styles.leaderboardEntryHighlight : undefined]}>
      <Text style={styles.leaderboardRank}>#{rank}</Text>
      <Text style={styles.leaderboardAvatar}>{avatar}</Text>
      <View style={styles.leaderboardDetails}>
        <Text style={[styles.leaderboardName, highlight ? styles.leaderboardNameHighlight : undefined]}>{username}</Text>
        <Text style={styles.leaderboardStats}>
          {games.toLocaleString()} games • {winRate}% win rate
        </Text>
      </View>
      <Text style={[styles.leaderboardRating, highlight ? styles.leaderboardRatingHighlight : undefined]}>{rating}</Text>
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
  categorySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    alignItems: 'center',
  },
  categoryTabActive: {
    backgroundColor: '#FF9F0A',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  categoryTabTextActive: {
    color: '#fff',
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
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  clubIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  clubDetails: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  clubInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  clubRole: {
    fontSize: 12,
    color: '#FF9F0A',
    fontWeight: '600',
  },
  viewButton: {
    borderWidth: 1,
    borderColor: '#FF9F0A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewButtonText: {
    color: '#FF9F0A',
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#FF9F0A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
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
  chatAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  chatNameUnread: {
    fontWeight: '700',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatMessageUnread: {
    color: '#000',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#FF9F0A',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
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
  leaderboardEntryHighlight: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FF9F0A',
  },
  leaderboardRank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    width: 50,
  },
  leaderboardAvatar: {
    fontSize: 28,
    marginRight: 12,
  },
  leaderboardDetails: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  leaderboardNameHighlight: {
    color: '#FF9F0A',
    fontWeight: '700',
  },
  leaderboardStats: {
    fontSize: 13,
    color: '#666',
  },
  leaderboardRating: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  leaderboardRatingHighlight: {
    color: '#FF9F0A',
  },
});

import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

type SettingsMode = 'hub' | 'profile' | 'stats' | 'achievements' | 'preferences' | 'appearance';

export default function SettingsTab() {
  const router = useRouter();
  const [mode, setMode] = useState<SettingsMode>('hub');
  const [selectedTimeControl, setSelectedTimeControl] = useState<'blitz' | 'rapid' | 'classical'>('blitz');

  // Hub view - main settings sections
  if (mode === 'hub') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile & Settings</Text>
        <Text style={styles.subtitle}>Customize your chess experience</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Text style={styles.profileAvatar}>♔</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>ChessPlayer2025</Text>
            <Text style={styles.profileEmail}>player@chess.com</Text>
            <Text style={styles.profileJoined}>Member since Nov 2025</Text>
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1650</Text>
            <Text style={styles.statLabel}>Blitz Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>456</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>54%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>

        {/* Main Cards */}
        <TouchableOpacity style={styles.card} onPress={() => setMode('profile')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Profile</Text>
              <Text style={styles.cardDescription}>Edit profile • Update avatar • Bio</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setMode('stats')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Statistics</Text>
              <Text style={styles.cardDescription}>Rating history • Performance • Win/Loss records</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setMode('achievements')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏆</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Achievements</Text>
              <Text style={styles.cardDescription}>Unlock badges • Track milestones • View progress</Text>
              <Text style={styles.cardProgress}>12 of 45 unlocked</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setMode('preferences')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚙️</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Game Preferences</Text>
              <Text style={styles.cardDescription}>Board theme • Pieces • Sounds • Animations</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => setMode('appearance')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🎨</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Appearance</Text>
              <Text style={styles.cardDescription}>Theme • Language • Display settings</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Profile view
  if (mode === 'profile') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your chess profile</Text>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Text style={styles.avatarLarge}>♔</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Change Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Form */}
        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Username</Text>
          <View style={styles.formInput}>
            <Text style={styles.formInputText}>ChessPlayer2025</Text>
          </View>

          <Text style={styles.formLabel}>Email</Text>
          <View style={styles.formInput}>
            <Text style={styles.formInputText}>player@chess.com</Text>
          </View>

          <Text style={styles.formLabel}>Bio</Text>
          <View style={[styles.formInput, styles.formTextArea]}>
            <Text style={styles.formInputText}>Chess enthusiast learning to improve my game. Love tactics and endgames!</Text>
          </View>

          <Text style={styles.formLabel}>Country</Text>
          <View style={styles.formInput}>
            <Text style={styles.formInputText}>🇺🇸 United States</Text>
          </View>

          <TouchableOpacity style={[styles.button, { marginTop: 20 }]}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Stats view
  if (mode === 'stats') {
    const stats = {
      blitz: { rating: 1650, peak: 1720, games: 245, wins: 138, losses: 87, draws: 20, winRate: 56.3 },
      rapid: { rating: 1580, peak: 1640, games: 156, wins: 82, losses: 64, draws: 10, winRate: 52.6 },
      classical: { rating: 1720, peak: 1780, games: 55, wins: 32, losses: 18, draws: 5, winRate: 58.2 },
    };

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>Your chess performance</Text>

        {/* Time Control Tabs */}
        <View style={styles.categoryTabs}>
          <TouchableOpacity
            style={[styles.categoryTab, selectedTimeControl === 'blitz' ? styles.categoryTabActive : undefined]}
            onPress={() => setSelectedTimeControl('blitz')}
          >
            <Text style={[styles.categoryTabText, selectedTimeControl === 'blitz' ? styles.categoryTabTextActive : undefined]}>
              Blitz
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryTab, selectedTimeControl === 'rapid' ? styles.categoryTabActive : undefined]}
            onPress={() => setSelectedTimeControl('rapid')}
          >
            <Text style={[styles.categoryTabText, selectedTimeControl === 'rapid' ? styles.categoryTabTextActive : undefined]}>
              Rapid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryTab, selectedTimeControl === 'classical' ? styles.categoryTabActive : undefined]}
            onPress={() => setSelectedTimeControl('classical')}
          >
            <Text style={[styles.categoryTabText, selectedTimeControl === 'classical' ? styles.categoryTabTextActive : undefined]}>
              Classical
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rating Card */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingLabel}>Current Rating</Text>
          <Text style={styles.ratingValue}>{stats[selectedTimeControl].rating}</Text>
          <Text style={styles.ratingPeak}>Peak: {stats[selectedTimeControl].peak}</Text>
        </View>

        {/* Win/Loss Record */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Record</Text>
          <View style={styles.recordGrid}>
            <View style={styles.recordItem}>
              <Text style={styles.recordValue}>{stats[selectedTimeControl].games}</Text>
              <Text style={styles.recordLabel}>Games</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={[styles.recordValue, { color: '#34C759' }]}>{stats[selectedTimeControl].wins}</Text>
              <Text style={styles.recordLabel}>Wins</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={[styles.recordValue, { color: '#FF3B30' }]}>{stats[selectedTimeControl].losses}</Text>
              <Text style={styles.recordLabel}>Losses</Text>
            </View>
            <View style={styles.recordItem}>
              <Text style={[styles.recordValue, { color: '#FF9F0A' }]}>{stats[selectedTimeControl].draws}</Text>
              <Text style={styles.recordLabel}>Draws</Text>
            </View>
          </View>
          <View style={styles.winRateBar}>
            <View style={[styles.winRateFill, { width: `${stats[selectedTimeControl].winRate}%` }]} />
          </View>
          <Text style={styles.winRateText}>{stats[selectedTimeControl].winRate}% Win Rate</Text>
        </View>

        {/* Performance Insights */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Performance Insights</Text>
          <InsightRow icon="🎯" label="Best Opening" value="Italian Game (62% win rate)" />
          <InsightRow icon="⚡" label="Average Move Time" value="8.5 seconds" />
          <InsightRow icon="🔥" label="Current Streak" value="3 wins" />
          <InsightRow icon="📈" label="Rating Trend" value="+45 this month" />
        </View>

        {/* Recent Games */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Games</Text>
          <RecentGameRow result="win" opponent="TacticsMaster" rating={1680} date="2 hours ago" />
          <RecentGameRow result="loss" opponent="EndgameKing" rating={1820} date="5 hours ago" />
          <RecentGameRow result="win" opponent="BlitzQueen" rating={1620} date="Yesterday" />
        </View>
      </ScrollView>
    );
  }

  // Achievements view
  if (mode === 'achievements') {
    const achievements = [
      { id: 1, title: 'First Victory', description: 'Win your first game', unlocked: true, icon: '🎉', date: 'Nov 15, 2025' },
      { id: 2, title: '100 Games', description: 'Play 100 games', unlocked: true, icon: '💯', date: 'Nov 16, 2025' },
      { id: 3, title: 'Tactical Genius', description: 'Solve 50 puzzles', unlocked: true, icon: '🧩', date: 'Nov 17, 2025' },
      { id: 4, title: 'Rating Milestone', description: 'Reach 1600 rating', unlocked: true, icon: '📊', date: 'Nov 17, 2025' },
      { id: 5, title: 'Win Streak', description: 'Win 5 games in a row', unlocked: false, icon: '🔥', progress: '3/5' },
      { id: 6, title: '500 Games', description: 'Play 500 games', unlocked: false, icon: '🎮', progress: '456/500' },
      { id: 7, title: 'Checkmate Master', description: 'Deliver 100 checkmates', unlocked: false, icon: '♔', progress: '67/100' },
      { id: 8, title: 'Tournament Winner', description: 'Win a tournament', unlocked: false, icon: '🏆', progress: '0/1' },
    ];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>12 of 45 unlocked</Text>

        {/* Progress Bar */}
        <View style={styles.achievementProgress}>
          <View style={styles.achievementProgressBar}>
            <View style={[styles.achievementProgressFill, { width: '27%' }]} />
          </View>
          <Text style={styles.achievementProgressText}>27% Complete</Text>
        </View>

        {/* Unlocked Achievements */}
        <Text style={styles.sectionTitle}>Unlocked</Text>
        {achievements.filter(a => a.unlocked).map(achievement => (
          <AchievementBadge key={achievement.id} {...achievement} />
        ))}

        {/* Locked Achievements */}
        <Text style={styles.sectionTitle}>In Progress</Text>
        {achievements.filter(a => !a.unlocked).map(achievement => (
          <AchievementBadge key={achievement.id} {...achievement} />
        ))}
      </ScrollView>
    );
  }

  // Preferences view
  if (mode === 'preferences') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Game Preferences</Text>
        <Text style={styles.subtitle}>Customize your gameplay</Text>

        {/* Board & Pieces */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Board & Pieces</Text>
          <PreferenceRow label="Board Theme" value="Brown" />
          <PreferenceRow label="Piece Set" value="Classic" />
          <PreferenceRow label="Board Coordinates" value="On" />
          <PreferenceRow label="Move Highlighting" value="On" />
        </View>

        {/* Gameplay */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Gameplay</Text>
          <PreferenceRow label="Auto-Queen Promotion" value="Off" />
          <PreferenceRow label="Show Legal Moves" value="On" />
          <PreferenceRow label="Premoves" value="On" />
          <PreferenceRow label="Confirm Moves" value="Off" />
        </View>

        {/* Sounds & Animations */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sounds & Animations</Text>
          <PreferenceRow label="Sound Effects" value="On" />
          <PreferenceRow label="Move Animation" value="Fast" />
          <PreferenceRow label="Piece Animation" value="On" />
          <PreferenceRow label="Vibration" value="On" />
        </View>

        {/* Analysis */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Analysis</Text>
          <PreferenceRow label="Post-Game Analysis" value="Automatic" />
          <PreferenceRow label="Show Engine Lines" value="On" />
          <PreferenceRow label="Evaluation Bar" value="On" />
          <PreferenceRow label="Best Move Hints" value="After Game" />
        </View>
      </ScrollView>
    );
  }

  // Appearance view
  if (mode === 'appearance') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => setMode('hub')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Appearance</Text>
        <Text style={styles.subtitle}>Personalize your interface</Text>

        {/* Theme */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity style={[styles.themeOption, styles.themeOptionActive]}>
              <Text style={styles.themeIcon}>☀️</Text>
              <Text style={styles.themeLabel}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.themeOption}>
              <Text style={styles.themeIcon}>🌙</Text>
              <Text style={styles.themeLabel}>Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.themeOption}>
              <Text style={styles.themeIcon}>🔄</Text>
              <Text style={styles.themeLabel}>Auto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Display */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Display</Text>
          <PreferenceRow label="Language" value="English" />
          <PreferenceRow label="Time Format" value="12-hour" />
          <PreferenceRow label="Notation Style" value="Algebraic" />
          <PreferenceRow label="Font Size" value="Medium" />
        </View>

        {/* Accessibility */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <PreferenceRow label="High Contrast" value="Off" />
          <PreferenceRow label="Reduce Motion" value="Off" />
          <PreferenceRow label="Screen Reader" value="Off" />
          <PreferenceRow label="Large Text" value="Off" />
        </View>
      </ScrollView>
    );
  }

  return null;
}

// Helper Components

interface InsightRowProps {
  icon: string;
  label: string;
  value: string;
}

function InsightRow({ icon, label, value }: InsightRowProps) {
  return (
    <View style={styles.insightRow}>
      <Text style={styles.insightIcon}>{icon}</Text>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={styles.insightValue}>{value}</Text>
    </View>
  );
}

interface RecentGameRowProps {
  result: 'win' | 'loss' | 'draw';
  opponent: string;
  rating: number;
  date: string;
}

function RecentGameRow({ result, opponent, rating, date }: RecentGameRowProps) {
  const resultColors = {
    win: '#34C759',
    loss: '#FF3B30',
    draw: '#FF9F0A',
  };

  const resultSymbols = {
    win: '✓',
    loss: '✗',
    draw: '=',
  };

  return (
    <View style={styles.recentGameRow}>
      <View style={[styles.resultBadge, { backgroundColor: resultColors[result] }]}>
        <Text style={styles.resultSymbol}>{resultSymbols[result]}</Text>
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.opponentName}>{opponent} ({rating})</Text>
        <Text style={styles.gameDate}>{date}</Text>
      </View>
    </View>
  );
}

interface AchievementBadgeProps {
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  date?: string;
  progress?: string;
}

function AchievementBadge({ title, description, unlocked, icon, date, progress }: AchievementBadgeProps) {
  return (
    <View style={[styles.achievementBadge, !unlocked ? styles.achievementBadgeLocked : undefined]}>
      <Text style={[styles.achievementIcon, !unlocked ? styles.achievementIconLocked : undefined]}>{icon}</Text>
      <View style={styles.achievementDetails}>
        <Text style={[styles.achievementTitle, !unlocked ? styles.achievementTitleLocked : undefined]}>{title}</Text>
        <Text style={styles.achievementDescription}>{description}</Text>
        {unlocked && date && <Text style={styles.achievementDate}>Unlocked on {date}</Text>}
        {!unlocked && progress && <Text style={styles.achievementProgress2}>Progress: {progress}</Text>}
      </View>
    </View>
  );
}

interface PreferenceRowProps {
  label: string;
  value: string;
}

function PreferenceRow({ label, value }: PreferenceRowProps) {
  return (
    <View style={styles.preferenceRow}>
      <Text style={styles.preferenceLabel}>{label}</Text>
      <Text style={styles.preferenceValue}>{value}</Text>
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
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5856D6',
  },
  button: {
    backgroundColor: '#5856D6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarLarge: {
    fontSize: 96,
    marginBottom: 16,
  },
  formSection: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formTextArea: {
    minHeight: 80,
  },
  formInputText: {
    fontSize: 16,
    color: '#000',
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
    backgroundColor: '#5856D6',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#5856D6',
    marginBottom: 4,
  },
  ratingPeak: {
    fontSize: 14,
    color: '#999',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  recordGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  recordItem: {
    alignItems: 'center',
  },
  recordValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 12,
    color: '#666',
  },
  winRateBar: {
    height: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  winRateFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  winRateText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    textAlign: 'center',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 30,
  },
  insightLabel: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  insightValue: {
    fontSize: 14,
    color: '#5856D6',
    fontWeight: '600',
  },
  recentGameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  resultBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultSymbol: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameInfo: {
    flex: 1,
  },
  opponentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  gameDate: {
    fontSize: 13,
    color: '#666',
  },
  achievementProgress: {
    marginBottom: 24,
  },
  achievementProgressBar: {
    height: 12,
    backgroundColor: '#f2f2f7',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#5856D6',
    borderRadius: 6,
  },
  achievementProgressText: {
    fontSize: 14,
    color: '#5856D6',
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementBadgeLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  achievementIconLocked: {
    opacity: 0.5,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#666',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#5856D6',
    fontWeight: '500',
  },
  achievementProgress2: {
    fontSize: 12,
    color: '#FF9F0A',
    fontWeight: '500',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  preferenceLabel: {
    fontSize: 15,
    color: '#000',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#5856D6',
    fontWeight: '600',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionActive: {
    borderColor: '#5856D6',
    backgroundColor: '#EAE9FF',
  },
  themeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

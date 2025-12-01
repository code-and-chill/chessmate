/**
 * Achievements View Component
 * features/settings/components/AchievementsView.tsx
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface AchievementsViewProps {
  onBack: () => void;
  userId: string;
}

const MOCK_ACHIEVEMENTS = [
  { id: 1, title: 'First Victory', description: 'Win your first game', unlocked: true, icon: '🎉', date: 'Nov 15, 2025' },
  { id: 2, title: '100 Games', description: 'Play 100 games', unlocked: true, icon: '💯', date: 'Nov 16, 2025' },
  { id: 3, title: 'Tactical Genius', description: 'Solve 50 puzzles', unlocked: true, icon: '🧩', date: 'Nov 17, 2025' },
  { id: 4, title: 'Rating Milestone', description: 'Reach 1600 rating', unlocked: true, icon: '📊', date: 'Nov 17, 2025' },
  { id: 5, title: 'Win Streak', description: 'Win 5 games in a row', unlocked: false, icon: '🔥', progress: '3/5' },
  { id: 6, title: '500 Games', description: 'Play 500 games', unlocked: false, icon: '🎮', progress: '456/500' },
  { id: 7, title: 'Checkmate Master', description: 'Deliver 100 checkmates', unlocked: false, icon: '♔', progress: '67/100' },
  { id: 8, title: 'Tournament Winner', description: 'Win a tournament', unlocked: false, icon: '🏆', progress: '0/1' },
];

export function AchievementsView({ onBack }: AchievementsViewProps) {
  const unlockedCount = MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length;
  const totalCount = MOCK_ACHIEVEMENTS.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.subtitle}>{unlockedCount} of {totalCount} unlocked</Text>

      {/* Progress Bar */}
      <View style={styles.achievementProgress}>
        <View style={styles.achievementProgressBar}>
          <View style={[styles.achievementProgressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.achievementProgressText}>{progressPercent}% Complete</Text>
      </View>

      {/* Unlocked Achievements */}
      <Text style={styles.sectionTitle}>Unlocked</Text>
      {MOCK_ACHIEVEMENTS.filter(a => a.unlocked).map(achievement => (
        <AchievementBadge key={achievement.id} {...achievement} />
      ))}

      {/* Locked Achievements */}
      <Text style={styles.sectionTitle}>In Progress</Text>
      {MOCK_ACHIEVEMENTS.filter(a => !a.unlocked).map(achievement => (
        <AchievementBadge key={achievement.id} {...achievement} />
      ))}
    </ScrollView>
  );
}

function AchievementBadge({ title, description, unlocked, icon, date, progress }: {
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  date?: string;
  progress?: string;
}) {
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
    color: '#5856D6',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
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
});

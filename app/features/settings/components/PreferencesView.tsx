/**
 * Preferences View Component
 * features/settings/components/PreferencesView.tsx
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUserPreferences } from '../hooks';

export interface PreferencesViewProps {
  onBack: () => void;
  userId: string;
}

// Helper to format animation level for display
const formatAnimationLevel = (level: string | undefined): string => {
  if (!level) return 'Full';
  return level.charAt(0).toUpperCase() + level.slice(1);
};

// Helper to format time control for display
const formatTimeControl = (tc: string | undefined): string => {
  if (!tc) return 'Blitz';
  return tc.charAt(0).toUpperCase() + tc.slice(1);
};

// Helper to format theme name for display
const formatTheme = (theme: string | undefined): string => {
  if (!theme) return 'Classic';
  return theme.charAt(0).toUpperCase() + theme.slice(1);
};

export function PreferencesView({ onBack, userId }: PreferencesViewProps) {
  const { preferences } = useUserPreferences(userId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Game Preferences</Text>
      <Text style={styles.subtitle}>Customize your gameplay</Text>

      {/* Board & Pieces */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Board & Pieces</Text>
        <PreferenceRow label="Board Theme" value={formatTheme(preferences?.board_theme)} />
        <PreferenceRow label="Piece Set" value={formatTheme(preferences?.piece_set)} />
        <PreferenceRow label="Board Coordinates" value={preferences?.show_coordinates ? 'On' : 'Off'} />
        <PreferenceRow label="Legal Move Hints" value={preferences?.highlight_legal_moves ? 'On' : 'Off'} />
      </View>

      {/* Gameplay */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Gameplay</Text>
        <PreferenceRow label="Auto-Queen Promotion" value={preferences?.auto_queen_promotion ? 'On' : 'Off'} />
        <PreferenceRow label="Confirm Moves" value={preferences?.confirm_moves ? 'On' : 'Off'} />
        <PreferenceRow label="Default Time Control" value={formatTimeControl(preferences?.default_time_control)} />
      </View>

      {/* Sounds & Animations */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sounds & Animations</Text>
        <PreferenceRow label="Sound Effects" value={preferences?.sound_enabled ? 'On' : 'Off'} />
        <PreferenceRow label="Animation Level" value={formatAnimationLevel(preferences?.animation_level)} />
        <PreferenceRow label="Piece Animation" value={preferences?.piece_animation ? 'On' : 'Off'} />
        <PreferenceRow label="Vibration" value={preferences?.vibration ? 'On' : 'Off'} />
      </View>

      {/* Analysis (Frontend-only for now) */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Analysis</Text>
        <PreferenceRow label="Post-Game Analysis" value={formatTheme(preferences?.post_game_analysis || 'automatic')} />
        <PreferenceRow label="Show Engine Lines" value={preferences?.show_engine_lines ? 'On' : 'Off'} />
        <PreferenceRow label="Evaluation Bar" value={preferences?.evaluation_bar ? 'On' : 'Off'} />
        <PreferenceRow label="Best Move Hints" value={formatTheme(preferences?.best_move_hints || 'after_game')} />
      </View>
    </ScrollView>
  );
}

function PreferenceRow({ label, value }: { label: string; value: string }) {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
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
});

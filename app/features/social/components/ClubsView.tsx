/**
 * Clubs View Component (Placeholder)
 * features/social/components/ClubsView.tsx
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';

export interface ClubsViewProps {
  onBack: () => void;
  userId: string;
}

export function ClubsView({ onBack }: ClubsViewProps) {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  // Mock clubs data - TODO: Create useClubs hook when clubs API is available
  const myClubs = [
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background.primary }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('social.clubs')}</Text>
      <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{ti('social.member_of_clubs', { count: myClubs.length })}</Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent.primary }]}>
        <Text style={[styles.buttonText, { color: colors.accentForeground.primary }]}>+ {t('social.create_club')}</Text>
      </TouchableOpacity>

      <View style={styles.categorySection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{t('social.my_clubs')}</Text>
        {myClubs.map(club => <ClubCard key={club.id} {...club} colors={colors} t={t} ti={ti} />)}
      </View>

      <View style={styles.categorySection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{t('social.discover_clubs')}</Text>
        {discoverClubs.map(club => <ClubCard key={club.id} {...club} role={undefined} colors={colors} t={t} ti={ti} />)}
      </View>
    </ScrollView>
  );
}

function ClubCard({ name, members, activity, icon, role, colors, t, ti }: any) {
  return (
    <View style={[styles.clubCard, { backgroundColor: colors.background.secondary }]}>
      <Text style={styles.clubIcon}>{icon}</Text>
      <View style={styles.clubDetails}>
        <Text style={[styles.clubName, { color: colors.foreground.primary }]}>{name}</Text>
        <Text style={[styles.clubInfo, { color: colors.foreground.secondary }]}>{ti('social.club_members', { count: members })} • {activity}</Text>
        {role && <Text style={[styles.clubRole, { color: colors.accent.primary }]}>{role}</Text>}
      </View>
      <TouchableOpacity style={[role ? styles.viewButton : styles.joinButton, { backgroundColor: role ? 'transparent' : colors.accent.primary, borderColor: colors.accent.primary }]}>
        <Text style={[role ? styles.viewButtonText : styles.joinButtonText, { color: role ? colors.accent.primary : colors.accentForeground.primary }]}>{role ? t('social.view') : t('social.join')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 24 },
  button: { borderRadius: 10, padding: 16, marginBottom: 20, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  categorySection: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  clubCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 16, marginBottom: 12, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  clubIcon: { fontSize: 32, marginRight: 12 },
  clubDetails: { flex: 1 },
  clubName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  clubInfo: { fontSize: 13, marginBottom: 4 },
  clubRole: { fontSize: 12, fontWeight: '600' },
  viewButton: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  viewButtonText: { fontSize: 14, fontWeight: '600' },
  joinButton: { borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  joinButtonText: { fontSize: 14, fontWeight: '600' },
});

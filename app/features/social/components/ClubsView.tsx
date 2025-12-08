/**
 * Clubs View Component (Placeholder)
 * features/social/components/ClubsView.tsx
 */

import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack, InteractivePressable } from '@/ui';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <VStack style={styles.content} gap={6}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)}>
            <VStack gap={1} style={styles.header}>
              <InteractivePressable onPress={onBack} style={styles.backButton}>
                <Text style={[styles.backButtonText, { color: colors.accent.primary }]}>← {t('common.back')}</Text>
              </InteractivePressable>
              <Text style={[styles.title, { color: colors.foreground.primary }]}>{t('social.clubs')}</Text>
              <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>{ti('social.member_of_clubs', { count: myClubs.length })}</Text>
            </VStack>
          </Animated.View>

          {/* Create Club Button Card */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <Card variant="gradient" size="md" style={{ padding: 20 }}>
              <InteractivePressable style={[styles.createButton, { backgroundColor: colors.accent.primary }]} onPress={() => { /* TODO: create club */ }}>
                <Text style={styles.createButtonText}>+ {t('social.create_club')}</Text>
              </InteractivePressable>
            </Card>
          </Animated.View>

          {/* My Clubs Section */}
          <VStack gap={3}>
            <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{t('social.my_clubs')}</Text>
            {myClubs.map((club, index) => (
              <Animated.View key={club.id} entering={FadeInDown.delay(300 + index * 50).duration(400)}>
                <ClubCard {...club} colors={colors} t={t} ti={ti} />
              </Animated.View>
            ))}
          </VStack>

          {/* Discover Clubs Section */}
          <VStack gap={3}>
            <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>{t('social.discover_clubs')}</Text>
            {discoverClubs.map((club, index) => (
              <Animated.View key={club.id} entering={FadeInDown.delay(400 + index * 50).duration(400)}>
                <ClubCard {...club} role={undefined} colors={colors} t={t} ti={ti} />
              </Animated.View>
            ))}
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function ClubCard({ name, members, activity, icon, role, colors, t, ti }: any) {
  return (
    <Card variant="default" size="md">
      <View style={styles.clubCard}>
        <HStack gap={3} style={{ flex: 1, alignItems: 'center' }}>
          <View style={[styles.iconBadge, { backgroundColor: colors.accent.primary + '15' }]}>
            <Text style={styles.clubIcon}>{icon}</Text>
          </View>
          <VStack gap={1} style={{ flex: 1 }}>
            <Text style={[styles.clubName, { color: colors.foreground.primary }]}>{name}</Text>
            <Text style={[styles.clubInfo, { color: colors.foreground.secondary }]}>{ti('social.club_members', { count: members })} • {activity}</Text>
            {role && <Text style={[styles.clubRole, { color: colors.accent.primary }]}>👤 {role}</Text>}
          </VStack>
        </HStack>
        <InteractivePressable style={[role ? styles.viewButton : styles.joinButton, { backgroundColor: role ? 'transparent' : colors.accent.primary, borderColor: colors.accent.primary }]} onPress={() => { /* TODO: join/view */ }}>
          <Text style={[role ? styles.viewButtonText : styles.joinButtonText, { color: role ? colors.accent.primary : '#FFFFFF' }]}>{role ? t('social.view') : t('social.join')}</Text>
        </InteractivePressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    paddingTop: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: { marginBottom: 8 },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 17, fontWeight: '500', lineHeight: 24 },
  createButton: { borderRadius: 10, padding: 14, alignItems: 'center' },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginBottom: 12 },
  clubCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubIcon: { fontSize: 24 },
  clubName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  clubInfo: { fontSize: 14, fontWeight: '500' },
  clubRole: { fontSize: 13, fontWeight: '600' },
  viewButton: { borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  viewButtonText: { fontSize: 14, fontWeight: '600' },
  joinButton: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  joinButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});

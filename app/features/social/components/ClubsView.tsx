import { SafeAreaView, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack, Button, Text, Box, useThemeTokens, spacingTokens, radiusTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import { useReducedMotion } from '@/features/board/hooks/useReducedMotion';

export interface ClubsViewProps {
  onBack: () => void;
  userId: string;
}

export function ClubsView({ onBack }: ClubsViewProps) {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const reduceMotion = useReducedMotion();
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

  const createAnim = (delay: number) => reduceMotion ? undefined : FadeInUp.delay(delay).duration(400);
  const createAnimDown = (delay: number) => reduceMotion ? undefined : FadeInDown.delay(delay).duration(400);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacingTokens[5], paddingBottom: spacingTokens[7] }} showsVerticalScrollIndicator={false}>
        <VStack style={{ paddingTop: spacingTokens[5], maxWidth: 600, alignSelf: 'center', width: '100%' }} gap={6}>
          {/* Header */}
          <Animated.View entering={createAnim(100)}>
            <VStack gap={1} style={{ marginBottom: spacingTokens[2] }}>
              <Button variant="ghost" size="sm" onPress={onBack} style={{ alignSelf: 'flex-start', paddingVertical: spacingTokens[2], marginBottom: spacingTokens[3] }}>
                ← {t('common.back')}
              </Button>
              <Text variant="heading" color={colors.accent.primary} style={{ letterSpacing: -0.5, marginBottom: spacingTokens[2] }}>{t('social.clubs')}</Text>
              <Text variant="body" color={colors.foreground.secondary} style={{ lineHeight: 24 }}>{ti('social.member_of_clubs', { count: myClubs.length })}</Text>
            </VStack>
          </Animated.View>

          {/* Create Club Button Card */}
          <Animated.View entering={createAnimDown(200)}>
            <Card variant="gradient" size="md" padding={spacingTokens[5]}>
              <Button variant="primary" size="lg" onPress={() => { /* TODO: create club */ }}>
                + {t('social.create_club')}
              </Button>
            </Card>
          </Animated.View>

          {/* My Clubs Section */}
          <VStack gap={3}>
            <Text variant="title" color={colors.foreground.primary} style={{ letterSpacing: -0.3, marginBottom: spacingTokens[3] }}>{t('social.my_clubs')}</Text>
            {myClubs.map((club, index) => (
              <Animated.View key={club.id} entering={createAnimDown(300 + index * 50)}>
                <ClubCard {...club} colors={colors} t={t} ti={ti} />
              </Animated.View>
            ))}
          </VStack>

          {/* Discover Clubs Section */}
          <VStack gap={3}>
            <Text variant="title" color={colors.foreground.primary} style={{ letterSpacing: -0.3, marginBottom: spacingTokens[3] }}>{t('social.discover_clubs')}</Text>
            {discoverClubs.map((club, index) => (
              <Animated.View key={club.id} entering={createAnimDown(400 + index * 50)}>
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
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" padding={spacingTokens[4]} gap={spacingTokens[3]}>
        <HStack gap={3} style={{ flex: 1, alignItems: 'center' }}>
          <Box width={spacingTokens[8]} height={spacingTokens[8]} radius={radiusTokens.full} backgroundColor={`${colors.accent.primary}15`} justifyContent="center" alignItems="center">
            <Text variant="body" style={{ fontSize: 24 }}>{icon}</Text>
          </Box>
          <VStack gap={1} style={{ flex: 1 }}>
            <Text variant="body" weight="bold" color={colors.foreground.primary} style={{ letterSpacing: -0.2 }}>{name}</Text>
            <Text variant="caption" color={colors.foreground.secondary} weight="medium">{ti('social.club_members', { count: members })} • {activity}</Text>
            {role && <Text variant="caption" color={colors.accent.primary} weight="semibold">👤 {role}</Text>}
          </VStack>
        </HStack>
        {role ? (
          <Button variant="outline" size="sm" onPress={() => { /* TODO: view */ }}>
            {t('social.view')}
          </Button>
        ) : (
          <Button variant="primary" size="sm" onPress={() => { /* TODO: join */ }}>
            {t('social.join')}
          </Button>
        )}
      </Box>
    </Card>
  );
}

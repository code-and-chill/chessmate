import { useState } from 'react';
import { SafeAreaView, ScrollView, Alert } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack, HStack, Button, Text, Box, useThemeTokens, spacingTokens, radiusTokens, Input } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import { useReducedMotion } from '@/features/board/hooks/useReducedMotion';
import { useClubs } from '../hooks';

export interface ClubsViewProps {
  onBack: () => void;
  userId: string;
}

export function ClubsView({ onBack }: ClubsViewProps) {
  const { colors } = useThemeTokens();
  const { t, ti } = useI18n();
  const reduceMotion = useReducedMotion();
  const { myClubs, discoverClubs, loading, createClub, joinClub } = useClubs();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');

  const createAnim = (delay: number) => reduceMotion ? undefined : FadeInUp.delay(delay).duration(400);
  const createAnimDown = (delay: number) => reduceMotion ? undefined : FadeInDown.delay(delay).duration(400);

  const handleCreateClub = async () => {
    if (!clubName.trim()) {
      Alert.alert(t('social.error', 'Error'), t('social.enter_club_name', 'Please enter a club name'));
      return;
    }

    try {
      await createClub(clubName.trim(), clubDescription.trim(), true);
      Alert.alert(t('social.success', 'Success'), t('social.club_created', 'Club created!'));
      setShowCreateForm(false);
      setClubName('');
      setClubDescription('');
    } catch (error) {
      Alert.alert(
        t('social.error', 'Error'),
        error instanceof Error ? error.message : t('social.failed_to_create_club', 'Failed to create club')
      );
    }
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      await joinClub(clubId);
      Alert.alert(t('social.success', 'Success'), t('social.club_joined', 'Joined club!'));
    } catch (error) {
      Alert.alert(
        t('social.error', 'Error'),
        error instanceof Error ? error.message : t('social.failed_to_join_club', 'Failed to join club')
      );
    }
  };

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
              {!showCreateForm ? (
                <Button variant="primary" size="lg" onPress={() => setShowCreateForm(true)}>
                  + {t('social.create_club')}
                </Button>
              ) : (
                <VStack gap={3}>
                  <Input
                    value={clubName}
                    onChangeText={setClubName}
                    placeholder={t('social.club_name', 'Club name')}
                    placeholderTextColor={colors.foreground.muted}
                    variant="default"
                  />
                  <Input
                    value={clubDescription}
                    onChangeText={setClubDescription}
                    placeholder={t('social.club_description', 'Description (optional)')}
                    placeholderTextColor={colors.foreground.muted}
                    variant="default"
                    multiline
                  />
                  <HStack gap={2}>
                    <Button variant="outline" size="md" onPress={() => {
                      setShowCreateForm(false);
                      setClubName('');
                      setClubDescription('');
                    }}>
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button variant="primary" size="md" onPress={handleCreateClub}>
                      {t('social.create', 'Create')}
                    </Button>
                  </HStack>
                </VStack>
              )}
            </Card>
          </Animated.View>

          {/* My Clubs Section */}
          <VStack gap={3}>
            <Text variant="title" color={colors.foreground.primary} style={{ letterSpacing: -0.3, marginBottom: spacingTokens[3] }}>{t('social.my_clubs')}</Text>
            {loading ? (
              <Text variant="body" color={colors.foreground.secondary} style={{ textAlign: 'center', marginTop: spacingTokens[8] }}>
                {t('social.loading_clubs', 'Loading clubs...')}
              </Text>
            ) : myClubs.length === 0 ? (
              <Text variant="body" color={colors.foreground.secondary} style={{ textAlign: 'center', marginTop: spacingTokens[8] }}>
                {t('social.no_clubs', 'You are not a member of any clubs yet')}
              </Text>
            ) : (
              myClubs.map((club, index) => (
                <Animated.View key={club.id} entering={createAnimDown(300 + index * 50)}>
                  <ClubCard club={club} colors={colors} t={t} ti={ti} onView={() => { /* TODO: navigate to club detail */ }} />
                </Animated.View>
              ))
            )}
          </VStack>

          {/* Discover Clubs Section */}
          <VStack gap={3}>
            <Text variant="title" color={colors.foreground.primary} style={{ letterSpacing: -0.3, marginBottom: spacingTokens[3] }}>{t('social.discover_clubs')}</Text>
            {loading ? (
              <Text variant="body" color={colors.foreground.secondary} style={{ textAlign: 'center', marginTop: spacingTokens[8] }}>
                {t('social.loading_clubs', 'Loading clubs...')}
              </Text>
            ) : discoverClubs.length === 0 ? (
              <Text variant="body" color={colors.foreground.secondary} style={{ textAlign: 'center', marginTop: spacingTokens[8] }}>
                {t('social.no_clubs_to_discover', 'No clubs to discover')}
              </Text>
            ) : (
              discoverClubs.map((club, index) => (
                <Animated.View key={club.id} entering={createAnimDown(400 + index * 50)}>
                  <ClubCard club={club} colors={colors} t={t} ti={ti} onJoin={() => handleJoinClub(club.id)} />
                </Animated.View>
              ))
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function ClubCard({ club, colors, t, ti, onView, onJoin }: { 
  club: import('../types').Club; 
  colors: any; 
  t: any; 
  ti: any; 
  onView?: () => void;
  onJoin?: () => void;
}) {
  const icon = club.icon || '♔';
  const role = club.role;
  
  return (
    <Card variant="default" size="md">
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" padding={spacingTokens[4]} gap={spacingTokens[3]}>
        <HStack gap={3} style={{ flex: 1, alignItems: 'center' }}>
          <Box width={spacingTokens[8]} height={spacingTokens[8]} radius={radiusTokens.full} backgroundColor={`${colors.accent.primary}15`} justifyContent="center" alignItems="center">
            <Text variant="body" style={{ fontSize: 24 }}>{icon}</Text>
          </Box>
          <VStack gap={1} style={{ flex: 1 }}>
            <Text variant="body" weight="bold" color={colors.foreground.primary} style={{ letterSpacing: -0.2 }}>{club.name}</Text>
            <Text variant="caption" color={colors.foreground.secondary} weight="medium">{ti('social.club_members', { count: club.members })} • {club.activity}</Text>
            {role && <Text variant="caption" color={colors.accent.primary} weight="semibold">👤 {role}</Text>}
          </VStack>
        </HStack>
        {role ? (
          <Button variant="outline" size="sm" onPress={onView}>
            {t('social.view')}
          </Button>
        ) : (
          <Button variant="primary" size="sm" onPress={onJoin}>
            {t('social.join')}
          </Button>
        )}
      </Box>
    </Card>
  );
}

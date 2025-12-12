/**
 * Settings hub showing overview cards
 */

import React from 'react';
import { ActivityIndicator } from 'react-native';
import { FeatureScreenLayout, FeatureCard, StatCard, VStack, HStack, Text, useThemeTokens } from '@/ui';
import { useI18n } from '@/i18n/I18nContext';
import { useUserProfile, useUserStats } from '../hooks';
import type { SettingsMode } from '../types';

// Replace with actual SettingsMode union values from your types
const settingsMenu = [
  {
    mode: 'profile',
    icon: '👤',
    titleKey: 'settings.profile',
    descriptionKey: 'settings.profile_desc',
  },
  {
    mode: 'notifications',
    icon: '🔔',
    titleKey: 'settings.notifications',
    descriptionKey: 'settings.notifications_desc',
  },
  {
    mode: 'security',
    icon: '🔒',
    titleKey: 'settings.security',
    descriptionKey: 'settings.security_desc',
  },
];

export interface SettingsHubProps {
  onNavigate: (mode: SettingsMode) => void;
  userId: string;
}

export const SettingsHub = ({ onNavigate, userId }: SettingsHubProps) => {
  const { colors } = useThemeTokens();
  const { t } = useI18n();
  const { loading: profileLoading } = useUserProfile(userId);
  const { stats, loading: statsLoading } = useUserStats(userId, 'blitz');

  const loading = profileLoading || statsLoading;

  if (loading) {
    return (
      <FeatureScreenLayout
        title={t('settings.profile_settings')}
        subtitle={t('settings.customize_experience')}
        statsRow={null}
      >
        <VStack gap={6} alignItems="center" fullHeight>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text variant="body" color={colors.foreground.secondary}>
            {t('settings.loading_settings')}
          </Text>
        </VStack>
      </FeatureScreenLayout>
    );
  }

  const statsRow = (
    <HStack gap={4} justifyContent="center">
      <StatCard value={stats?.rating || 1650} label={t('settings.blitz_rating')} />
      <StatCard value={stats?.games || 0} label={t('settings.games_played')} />
      <StatCard value={stats?.winRate?.toFixed(0) || '0%'} label={t('settings.win_rate')} />
    </HStack>
  );

  const menuCards = settingsMenu.map((item, idx) => (
    // Only use key for React, not as a prop for FeatureCard
    <FeatureCard
      icon={(<Text style={{fontSize: 28}}>{item.icon}</Text>) as any}
      title={t(item.titleKey)}
      description={t(item.descriptionKey)}
      onPress={() => onNavigate(item.mode as SettingsMode)}
      delay={200 + idx * 100}
      // @ts-ignore: React key
      key={item.mode}
    />
  ));

  return (
    <FeatureScreenLayout
      title={t('settings.profile_settings')}
      subtitle={t('settings.customize_experience')}
      statsRow={statsRow}
    >
      <VStack gap={4} alignItems="stretch" fullWidth>
        {menuCards}
      </VStack>
    </FeatureScreenLayout>
  );
};

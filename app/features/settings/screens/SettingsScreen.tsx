import { router } from 'expo-router';
import { FeatureScreenLayout, FeatureCard, VStack } from '@/ui';

export function SettingsScreen() {
  const cards = [
    {
      icon: '👤',
      title: 'Profile',
      description: 'Manage your personal info and avatar',
      onPress: () => router.push('/settings/profile'),
      delay: 200,
    },
    {
      icon: '⚙️',
      title: 'Preferences',
      description: 'Configure app preferences and notifications',
      onPress: () => router.push('/settings/preferences'),
      delay: 300,
    },
    {
      icon: '🎨',
      title: 'Appearance',
      description: 'Customize app theme and board style',
      onPress: () => router.push('/settings/appearance'),
      delay: 400,
    },
    {
      icon: '⚙️',
      title: 'Preferences',
      description: 'Configure app preferences and notifications',
      onPress: () => router.push('/settings/preferences'),
      delay: 500,
    },
    {
      icon: '🎨',
      title: 'Appearance',
      description: 'Customize app theme and board style',
      onPress: () => router.push('/settings/appearance'),
      delay: 600,
    },
  ];

  return (
    <FeatureScreenLayout
      title="Settings"
      subtitle="Manage your account, preferences, and appearance"
      statsRow={null}
    >
      <VStack gap={4} alignItems="stretch" fullWidth>
        {cards.map((card, idx) => (
          <FeatureCard
            key={card.title}
            icon={<span style={{ fontSize: 32 }}>{card.icon}</span>}
            title={card.title}
            description={card.description}
            onPress={card.onPress}
            delay={card.delay}
          />
        ))}
      </VStack>
    </FeatureScreenLayout>
  );
}


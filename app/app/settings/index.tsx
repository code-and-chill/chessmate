import {FeatureCard, FeatureScreenLayout, VStack} from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, type RelativePathString } from 'expo-router';
import type { IconName } from '@/ui/icons';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const cards: {
    icon: IconName;
    title: string;
    description: string;
    onPress: () => void;
    delay: number;
  }[] = [
    {
      icon: 'chess-board',
      title: 'Board & Pieces',
      description: 'Choose board theme and piece set',
      onPress: () => router.push('/settings/board' as RelativePathString),
      delay: 200,
    },
    {
      icon: 'gamecontroller',
      title: 'Gameplay',
      description: 'Gameplay options and move helpers',
      onPress: () => router.push('/settings/gameplay' as RelativePathString),
      delay: 300,
    },
    {
      icon: 'person',
      title: 'Profile',
      description: 'Manage your personal info and avatar',
      onPress: () => router.push('/settings/profile' as RelativePathString),
      delay: 400,
    },
    {
      icon: 'lock-closed',
      title: 'Account',
      description: 'Account security and billing',
      onPress: () => router.push('/settings/account' as RelativePathString),
      delay: 500,
    },
    {
      icon: 'accessibility',
      title: 'Accessibility',
      description: 'Adjust contrast, motion, and font sizes',
      onPress: () => router.push('/settings/accessibility' as RelativePathString),
      delay: 600,
    },
  ];

  return (
    <FeatureScreenLayout
      title="Settings"
      subtitle={`@${user?.username || 'Guest'} | Manage your account, preferences, and appearance`}
      statsRow={null}
    >
      <VStack gap={4} alignItems="stretch" fullWidth>
        {cards.map((card) => (
          <FeatureCard
            key={card.title}
            icon={card.icon}
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

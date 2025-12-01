import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PlayScreen } from '@/features/board';
import { FeatureScreenLayout, FeatureCard } from '@/ui/components';

type PlayMode = 'hub' | 'game';

export default function PlayTab() {
  const router = useRouter();
  const [mode, setMode] = useState<PlayMode>('hub');
  const [gameId] = useState('game-demo-1');

  // Game screen
  if (mode === 'game') {
    return (
      <View style={styles.container}>
        <PlayScreen gameId={gameId} />
      </View>
    );
  }

  // Play Hub
  return (
    <FeatureScreenLayout
      title="Play Chess"
      subtitle="Choose your game mode to get started"
    >
      <FeatureCard
        icon="🌐"
        title="Online Play"
        description="Find opponents worldwide"
        onPress={() => router.push('/(tabs)/play/online')}
        delay={200}
      />
      
      <FeatureCard
        icon="🤖"
        title="Play vs Bot"
        description="Practice with AI opponents"
        onPress={() => router.push('/(tabs)/play/bot')}
        delay={300}
      />
      
      <FeatureCard
        icon="👥"
        title="Friend Challenge"
        description="Invite and play with friends"
        onPress={() => router.push('/(tabs)/play/friend')}
        delay={400}
      />
    </FeatureScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});

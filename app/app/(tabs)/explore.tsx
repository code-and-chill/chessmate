import { useRouter } from 'expo-router';
import { FeatureScreenLayout, FeatureCard } from '@/ui/components';

export default function ExploreTab() {
  const router = useRouter();

  return (
    <FeatureScreenLayout
      title="Explore Chess"
      subtitle="Discover features to improve your game"
    >
      <FeatureCard
        icon="🧩"
        title="Puzzles"
        description="Solve tactical puzzles to improve your skills"
        onPress={() => router.push('/puzzle')}
        delay={200}
      />
      
      <FeatureCard
        icon="📚"
        title="Learning Center"
        description="Structured lessons from beginner to master"
        onPress={() => router.push('/learning')}
        delay={300}
      />
      
      <FeatureCard
        icon="👥"
        title="Friends"
        description="Connect with players and join clubs"
        onPress={() => router.push('/social/friends')}
        delay={400}
      />
      
      <FeatureCard
        icon="💬"
        title="Messages"
        description="Chat with your chess friends"
        onPress={() => router.push('/social/messages')}
        delay={500}
      />

      <FeatureCard
        icon="🏛️"
        title="Chess Clubs"
        description="Join communities and play together"
        onPress={() => router.push('/social/clubs')}
        delay={600}
      />
    </FeatureScreenLayout>
  );
}



import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card } from '@/ui/primitives/Card';
import { VStack } from '@/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useMatchmaking } from '@/contexts/MatchmakingContext';

type TimeControl = '1+0' | '3+0' | '5+0' | '10+0' | '15+10' | '30+0';

const TIME_CONTROLS = [
  { id: '1+0' as TimeControl, label: '⚡ Bullet 1 min', type: 'bullet' },
  { id: '3+0' as TimeControl, label: '⚡ Blitz 3 min', type: 'blitz' },
  { id: '5+0' as TimeControl, label: '⚡ Blitz 5 min', type: 'blitz' },
  { id: '10+0' as TimeControl, label: '⏱️ Rapid 10 min', type: 'rapid' },
  { id: '15+10' as TimeControl, label: '⏱️ Rapid 15|10', type: 'rapid' },
  { id: '30+0' as TimeControl, label: '🐢 Classical 30 min', type: 'classical' },
];

export default function OnlinePlayScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { joinQueue, leaveQueue, queueStatus, matchFound } = useMatchmaking();
  
  const [timeControl, setTimeControl] = useState<TimeControl>('10+0');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.replace('/login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Navigate to game when match is found
    if (matchFound) {
      router.push(`/game/${matchFound.gameId}`);
    }
  }, [matchFound]);

  const handleFindMatch = async () => {
    setIsSearching(true);
    try {
      await joinQueue({
        timeControl,
        ratingRange: { min: 0, max: 3000 }, // Open rating range for now
      });
    } catch (error) {
      console.error('Failed to join queue:', error);
      setIsSearching(false);
    }
  };

  const handleCancelSearch = async () => {
    try {
      await leaveQueue();
      setIsSearching(false);
    } catch (error) {
      console.error('Failed to leave queue:', error);
    }
  };

  if (isSearching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.searchingTitle}>Finding opponent...</Text>
          <Text style={styles.searchingSubtitle}>
            {queueStatus?.playersInQueue || 0} players online
          </Text>
          <Text style={styles.searchingTime}>
            Searching for {queueStatus?.waitTime || 0}s
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancelSearch}
          >
            <Text style={styles.buttonText}>Cancel Search</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <VStack style={styles.content} gap={6}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <VStack gap={2} style={{ alignItems: 'center' }}>
          <Text style={styles.title}>Online Play</Text>
          <Text style={styles.subtitle}>Choose your game speed</Text>
        </VStack>

        <VStack gap={3} style={{ marginTop: 8 }}>
          {TIME_CONTROLS.map((tc, idx) => (
            <Animated.View
              key={tc.id}
              entering={FadeInDown.delay(idx * 100).duration(400).springify()}
            >
              <Card
                variant={timeControl === tc.id ? 'gradient' : 'default'}
                size="md"
                hoverable
                pressable
                animated
              >
                <TouchableOpacity
                  style={[
                    styles.timeControlButton,
                    timeControl === tc.id ? styles.timeControlSelected : null,
                  ]}
                  onPress={() => setTimeControl(tc.id)}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.timeControlText,
                      timeControl === tc.id ? styles.timeControlTextSelected : null,
                    ]}
                  >
                    {tc.label}
                  </Text>
                </TouchableOpacity>
              </Card>
            </Animated.View>
          ))}
        </VStack>

        <Animated.View entering={FadeInUp.delay(500).duration(400).springify()}>
          <TouchableOpacity style={styles.button} onPress={handleFindMatch}>
            <Text style={styles.buttonText}>Find Match</Text>
          </TouchableOpacity>
        </Animated.View>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  timeControlButton: {
    padding: 16,
  },
  timeControlSelected: {
    // Additional styling when selected
  },
  timeControlText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  timeControlTextSelected: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#667EEA',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  searchingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  searchingSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
  },
  searchingTime: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    marginTop: 32,
    minWidth: 200,
  },
});

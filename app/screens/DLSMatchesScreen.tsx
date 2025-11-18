/**
 * Tournament Matches Screen
 * 
 * Displays list of ongoing matches in a tournament using DLS components
 */

import { ScrollView } from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Spacer,
  Button,
  useColors,
  useThemeTokens,
  TournamentHeader,
  MatchCard,
  ActionBar,
  Text,
} from '@/ui';

interface Match {
  id: string;
  player1: { name: string; rating: number };
  player2: { name: string; rating: number };
  score1: number;
  score2: number;
  status: 'active' | 'completed' | 'pending';
}

export interface MatchesScreenProps {
  matches?: Match[];
  onStartMatch?: (matchId: string) => void;
  onViewResults?: (matchId: string) => void;
}

export function MatchesScreen({
  matches = [
    {
      id: '1',
      player1: { name: 'Alice Johnson', rating: 2100 },
      player2: { name: 'Bob Smith', rating: 2080 },
      score1: 5,
      score2: 3,
      status: 'active',
    },
    {
      id: '2',
      player1: { name: 'Diana Prince', rating: 2150 },
      player2: { name: 'Eve Wilson', rating: 2140 },
      score1: 4,
      score2: 4,
      status: 'active',
    },
    {
      id: '3',
      player1: { name: 'Frank Castle', rating: 2090 },
      player2: { name: 'Grace Chen', rating: 2110 },
      score1: 2,
      score2: 1,
      status: 'pending',
    },
  ],
  onStartMatch = () => {},
  onViewResults = () => {},
}: MatchesScreenProps) {
  const colors = useColors();
  const { mode, setMode } = useThemeTokens();

  return (
    <Box flex={1} backgroundColor={colors.background.primary}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TournamentHeader
          title="2025 Winter Championship"
          subtitle="Round 5 of 8"
          badge="LIVE"
        />

        {/* Theme Toggle */}
        <HStack gap={2} padding={4} justifyContent="center">
          <Button
            variant={mode === 'light' ? 'solid' : 'outline'}
            size="sm"
            color="blue"
            onPress={() => setMode('light')}
          >
            ☀️ Light
          </Button>
          <Button
            variant={mode === 'dark' ? 'solid' : 'outline'}
            size="sm"
            color="blue"
            onPress={() => setMode('dark')}
          >
            🌙 Dark
          </Button>
        </HStack>

        {/* Matches List */}
        <VStack gap={3} padding={4}>
          <Text variant="heading" color={colors.foreground.primary}>
            Active Matches
          </Text>

          {matches.map((match) => (
            <MatchCard
              key={match.id}
              player1={match.player1}
              player2={match.player2}
              score1={match.score1}
              score2={match.score2}
              status={match.status}
              onPress={() => {
                if (match.status === 'active') {
                  onStartMatch?.(match.id);
                } else {
                  onViewResults?.(match.id);
                }
              }}
            />
          ))}

          <Spacer />
        </VStack>
      </ScrollView>

      {/* Action Bar */}
      <ActionBar
        actions={[
          { label: 'Standings', onPress: () => console.log('View standings') },
          { label: 'Pairings', onPress: () => console.log('View pairings') },
          { label: 'Settings', onPress: () => console.log('Settings') },
        ]}
      />
    </Box>
  );
}

MatchesScreen.displayName = 'MatchesScreen';

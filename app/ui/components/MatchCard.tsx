/**
 * MatchCard Component
 * app/ui/components/MatchCard.tsx
 */

import { Pressable } from 'react-native';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Card } from '../primitives/Card';
import { Avatar } from '../primitives/Avatar';
import { Tag } from '../primitives/Tag';

type MatchStatus = 'active' | 'completed' | 'pending';

type MatchCardProps = {
  player1: { name: string; rating: number };
  player2: { name: string; rating: number };
  score1: number;
  score2: number;
  status: MatchStatus;
  onPress?: () => void;
};

const statusColors = {
  active: '#3B82F6',
  completed: '#16A34A',
  pending: '#F59E0B',
};

export const MatchCard: React.FC<MatchCardProps> = ({
  player1,
  player2,
  score1,
  score2,
  status,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress}>
      <Card
        borderColor={statusColors[status]}
        borderWidth={status === 'active' ? 2 : 1}
      >
        <Box gap={4}>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box flexDirection="row" alignItems="center" gap={3}>
              <Avatar name={player1.name} />
              <Box>
                <Text variant="title" weight="semibold">
                  {player1.name}
                </Text>
                <Text variant="caption" color="#737373">
                  Rating: {player1.rating}
                </Text>
              </Box>
            </Box>

            <Box alignItems="center">
              <Text variant="title" weight="bold" color="#3B82F6">
                {score1} - {score2}
              </Text>
            </Box>

            <Box flexDirection="row" alignItems="center" gap={3} style={{ justifyContent: 'flex-end' }}>
              <Box style={{ alignItems: 'flex-end' }}>
                <Text variant="title" weight="semibold">
                  {player2.name}
                </Text>
                <Text variant="caption" color="#737373">
                  Rating: {player2.rating}
                </Text>
              </Box>
              <Avatar name={player2.name} />
            </Box>
          </Box>

          <Box flexDirection="row" justifyContent="center">
            <Tag
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              color={statusColors[status]}
              backgroundColor={statusColors[status] + '20'}
            />
          </Box>
        </Box>
      </Card>
    </Pressable>
  );
};

MatchCard.displayName = 'MatchCard';

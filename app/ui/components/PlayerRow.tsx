/**
 * PlayerRow Component
 * app/ui/components/PlayerRow.tsx
 */

import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Avatar } from '../primitives/Avatar';

type PerformanceType = 'win' | 'loss' | 'draw';

type PlayerRowProps = {
  name: string;
  rating: number;
  performance?: PerformanceType;
  wins?: number;
  losses?: number;
  draws?: number;
};

const performanceColors = {
  win: '#16A34A',
  loss: '#DC2626',
  draw: '#F59E0B',
};

export const PlayerRow: React.FC<PlayerRowProps> = ({
  name,
  rating,
  performance,
  wins,
  losses,
  draws,
}) => {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      padding={4}
      borderBottomWidth={1}
      borderColor="#E8E8E8"
    >
      <Box flexDirection="row" alignItems="center" gap={3}>
        <Avatar name={name} />
        <Box>
          <Text variant="title" weight="semibold">
            {name}
          </Text>
          <Text variant="caption" color="#737373">
            Rating: {rating}
          </Text>
        </Box>
      </Box>

      {performance && (
        <Box
          padding={2}
          radius="sm"
          backgroundColor={performanceColors[performance] + '20'}
        >
          <Text
            variant="label"
            weight="bold"
            color={performanceColors[performance]}
          >
            {performance.toUpperCase()}
          </Text>
        </Box>
      )}

      {(wins !== undefined || losses !== undefined || draws !== undefined) && (
        <Box flexDirection="row" gap={3}>
          {wins !== undefined && (
            <Text variant="caption" color="#16A34A" weight="semibold">
              W: {wins}
            </Text>
          )}
          {losses !== undefined && (
            <Text variant="caption" color="#DC2626" weight="semibold">
              L: {losses}
            </Text>
          )}
          {draws !== undefined && (
            <Text variant="caption" color="#F59E0B" weight="semibold">
              D: {draws}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};

PlayerRow.displayName = 'PlayerRow';

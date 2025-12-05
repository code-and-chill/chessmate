import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Avatar } from '../primitives/Avatar';
import { colorTokens, getColor } from '../tokens/colors';
import { useIsDark } from '../hooks/useThemeTokens';

type PerformanceType = 'win' | 'loss' | 'draw';

type PlayerRowProps = {
  name: string;
  rating: number;
  performance?: PerformanceType;
  wins?: number;
  losses?: number;
  draws?: number;
};

const usePerformanceColors = () => {
  const isDark = useIsDark();
  return {
    win: getColor(colorTokens.green[600], isDark),
    loss: getColor(colorTokens.red[600], isDark),
    draw: getColor(colorTokens.amber[500], isDark),
  };
};

export const PlayerRow: React.FC<PlayerRowProps> = ({
  name,
  rating,
  performance,
  wins,
  losses,
  draws,
}) => {
  const isDark = useIsDark();
  const performanceColors = usePerformanceColors();
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      padding={4}
      borderColor={getColor(colorTokens.neutral[200], isDark)}
    >
      <Box flexDirection="row" alignItems="center" gap={3}>
        <Avatar name={name} />
        <Box>
          <Text variant="title" weight="semibold">
            {name}
          </Text>
          <Text variant="caption" color={getColor(colorTokens.neutral[500], isDark)}>
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
            <Text variant="caption" color={getColor(colorTokens.green[600], isDark)} weight="semibold">
              W: {wins}
            </Text>
          )}
          {losses !== undefined && (
            <Text variant="caption" color={getColor(colorTokens.red[600], isDark)} weight="semibold">
              L: {losses}
            </Text>
          )}
          {draws !== undefined && (
            <Text variant="caption" color={getColor(colorTokens.amber[500], isDark)} weight="semibold">
              D: {draws}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};

PlayerRow.displayName = 'PlayerRow';

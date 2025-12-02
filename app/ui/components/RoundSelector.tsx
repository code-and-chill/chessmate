/**
 * RoundSelector Component
 * app/ui/components/RoundSelector.tsx
 */

import { Pressable, ScrollView } from 'react-native';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { colorTokens, getColor } from '../tokens/colors';
import { useIsDark } from '../hooks/useThemeTokens';

type RoundSelectorProps = {
  rounds: string[];
  selected: string;
  onSelect: (round: string) => void;
};

export const RoundSelector: React.FC<RoundSelectorProps> = ({
  rounds,
  selected,
  onSelect,
}) => {
  const isDark = useIsDark();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Box flexDirection="row" gap={2} padding={4}>
        {rounds.map((round) => (
          <Pressable key={round} onPress={() => onSelect(round)}>
            <Box
              padding={3}
              radius="md"
              backgroundColor={
                selected === round
                  ? getColor(colorTokens.blue[600], isDark)
                  : getColor(colorTokens.neutral[100], isDark)
              }
              borderWidth={selected === round ? 0 : 1}
              borderColor={getColor(colorTokens.neutral[200], isDark)}
            >
              <Text
                variant="label"
                weight="semibold"
                color={
                  selected === round
                    ? getColor(colorTokens.neutral[50], isDark)
                    : getColor(colorTokens.neutral[900], isDark)
                }
              >
                {round}
              </Text>
            </Box>
          </Pressable>
        ))}
      </Box>
    </ScrollView>
  );
};

RoundSelector.displayName = 'RoundSelector';

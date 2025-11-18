/**
 * RoundSelector Component
 * app/ui/components/RoundSelector.tsx
 */

import { Pressable, ScrollView } from 'react-native';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';

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
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Box flexDirection="row" gap={2} padding={4}>
        {rounds.map((round) => (
          <Pressable key={round} onPress={() => onSelect(round)}>
            <Box
              padding={3}
              radius="md"
              backgroundColor={selected === round ? '#3B82F6' : '#F3F3F3'}
              borderWidth={selected === round ? 0 : 1}
              borderColor="#E8E8E8"
            >
              <Text
                variant="label"
                weight="semibold"
                color={selected === round ? '#FAFAFA' : '#171717'}
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

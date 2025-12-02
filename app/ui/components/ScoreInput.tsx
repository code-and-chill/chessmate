/**
 * ScoreInput Component
 * app/ui/components/ScoreInput.tsx
 */

import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Button } from '../primitives/Button';

type ScoreInputProps = {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
};

export const ScoreInput: React.FC<ScoreInputProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
}) => {
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <Box alignItems="center" gap={3}>
      {label && <Text variant="label" color="#525252">{label}</Text>}

      <Box
        flexDirection="row"
        alignItems="center"
        gap={4}
        padding={3}
        radius="md"
        backgroundColor="rgba(59, 130, 246, 0.1)"
      >
        <Button variant="outline" size="sm" onPress={handleDecrement}>
          −
        </Button>

        <Text
          variant="title"
          weight="bold"
          color="#3B82F6"
          style={{ minWidth: 50, textAlign: 'center' }}
        >
          {value}
        </Text>

        <Button variant="outline" size="sm" onPress={handleIncrement}>
          +
        </Button>
      </Box>
    </Box>
  );
};

ScoreInput.displayName = 'ScoreInput';

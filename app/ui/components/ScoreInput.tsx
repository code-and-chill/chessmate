import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Button } from '../primitives/Button';
import { colorTokens, getColor } from '../tokens/colors';
import { useIsDark } from '../hooks/useThemeTokens';

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
  const isDark = useIsDark();

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const blueColor = getColor(colorTokens.blue[600], isDark);

  return (
    <Box alignItems="center" gap={3}>
      {label && <Text variant="label" color={getColor(colorTokens.neutral[600], isDark)}>{label}</Text>}

      <Box
        flexDirection="row"
        alignItems="center"
        gap={4}
        padding={3}
        radius="md"
        backgroundColor={`${blueColor}1A`}
      >
        <Button variant="outline" size="sm" onPress={handleDecrement}>
          −
        </Button>

        <Text
          variant="title"
          weight="bold"
          color={blueColor}
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

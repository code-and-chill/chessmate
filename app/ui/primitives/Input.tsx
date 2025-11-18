/**
 * Input Primitive Component
 * app/ui/primitives/Input.tsx
 */

import { TextInput } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Box } from './Box';
import { Text } from './Text';

type InputProps = TextInputProps & {
  label?: string;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  error?: string;
};

export const Input: React.FC<InputProps> = ({
  label,
  leftAccessory,
  rightAccessory,
  error,
  style,
  ...rest
}) => {
  return (
    <Box gap={2}>
      {label && <Text variant="label">{label}</Text>}
      <Box
        flexDirection="row"
        alignItems="center"
        padding={3}
        radius="md"
        backgroundColor="#FAFAFA"
        borderWidth={1}
        borderColor={error ? '#DC2626' : '#E8E8E8'}
        gap={2}
      >
        {leftAccessory}
        <TextInput
          style={[{ flex: 1, fontSize: 16 }, style]}
          placeholderTextColor="#A1A1A1"
          {...rest}
        />
        {rightAccessory}
      </Box>
      {error && <Text variant="caption" color="#DC2626">{error}</Text>}
    </Box>
  );
};

Input.displayName = 'Input';

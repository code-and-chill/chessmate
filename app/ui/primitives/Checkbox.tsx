/**
 * Checkbox Component
 */

import { Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Text } from './Text';
import { HStack } from './Stack';
import { radiusTokens } from '../tokens/radii';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  color = '#3B82F6',
  size = 20,
  style,
}) => (
  <HStack gap={2} alignItems="center" style={style}>
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        borderRadius: radiusTokens.sm,
        borderWidth: 2,
        borderColor: checked ? color : '#D1D5DB',
        backgroundColor: checked ? color : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      } as ViewStyle}
    >
      {checked && (
        <View
          style={{
            width: size * 0.5,
            height: size * 0.3,
            borderLeftWidth: 2,
            borderBottomWidth: 2,
            borderColor: '#fff',
            transform: [{ rotate: '-45deg' }],
          } as ViewStyle}
        />
      )}
    </Pressable>
    {label && (
      <Text
        variant="body"
        color={disabled ? '#9CA3AF' : '#1F2937'}
        onPress={() => !disabled && onChange(!checked)}
      >
        {label}
      </Text>
    )}
  </HStack>
);

Checkbox.displayName = 'Checkbox';

/**
 * Radio Button Component
 */

import { Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Text } from './Text';
import { HStack } from './Stack';

export interface RadioProps {
  selected: boolean;
  onChange: (selected: boolean) => void;
  label?: string;
  disabled?: boolean;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export const Radio: React.FC<RadioProps> = ({
  selected,
  onChange,
  label,
  disabled = false,
  color = '#3B82F6',
  size = 20,
  style,
}) => (
  <HStack gap={2} alignItems="center" style={style}>
    <Pressable
      onPress={() => !disabled && onChange(true)}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: selected ? color : '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      } as ViewStyle}
    >
      {selected && (
        <View
          style={{
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: (size * 0.5) / 2,
            backgroundColor: color,
          } as ViewStyle}
        />
      )}
    </Pressable>
    {label && (
      <Text
        variant="body"
        color={disabled ? '#9CA3AF' : '#1F2937'}
        onPress={() => !disabled && onChange(true)}
      >
        {label}
      </Text>
    )}
  </HStack>
);

Radio.displayName = 'Radio';

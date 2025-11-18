/**
 * Select/Dropdown Component
 */

import { Pressable, ScrollView, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Text } from './Text';
import { HStack } from './Stack';
import { radiusTokens } from '../tokens/radii';
import { semanticColors } from '../tokens/colors';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  color?: string;
  style?: ViewStyle;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  disabled = false,
  color = '#3B82F6',
  style,
}) => {
  const isDark = false;
  const colors = semanticColors(isDark);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={style}>
      {label && (
        <Text variant="label" style={{ marginBottom: 4 }}>
          {label}
        </Text>
      )}
      <Pressable
        disabled={disabled}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: radiusTokens.md,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: colors.card,
          opacity: disabled ? 0.5 : 1,
        } as ViewStyle}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <Text variant="body" color={selectedOption ? colors.foreground : '#9CA3AF'}>
            {selectedOption?.label || placeholder}
          </Text>
          <Text color={colors.muted}>▼</Text>
        </HStack>
      </Pressable>
      <ScrollView
        style={{
          maxHeight: 200,
          marginTop: 4,
          borderRadius: radiusTokens.md,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: colors.card,
        } as ViewStyle}
      >
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
              backgroundColor: value === option.value ? `${color}15` : 'transparent',
            } as ViewStyle}
          >
            <Text
              variant="body"
              color={value === option.value ? color : colors.foreground}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

Select.displayName = 'Select';

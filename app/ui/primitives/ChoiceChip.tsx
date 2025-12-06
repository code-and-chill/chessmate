import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { HStack, Text, spacingTokens, radiusTokens } from '@/ui';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

type Props = {
  id?: string;
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  flex?: boolean; // when true, chip will expand (useful for equal-width choices)
};

export const ChoiceChip: React.FC<Props> = ({ label, icon, selected = false, onPress, style, flex = false }) => {
  const { colors } = useThemeTokens();

  const chipStyle: ViewStyle = {
    paddingHorizontal: spacingTokens[3],
    paddingVertical: spacingTokens[2],
    borderRadius: radiusTokens.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: selected ? colors.accent.primary : 'transparent',
    backgroundColor: selected ? colors.background.tertiary : colors.background.secondary,
    ...(flex ? { flex: 1 } : {}),
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[chipStyle, style]}
    >
      <HStack gap={2} style={{ alignItems: 'center', justifyContent: 'center' }}>
        {icon}
        <Text weight={selected ? 'semibold' : 'medium'} color={selected ? colors.accent.primary : colors.foreground.secondary}>
          {label}
        </Text>
      </HStack>
    </Pressable>
  );
};

export default ChoiceChip;

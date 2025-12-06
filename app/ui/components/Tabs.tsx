import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { HStack, Text, spacingTokens, radiusTokens, shadowTokens } from '@/ui';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';

export type TabItem = {
  id: string;
  label?: string;
  icon?: React.ReactNode;
};

type TabsProps = {
  items: TabItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

export const Tabs: React.FC<TabsProps> = ({ items, selectedId, onSelect, size = 'md', style }) => {
  const { colors } = useThemeTokens();

  const paddingMap = {
    sm: spacingTokens[2],
    md: spacingTokens[3],
    lg: spacingTokens[4],
  } as const;

  const fontMap = {
    sm: 14,
    md: 16,
    lg: 18,
  } as const;

  const heightMap = {
    sm: 32,
    md: 40,
    lg: 48,
  } as const;

  return (
    <HStack gap={2} style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
      <HStack gap={2} style={{ alignItems: 'center' }}>
        {items.map((item) => {
          const selected = selectedId === item.id;
          const tabStyle: ViewStyle = {
            paddingHorizontal: paddingMap[size],
            minHeight: heightMap[size],
            borderRadius: radiusTokens.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected ? colors.accent.primary : 'transparent',
            borderWidth: selected ? 0 : 1,
            borderColor: selected ? 'transparent' : colors.background.tertiary,
            ...(selected ? (shadowTokens.xs as any) : {}),
          };

          const textColor = selected ? (colors.foreground?.onAccent ?? '#FFFFFF') : colors.foreground.primary;

          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={item.label || item.id}
              style={tabStyle}
            >
              <HStack gap={2} style={{ alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
                {item.label && (
                  <Text
                    weight={selected ? 'bold' : 'medium'}
                    style={{ fontSize: fontMap[size], color: textColor }}
                  >
                    {item.label}
                  </Text>
                )}
              </HStack>
            </Pressable>
          );
        })}
      </HStack>
    </HStack>
  );
};

export default Tabs;

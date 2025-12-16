import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { HStack, Text, spacingTokens, radiusTokens, shadowTokens } from '@/ui';
import { useThemeTokens } from '@/ui/hooks/useThemeTokens';
import { View } from 'react-native';

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

  // Use a glass panel background for the tabs container
  return (
    <View style={[
      { 
        backgroundColor: colors.background.secondary, // or transparent if glass needed
        borderRadius: radiusTokens.md,
        padding: 4,
        alignSelf: 'center',
        ...style 
      }
    ]}>
      <HStack gap={0} style={{ alignItems: 'center' }}>
        {items.map((item) => {
          const selected = selectedId === item.id;
          const tabStyle: ViewStyle = {
            paddingHorizontal: paddingMap[size],
            minHeight: heightMap[size],
            borderRadius: radiusTokens.sm, // Slightly smaller radius for items
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected ? colors.background.primary : 'transparent',
            // Glow/Shadow for selected state
            ...(selected ? shadowTokens.sm : {}),
          };

          const textColor = selected ? colors.foreground.primary : colors.foreground.secondary;

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
                {item.icon && <Text style={{ fontSize: fontMap[size] }}>{item.icon}</Text>}
                {item.label && (
                  <Text
                    weight={selected ? 'semibold' : 'medium'}
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
    </View>
  );
};

export default Tabs;

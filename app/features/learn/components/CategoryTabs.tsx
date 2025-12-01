/**
 * Category Tabs Component
 * features/learn/components/CategoryTabs.tsx
 */

import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/ui/primitives/Text';
import { useTheme } from '@/features/theme';
import { colorTokens, getColor } from '@/ui/tokens/colors';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import type { LessonCategory } from '../types/learn.types';

export type CategoryTabsProps = {
  categories: LessonCategory[];
  selected: LessonCategory;
  onSelect: (category: LessonCategory) => void;
};

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, selected, onSelect }) => {
  const { theme } = useTheme();
  const isDark = theme.background.id === 'dark';
  const colors = {
    background: getColor(colorTokens.neutral[100], isDark),
    foreground: getColor(colorTokens.neutral[900], isDark),
    accent: getColor(colorTokens.blue[600], isDark),
  };

  return (
    <View style={{ flexDirection: 'row', gap: spacingTokens[2] }}>
      {categories.map((cat) => {
        const isSelected = selected === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={{
              flex: 1,
              paddingVertical: spacingTokens[3],
              paddingHorizontal: spacingTokens[4],
              backgroundColor: isSelected ? colors.accent : colors.background,
              borderRadius: radiusTokens.md,
              alignItems: 'center',
            }}
            onPress={() => onSelect(cat)}
            activeOpacity={0.9}
          >
            <Text
              variant="body"
              color={isSelected ? '#FFFFFF' : colors.foreground}
              style={{ fontWeight: '600' }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

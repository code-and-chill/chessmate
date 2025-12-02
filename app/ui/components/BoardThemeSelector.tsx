/**
 * Board Theme Selector Component
 * app/ui/components/BoardThemeSelector.tsx
 * 
 * Settings component for selecting chess board visual theme
 */

import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import { Box } from '../primitives/Box';
import { VStack, HStack } from '../primitives/Stack';
import { Text } from '../primitives/Text';
import { Surface } from '../primitives/Surface';
import { useThemeTokens } from '../hooks/useThemeTokens';
import { spacingTokens } from '../tokens/spacing';
import { radiusTokens } from '../tokens/radii';
import { typographyTokens } from '../tokens/typography';
import { useBoardTheme } from '@/contexts/BoardThemeContext';
import { getAllThemes, type BoardTheme } from '@/ui/tokens/board-themes';

interface ThemePreviewProps {
  theme: BoardTheme;
  isSelected: boolean;
  onSelect: () => void;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, isSelected, onSelect }) => {
  const { colors } = useThemeTokens();

  return (
    <Pressable onPress={onSelect}>
      <Surface
        variant={isSelected ? 'elevated' : 'default'}
        style={{
          padding: spacingTokens[4],
          borderRadius: radiusTokens.md,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? colors.accent.primary : colors.background.tertiary,
        }}
      >
        <VStack gap={spacingTokens[3]}>
          {/* Theme Preview Grid */}
          <Box style={{ width: 120, height: 120 }}>
            <Box style={{ flexDirection: 'row', flex: 1 }}>
              <Box style={{ flex: 1, backgroundColor: theme.lightSquare }} />
              <Box style={{ flex: 1, backgroundColor: theme.darkSquare }} />
            </Box>
            <Box style={{ flexDirection: 'row', flex: 1 }}>
              <Box style={{ flex: 1, backgroundColor: theme.darkSquare }} />
              <Box style={{ flex: 1, backgroundColor: theme.lightSquare }} />
            </Box>
          </Box>

          {/* Theme Name */}
          <Text
            variant="body"
            weight={isSelected ? 'bold' : 'medium'}
            color={isSelected ? colors.accent.primary : colors.foreground.primary}
            style={{ textAlign: 'center' }}
          >
            {theme.name}
          </Text>

          {isSelected && (
            <Text
              variant="caption"
              color={colors.accent.primary}
              style={{ textAlign: 'center', fontSize: typographyTokens.fontSize.xs }}
            >
              ✓ Active
            </Text>
          )}
        </VStack>
      </Surface>
    </Pressable>
  );
};

export const BoardThemeSelector: React.FC = () => {
  const { themeId, setTheme } = useBoardTheme();
  const { colors } = useThemeTokens();
  const themes = getAllThemes();

  const handleSelectTheme = async (newThemeId: string) => {
    await setTheme(newThemeId as any);
  };

  return (
    <Box style={{ flex: 1 }}>
      <VStack gap={spacingTokens[6]}>
        {/* Header */}
        <VStack gap={spacingTokens[2]}>
          <Text variant="title" color={colors.foreground.primary}>
            Board Theme
          </Text>
          <Text variant="body" color={colors.foreground.secondary} style={{ fontSize: typographyTokens.fontSize.sm }}>
            Choose your preferred chess board appearance
          </Text>
        </VStack>

        {/* Theme Grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: spacingTokens[4],
            paddingVertical: spacingTokens[2],
          }}
        >
          {themes.map((theme) => (
            <ThemePreview
              key={theme.id}
              theme={theme}
              isSelected={theme.id === themeId}
              onSelect={() => handleSelectTheme(theme.id)}
            />
          ))}
        </ScrollView>
      </VStack>
    </Box>
  );
};

BoardThemeSelector.displayName = 'BoardThemeSelector';

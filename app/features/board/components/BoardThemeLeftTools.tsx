import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Card, useColors, VStack } from '@/ui';
import { spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens } from '@/ui/tokens/radii';
import { shadowTokens } from '@/ui/tokens/shadows';
import { InteractivePressable } from '@/ui/primitives/InteractivePressable';
import { ChoiceChip } from '@/ui/primitives/ChoiceChip';
import type { BoardTheme } from '@/features/board/config/themeConfig';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';

type BoardColor = { id: BoardTheme; name?: string; light: string; dark: string };

interface Props {
  boardColors: BoardColor[];
  selectedId?: BoardTheme;
  onSelect: (id: BoardTheme) => void;
  pieceThemes?: string[];
  selectedPieceTheme?: string;
  onSelectPiece?: (theme: string) => void;
}

const BoardThemeLeftTools: React.FC<Props> = ({ boardColors = [], selectedId, onSelect, pieceThemes = [], selectedPieceTheme, onSelectPiece }) => {
  const colors = useColors();
  const { width } = useWindowDimensions();
  
  // Responsive grid: 3 columns on larger screens, 2 on medium, 2 on small
  // Ensure minimum touch target size (44px) per Fitts' Law
  const numColumns = width > 640 ? 3 : 2;
  const tileSize = Math.max(44, width > 640 ? 72 : width > 480 ? 80 : 70);

  return (
    <Card variant="elevated" size="md" style={styles.card}>
      <View style={styles.section}>
        <VStack gap={spacingTokens[1]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Board</Text>
          <Text style={[styles.sectionDescription, { color: colors.foreground.tertiary }]}>
            Choose your preferred board color scheme
          </Text>
        </VStack>
        <View style={styles.grid}>
          {boardColors.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <BoardThemeTile
                key={item.id}
                item={item}
                isSelected={isSelected}
                onSelect={() => onSelect(item.id)}
                size={tileSize}
                colors={colors}
              />
            );
          })}
        </View>
      </View>

      <View style={[styles.section, styles.piecesSection]}>
        <VStack gap={spacingTokens[1]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Pieces</Text>
          <Text style={[styles.sectionDescription, { color: colors.foreground.tertiary }]}>
            Select a visual style for chess pieces
          </Text>
        </VStack>
        <View style={styles.chipsContainer}>
          {pieceThemes.map((t) => (
            <ChoiceChip
              key={t}
              label={t}
              selected={selectedPieceTheme === t}
              onPress={() => onSelectPiece && onSelectPiece(t)}
              style={styles.chip}
            />
          ))}
        </View>
      </View>
    </Card>
  );
};

interface BoardThemeTileProps {
  item: BoardColor;
  isSelected: boolean;
  onSelect: () => void;
  size: number;
  colors: any;
}

const BoardThemeTile: React.FC<BoardThemeTileProps> = ({ item, isSelected, onSelect, size, colors }) => {
  const scale = useSharedValue(isSelected ? 1.05 : 1);
  const borderOpacity = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.05 : 1, {
      damping: 15,
      stiffness: 200,
    });
    borderOpacity.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    const borderWidth = interpolate(borderOpacity.value, [0, 1], [1.5, 3]);
    const shadowRadius = interpolate(borderOpacity.value, [0, 1], [2, 8]);
    return {
      transform: [{ scale: scale.value }],
      borderWidth,
      shadowOpacity: interpolate(borderOpacity.value, [0, 1], [0, 0.2]),
      shadowRadius,
    };
  });

  return (
    <InteractivePressable
      onPress={onSelect}
      accessibilityLabel={`Select board color ${item.name ?? item.id}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      hapticStyle="light"
    >
      <Animated.View 
        style={[
          styles.tile, 
          { 
            width: size, 
            height: size,
            borderColor: isSelected ? colors.accent.primary : 'transparent',
          }, 
          animatedStyle
        ]}
      >
        <View style={[styles.tileHalf, { backgroundColor: item.light }]} />
        <View style={[styles.tileHalf, { backgroundColor: item.dark }]} />
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </Animated.View>
    </InteractivePressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 280,
    maxWidth: 500,
  },
  section: {
    marginBottom: spacingTokens[5],
  },
  piecesSection: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 0,
    opacity: 0.8,
  },
  sectionDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: spacingTokens[3],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingTokens[2],
    justifyContent: 'flex-start',
  },
  tile: {
    borderRadius: radiusTokens.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadowTokens.sm,
  },
  tileHalf: {
    flex: 1,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowTokens.sm,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingTokens[2],
  },
  chip: {
    marginBottom: 0,
  },
});

export default BoardThemeLeftTools;

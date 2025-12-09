import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { spacingTokens } from '@/ui/tokens/spacing';
import type { BoardTheme } from '@/features/board/config/themeConfig';

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
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Board</Text>

      <FlatList
        data={boardColors}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            accessibilityLabel={`Select board color ${item.name ?? item.id}`}
            style={[styles.tile, selectedId === item.id ? styles.tileSelected : undefined]}
          >
            <View style={[styles.tileHalf, { backgroundColor: item.light }]} />
            <View style={[styles.tileHalf, { backgroundColor: item.dark }]} />
          </Pressable>
        )}
      />

      <Text style={[styles.title, { marginTop: spacingTokens[4] }]}>Pieces</Text>
      <View style={styles.row}>
        {pieceThemes.map((t) => (
          <Pressable
            key={t}
            onPress={() => onSelectPiece && onSelectPiece(t)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedPieceTheme === t }}
            accessibilityLabel={`Select piece theme ${t}`}
            style={[styles.pill, selectedPieceTheme === t ? styles.pillSelected : undefined]}
          >
            <Text style={{ fontSize: 12 }}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacingTokens[3] ?? 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacingTokens[2] ?? 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingTokens[2] ?? 8,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F7F7F8',
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  pillSelected: {
    backgroundColor: '#E6EEF8',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingTokens[2] ?? 8,
  } as any,
  tile: {
    width: 84,
    height: 84,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6E9EE',
  },
  tileSelected: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  tileHalf: {
    flex: 1,
  },
});

export default BoardThemeLeftTools;

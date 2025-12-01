/**
 * Theme Selector Component
 * app/features/theme/components/ThemeSelector.tsx
 * 
 * UI for selecting chess themes (presets, boards, pieces, backgrounds)
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../stores/useThemeStore';
import type { PresetTheme, BoardTheme, PieceTheme, BackgroundTheme } from '../domain/models';

type TabType = 'presets' | 'board' | 'pieces' | 'background';

export const ThemeSelector: React.FC = () => {
  const {
    theme,
    presetId,
    availablePresets,
    availableBoards,
    availablePieces,
    availableBackgrounds,
    setPreset,
    setBoardTheme,
    setPieceTheme,
    setBackgroundTheme,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('presets');

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'presets' && styles.tabActive]}
          onPress={() => setActiveTab('presets')}
        >
          <Text style={[styles.tabText, activeTab === 'presets' && styles.tabTextActive]}>
            Presets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'board' && styles.tabActive]}
          onPress={() => setActiveTab('board')}
        >
          <Text style={[styles.tabText, activeTab === 'board' && styles.tabTextActive]}>
            Board
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pieces' && styles.tabActive]}
          onPress={() => setActiveTab('pieces')}
        >
          <Text style={[styles.tabText, activeTab === 'pieces' && styles.tabTextActive]}>
            Pieces
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'background' && styles.tabActive]}
          onPress={() => setActiveTab('background')}
        >
          <Text style={[styles.tabText, activeTab === 'background' && styles.tabTextActive]}>
            Background
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'presets' && (
          <PresetsTab
            presets={availablePresets}
            activePresetId={presetId}
            onSelect={setPreset}
          />
        )}
        {activeTab === 'board' && (
          <BoardTab
            boards={availableBoards}
            activeBoard={theme.board}
            onSelect={setBoardTheme}
          />
        )}
        {activeTab === 'pieces' && (
          <PiecesTab
            pieces={availablePieces}
            activePieces={theme.pieces}
            onSelect={setPieceTheme}
          />
        )}
        {activeTab === 'background' && (
          <BackgroundTab
            backgrounds={availableBackgrounds}
            activeBackground={theme.background}
            onSelect={setBackgroundTheme}
          />
        )}
      </ScrollView>
    </View>
  );
};

/**
 * Presets Tab
 */
interface PresetsTabProps {
  presets: PresetTheme[];
  activePresetId: string | null;
  onSelect: (id: string) => void;
}

const PresetsTab: React.FC<PresetsTabProps> = ({ presets, activePresetId, onSelect }) => {
  return (
    <View style={styles.grid}>
      {presets.map((preset) => (
        <TouchableOpacity
          key={preset.id}
          style={[
            styles.card,
            activePresetId === preset.id && styles.cardActive,
          ]}
          onPress={() => onSelect(preset.id)}
        >
          <View style={styles.cardPreview}>
            <Text style={styles.previewText}>Preview</Text>
          </View>
          <Text style={styles.cardTitle}>{preset.name}</Text>
          <Text style={styles.cardDescription}>{preset.description}</Text>
          {preset.isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Board Tab
 */
interface BoardTabProps {
  boards: BoardTheme[];
  activeBoard: BoardTheme;
  onSelect: (board: BoardTheme) => void;
}

const BoardTab: React.FC<BoardTabProps> = ({ boards, activeBoard, onSelect }) => {
  return (
    <View style={styles.grid}>
      {boards.map((board) => (
        <TouchableOpacity
          key={board.id}
          style={[
            styles.card,
            activeBoard.id === board.id && styles.cardActive,
          ]}
          onPress={() => onSelect(board)}
        >
          <View style={styles.cardPreview}>
            {/* Board preview: 2x2 checkered pattern */}
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <View style={{ flex: 1, backgroundColor: board.lightSquare }} />
              <View style={{ flex: 1, backgroundColor: board.darkSquare }} />
            </View>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <View style={{ flex: 1, backgroundColor: board.darkSquare }} />
              <View style={{ flex: 1, backgroundColor: board.lightSquare }} />
            </View>
          </View>
          <Text style={styles.cardTitle}>{board.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Pieces Tab
 */
interface PiecesTabProps {
  pieces: PieceTheme[];
  activePieces: PieceTheme;
  onSelect: (pieces: PieceTheme) => void;
}

const PiecesTab: React.FC<PiecesTabProps> = ({ pieces, activePieces, onSelect }) => {
  return (
    <View style={styles.grid}>
      {pieces.map((piece) => (
        <TouchableOpacity
          key={piece.id}
          style={[
            styles.card,
            activePieces.id === piece.id && styles.cardActive,
          ]}
          onPress={() => onSelect(piece)}
        >
          <View style={styles.cardPreview}>
            <Text style={styles.previewText}>{piece.style.toUpperCase()}</Text>
          </View>
          <Text style={styles.cardTitle}>{piece.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Background Tab
 */
interface BackgroundTabProps {
  backgrounds: BackgroundTheme[];
  activeBackground: BackgroundTheme;
  onSelect: (background: BackgroundTheme) => void;
}

const BackgroundTab: React.FC<BackgroundTabProps> = ({ backgrounds, activeBackground, onSelect }) => {
  return (
    <View style={styles.grid}>
      {backgrounds.map((bg) => (
        <TouchableOpacity
          key={bg.id}
          style={[
            styles.card,
            activeBackground.id === bg.id && styles.cardActive,
          ]}
          onPress={() => onSelect(bg)}
        >
          <View
            style={[
              styles.cardPreview,
              {
                backgroundColor: bg.solid?.color || bg.gradient?.colors?.[0] || '#F7FAFC',
              },
            ]}
          >
            <Text style={styles.previewText}>{bg.type.toUpperCase()}</Text>
          </View>
          <Text style={styles.cardTitle}>{bg.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#5856D6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#5856D6',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  cardActive: {
    borderColor: '#5856D6',
    backgroundColor: '#EAE9FF',
  },
  cardPreview: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  previewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
});

ThemeSelector.displayName = 'ThemeSelector';

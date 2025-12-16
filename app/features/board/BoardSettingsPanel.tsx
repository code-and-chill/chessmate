import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack, Text, useColors, HStack, Button } from '@/ui';
import { useBoardTheme } from '@/contexts/BoardThemeContext';
import { themeConfigOptions, getBoardColors as getThemeColors, defaultThemeConfig } from '@/features/board/config/themeConfig';
import type { BoardTheme } from '@/features/board/config/themeConfig';
import { spacingScale, spacingTokens } from '@/ui/tokens/spacing';
import {BoardThemeLayout} from './components/BoardThemeLayout';
import BoardThemeLeftTools from './components/BoardThemeLeftTools';
import {BoardThemeBoardCanvas} from './components/BoardThemeBoardCanvas';

export const BoardSettingsPanel: React.FC = () => {
  const colorsFromHook = useColors();
  const colors = colorsFromHook ?? { background: { primary: '#FFFFFF', secondary: '#F7F7F7' }, text: { primary: '#111827' } };

  // useBoardTheme throws when used outside of a provider. Protect against that and fall back to defaults.
  let boardTheme: BoardTheme = defaultThemeConfig.boardTheme as BoardTheme;
  let pieceTheme: string = defaultThemeConfig.pieceTheme;
  let persistBoardTheme = (_t: BoardTheme) => {};
  let persistPieceTheme = (_t: any) => {};
  try {
    const ctx = useBoardTheme();
    boardTheme = ctx.boardTheme;
    pieceTheme = ctx.pieceTheme;
    persistBoardTheme = ctx.setBoardTheme;
    persistPieceTheme = ctx.setPieceTheme;
  } catch {
    // Intentionally fallback to defaults when provider is missing.
    // This prevents uncaught errors in contexts like previews or stories.
  }

  const boardColors = useMemo< { id: BoardTheme; name: string; light: string; dark: string }[]>(() =>
    themeConfigOptions.boardThemes.map((id) => {
      const tid = id as BoardTheme;
      const c = getThemeColors(tid);
      return { id: tid, name: tid, light: c.lightSquare, dark: c.darkSquare };
    }),
  []);

  const initial = useMemo<{ boardColorId: BoardTheme; pieceTheme: string; showCoordinates: boolean }>(
    () => ({ boardColorId: boardTheme, pieceTheme: pieceTheme, showCoordinates: true }),
    [boardTheme, pieceTheme],
  );
  const [draft, setDraft] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => setDraft(initial), [initial]);

  // Track if there are unsaved changes (draft differs from initial)
  const hasUnsavedChanges = useMemo(() => {
    return draft.boardColorId !== initial.boardColorId || draft.pieceTheme !== initial.pieceTheme;
  }, [draft, initial]);

  // Do not auto-save to provider; allow explicit Save

  const handleQuickChange = (newDraft: any) => {
    setDraft((prev) => ({ ...prev, ...newDraft }));
    setIsSaved(false); // Clear saved state when changes are made
  };

  const handleSave = async () => {
    // Provide basic UI feedback and avoid spamming provider
    try {
      setIsSaving(true);
      // If provider missing, these are no-ops
      await Promise.resolve(persistBoardTheme(draft.boardColorId as BoardTheme));
      await Promise.resolve(persistPieceTheme(draft.pieceTheme as any));

      setIsSaved(true);
      // brief feedback
      setTimeout(() => setIsSaved(false), 1500);
    } catch (err) {
      console.error('Failed to save board theme', err);
    } finally {
      setIsSaving(false);
    }
  };

  // NOTE: Reset removed for better UX (keeping changes in draft until Save is pressed)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <VStack gap={spacingTokens[2]} style={styles.header}>
        <VStack gap={spacingTokens[1]}>
          <Text variant="display" weight="bold" style={styles.title}>Board Theme</Text>
          <Text variant="body" style={styles.subtitle}>
            Personalize your playing experience with custom board colors and piece styles
          </Text>
        </VStack>
        {hasUnsavedChanges && (
          <View style={styles.unsavedIndicator}>
            <Text variant="caption" style={[styles.unsavedText, { color: colors.accent.primary }]}>
              • Unsaved changes
            </Text>
          </View>
        )}
      </VStack>

      <BoardThemeLayout compactAt={768}>
        <BoardThemeLeftTools
          boardColors={boardColors}
          selectedId={draft.boardColorId}
          onSelect={(id: string) => handleQuickChange({ boardColorId: id as BoardTheme })}
          pieceThemes={[...themeConfigOptions.pieceThemes]}
          selectedPieceTheme={draft.pieceTheme}
          onSelectPiece={(t: string) => handleQuickChange({ pieceTheme: t })}
        />

        <VStack gap={spacingTokens[3]} style={styles.previewSection}>
          <BoardThemeBoardCanvas
            draft={draft}
            availableBoardColors={boardColors}
          />
          <VStack gap={spacingTokens[2]} style={styles.saveButtonContainer}>
            {hasUnsavedChanges && (
              <Text variant="caption" style={[styles.hintText, { color: colors.foreground.tertiary }]}>
                Your changes will be applied to all future games
              </Text>
            )}
            <Button 
              variant="primary" 
              onPress={handleSave} 
              isLoading={isSaving}
              disabled={!hasUnsavedChanges && !isSaving}
              style={styles.saveButton}
            >
              {isSaved ? 'Saved ✓' : hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
            </Button>
          </VStack>
        </VStack>
       </BoardThemeLayout>
     </SafeAreaView>
   );
 };

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: spacingScale.gutter,
    paddingTop: spacingTokens[3],
    paddingBottom: spacingTokens[4],
  },
  header: { 
    marginBottom: spacingTokens[4],
  },
  title: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  previewSection: {
    flex: 1,
    minWidth: 280,
  },
  saveButtonContainer: {
    justifyContent: 'center',
    width: '100%',
  },
  saveButton: {
    flex: 1,
    maxWidth: 400,
    alignSelf: 'center',
  },
  unsavedIndicator: {
    marginTop: spacingTokens[1],
  },
  unsavedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

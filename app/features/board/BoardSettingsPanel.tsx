import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack, Text, useColors, HStack, Button } from '@/ui';
import { useBoardTheme } from '@/contexts/BoardThemeContext';
import { themeConfigOptions, getBoardColors as getThemeColors, defaultThemeConfig } from '@/features/board/config/themeConfig';
import type { BoardTheme } from '@/features/board/config/themeConfig';
import { spacingScale } from '@/ui/tokens/spacing';
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

  // Do not auto-save to provider; allow explicit Save

  const handleQuickChange = (newDraft: any) => {
    setDraft((prev) => ({ ...prev, ...newDraft }));
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
      <VStack gap={spacingScale.gap} style={styles.header}>
        <Text variant="display" weight="bold">Board Theme</Text>
        <Text variant="body">Customize your chess board appearance</Text>
      </VStack>

      <BoardThemeLayout compactAt={640}>
        <BoardThemeLeftTools
          boardColors={boardColors}
          selectedId={draft.boardColorId}
          onSelect={(id: string) => handleQuickChange({ boardColorId: id as BoardTheme })}
          pieceThemes={[...themeConfigOptions.pieceThemes]}
          selectedPieceTheme={draft.pieceTheme}
          onSelectPiece={(t: string) => handleQuickChange({ pieceTheme: t })}
        />

        <BoardThemeBoardCanvas
          draft={draft}
          availableBoardColors={boardColors}
        />
        <HStack gap={spacingScale.gap} style={{ marginTop: spacingScale.gap, justifyContent: 'center' }}>
          <Button variant="primary" onPress={handleSave} isLoading={isSaving}>{isSaved ? 'Saved' : 'Save'}</Button>
        </HStack>
       </BoardThemeLayout>
     </SafeAreaView>
   );
 };

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacingScale.gutter },
  header: { marginBottom: spacingScale.lg },
});

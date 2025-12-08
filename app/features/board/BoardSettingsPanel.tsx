import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack, HStack, Text, useColors, InteractivePressable } from '@/ui';
import { Card } from '@/ui/primitives/Card';
import { useBoardTheme } from '@/contexts/BoardThemeContext';
import { ChessBoard } from '@/features/board/components/ChessBoard';
import { themeConfigOptions, getBoardColors as getThemeColors } from '@/features/board/config/themeConfig';
import type { PieceTheme } from '@/features/board/types/pieces';
import { spacingScale, spacingTokens } from '@/ui/tokens/spacing';
import { radiusTokens, radiusScale } from '@/ui/tokens/radii';
import { shadowTokens } from '@/ui/tokens/shadows';
import { useBreakpoint } from '@/ui/hooks/useResponsive';
import { useI18n } from '@/i18n/I18nContext';

export const BoardSettingsPanel: React.FC = () => {
  const colors = useColors();
  const { t } = useI18n();
  const bp = useBreakpoint();
  const { boardTheme, pieceTheme, setBoardTheme, setPieceTheme } = useBoardTheme();
  const isDesktop = bp === 'lg' || bp === 'xl' || bp === 'xxl';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.layoutContainer}>
        {/* Left Side - Live Board Preview */}
        <View style={[styles.previewSection, isDesktop && styles.previewSectionDesktop]}>
          <VStack gap={spacingScale.gap} style={styles.previewContent}>
            <Text variant="titleSmall" weight="bold" color={colors.foreground.primary}>{t('board.settings.livePreview','Live Preview')}</Text>
            <View style={styles.boardContainer}>
              <ChessBoard
                fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                boardTheme={boardTheme}
                pieceTheme={pieceTheme}
                isInteractive={false}
                showCoordinates={true}
                size={isDesktop ? spacingScale.boardPreviewLarge : Math.min(spacingTokens[10], spacingScale.boardPreviewSmall)}
              />
            </View>
          </VStack>
        </View>

        {/* Right Side - Theme Selectors */}
        <ScrollView
          style={[styles.settingsSection, isDesktop && styles.settingsSectionDesktop]}
          contentContainerStyle={styles.settingsContent}
        >
          <VStack gap={spacingScale.xl} style={styles.content}>
          {/* Header */}
          <VStack gap={spacingScale.sm}>
            <Text variant="display" weight="bold" color={colors.foreground.primary}>{t('board.settings.title','Board Theme')}</Text>
            <Text variant="body" weight="medium" color={colors.foreground.secondary}>
              {t('board.settings.subtitle','Customize your chess board appearance')}
            </Text>
           </VStack>

          {/* Board Theme Selection */}
          <VStack gap={spacingScale.gap}>
            <Text variant="titleSmall" weight="semibold" color={colors.foreground.primary}>{t('board.settings.boardColorsHeading','Board Colors')}</Text>
            <VStack gap={spacingScale.gap}>
              {themeConfigOptions.boardThemes.map((theme) => {
                const themeColors = getThemeColors(theme);
                const isActive = boardTheme === theme;
                return (
                  <InteractivePressable
                    key={theme}
                    onPress={() => {
                      console.log('Board theme pressed:', theme);
                      setBoardTheme(theme);
                    }}
                    style={{ padding: 0 }}
                  >
                    <Card
                      variant={isActive ? 'elevated' : 'outline'}
                      size="md"
                      style={{ pointerEvents: 'box-none' } as any}
                    >
                      <HStack gap={spacingScale.gap} style={{ alignItems: 'center' }}>
                        {/* Color Preview */}
                        <HStack gap={spacingScale.xs} style={styles.colorPreview}>
                          <View
                            style={{
                              width: spacingScale.iconSize,
                              height: spacingScale.iconSize,
                              backgroundColor: themeColors.lightSquare,
                              borderRadius: radiusTokens.sm,
                            }}
                          />
                          <View
                            style={{
                              width: spacingScale.iconSize,
                              height: spacingScale.iconSize,
                              backgroundColor: themeColors.darkSquare,
                              borderRadius: radiusTokens.sm,
                            }}
                          />
                        </HStack>

                        {/* Theme Name */}
                        <VStack gap={0} style={{ flex: 1 }}>
                          <Text variant="body" weight="semibold" color={colors.foreground.primary}>
                            {t(`board.boardThemes.${theme}.name`, theme.charAt(0).toUpperCase() + theme.slice(1))}
                          </Text>
                          {isActive && (
                            <Text variant="caption" weight="medium" color={colors.accent.primary}>{t('common.active','✓ Active')}</Text>
                          )}
                        </VStack>

                        {/* Selection Indicator */}
                        {isActive && (
                          <Text variant="titleSmall" weight="bold" color={colors.accent.primary}>✓</Text>
                        )}
                      </HStack>
                    </Card>
                  </InteractivePressable>
                );
              })}
            </VStack>
          </VStack>

          {/* Piece Theme Selection */}
          <VStack gap={spacingScale.gap}>
            <Text variant="titleSmall" weight="semibold" color={colors.foreground.primary}>{t('board.settings.pieceStyleHeading','Piece Style')}</Text>
            <VStack gap={spacingScale.gap}>
              {themeConfigOptions.pieceThemes.map((theme) => {
                const isActive = pieceTheme === theme;
                const themeLabels: Record<PieceTheme, { name: string; description: string }> = {
                  minimal: { name: 'Minimal', description: 'Clean, modern flat design' },
                  solid: { name: 'Solid', description: 'Filled shapes, bold appearance' },
                  outline: { name: 'Outline', description: 'Thick strokes, minimalist' },
                  classic: { name: 'Classic', description: 'Traditional chess pieces' },
                  neon: { name: 'Neon Glow', description: 'Cyberpunk glowing effects' },
                  glass: { name: 'Glass', description: 'Translucent glass effect' },
                  wood: { name: 'Wood Carved', description: 'Traditional wooden pieces' },
                  pixel: { name: 'Pixel Art', description: 'Retro 8-bit style' },
                  sketch: { name: 'Sketch', description: 'Hand-drawn artistic style' },
                };
                const label = themeLabels[theme];
                return (
                  <InteractivePressable
                    key={theme}
                    onPress={() => setPieceTheme(theme)}
                    style={{ padding: 0 }}
                  >
                    <Card
                      variant={isActive ? 'elevated' : 'outline'}
                      size="md"
                      style={{ pointerEvents: 'box-none' } as any}
                    >
                      <HStack gap={spacingScale.gap} style={{ alignItems: 'center' }}>
                        <Text variant="displayLarge" color={colors.foreground.primary}>♔</Text>
                        <VStack gap={0} style={{ flex: 1 }}>
                          <Text variant="body" weight="semibold" color={colors.foreground.primary}>{t(`board.pieceThemes.${theme}.name`, label.name)}</Text>
                          <Text variant="caption" color={colors.foreground.tertiary}>{t(`board.pieceThemes.${theme}.description`, label.description)}</Text>
                          {isActive && (
                            <Text variant="caption" weight="medium" color={colors.accent.primary}>{t('common.active','✓ Active')}</Text>
                          )}
                        </VStack>
                        {isActive && (
                          <Text variant="titleSmall" weight="bold" color={colors.accent.primary}>{t('common.activeSymbol','✓')}</Text>
                        )}
                      </HStack>
                    </Card>
                  </InteractivePressable>
                );
              })}
            </VStack>
          </VStack>

        </VStack>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  previewSection: {
    flex: 1,
    padding: spacingScale.gutter,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: spacingScale.previewMinWidth,
  },
  previewSectionDesktop: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  previewContent: {
    alignItems: 'center',
    maxWidth: spacingScale.previewContentMaxWidth,
    width: '100%',
  },
  previewTitle: {
    textAlign: 'center',
    marginBottom: spacingScale.sm,
  },
  boardContainer: {
    marginVertical: spacingScale.lg,
    ...shadowTokens.card,
  },
  infoCard: {
    padding: spacingScale.cardPadding,
    borderRadius: radiusScale.card,
    width: '100%',
    gap: spacingScale.sm,
  },
  settingsSection: {
    flex: 1,
  },
  settingsSectionDesktop: {
    maxWidth: spacingScale.settingsPanelMaxWidth,
  },
  settingsContent: {
    padding: spacingScale.xl,
  },
  content: {
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacingScale.sm,
    paddingHorizontal: spacingScale.md,
    marginBottom: spacingScale.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacingScale.md,
    paddingHorizontal: spacingScale.gutter,
    borderRadius: radiusScale.card,
    borderWidth: 2,
    alignItems: 'center',
  },
  colorPreview: {
    padding: spacingScale.xs,
    borderRadius: radiusTokens.md,
  },
});

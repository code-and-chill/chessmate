 import { StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { VStack, HStack, Text, useColors } from '@/ui';
import { Card } from '@/ui/primitives/Card';
import { useBoardTheme } from '@/contexts/BoardThemeContext';
import { ChessBoard } from '@/features/board/components/ChessBoard';
import {
  themeConfigOptions,
  getBoardColors as getThemeColors,
  type PieceTheme,
} from '@/features/board/config/themeConfig';

export default function BoardThemeSettings() {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const { mode, boardTheme, pieceTheme, setMode, setBoardTheme, setPieceTheme, getBoardColors } = useBoardTheme();
    getBoardColors();
    const isDesktop = width >= 768;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.layoutContainer}>
        {/* Left Side - Live Board Preview */}
        <View style={[styles.previewSection, isDesktop && styles.previewSectionDesktop]}>
          <VStack gap={4} style={styles.previewContent}>
            <Text style={[styles.previewTitle, { color: colors.foreground.primary }]}>
              Live Preview
            </Text>
            <View style={styles.boardContainer}>
              <ChessBoard
                fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                boardTheme={boardTheme}
                themeMode={mode}
                pieceTheme={pieceTheme}
                isInteractive={false}
                showCoordinates={true}
                size={isDesktop ? 400 : Math.min(width - 80, 360)}
              />
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.background.secondary }]}>
              <Text style={[styles.infoText, { color: colors.foreground.secondary }]}>
                <Text style={{ fontWeight: '600' }}>Mode:</Text> {mode === 'light' ? '☀️ Light' : '🌙 Dark'}
              </Text>
              <Text style={[styles.infoText, { color: colors.foreground.secondary }]}>
                <Text style={{ fontWeight: '600' }}>Board:</Text> {boardTheme.charAt(0).toUpperCase() + boardTheme.slice(1)}
              </Text>
              <Text style={[styles.infoText, { color: colors.foreground.secondary }]}>
                <Text style={{ fontWeight: '600' }}>Pieces:</Text> {pieceTheme.charAt(0).toUpperCase() + pieceTheme.slice(1)}
              </Text>
            </View>
          </VStack>
        </View>

        {/* Right Side - Theme Selectors */}
        <ScrollView 
          style={[styles.settingsSection, isDesktop && styles.settingsSectionDesktop]}
          contentContainerStyle={styles.settingsContent}
        >
          <VStack gap={6} style={styles.content}>
          {/* Header */}
          <VStack gap={2}>
            <TouchableOpacity 
              onPress={() => {
                console.log('Back button pressed!');
                router.back();
              }} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.backText, { color: colors.accent.primary }]}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.foreground.primary }]}>Board Theme</Text>
            <Text style={[styles.subtitle, { color: colors.foreground.secondary }]}>
              Customize your chess board appearance
            </Text>
          </VStack>

          {/* Mode Selection */}
          <VStack gap={3}>
            <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Mode</Text>
            <HStack gap={3}>
              {themeConfigOptions.modes.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.modeButton,
                    { 
                      backgroundColor: mode === m ? colors.accent.primary : colors.background.secondary,
                      borderColor: colors.background.tertiary,
                    },
                  ]}
                  onPress={() => {
                    console.log('Mode button pressed:', m);
                    setMode(m);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      { color: mode === m ? '#FFFFFF' : colors.foreground.primary },
                    ]}
                  >
                    {m === 'light' ? '☀️ Light' : '🌙 Dark'}
                  </Text>
                </TouchableOpacity>
              ))}
            </HStack>
          </VStack>

          {/* Board Theme Selection */}
          <VStack gap={3}>
            <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Board Colors</Text>
            <VStack gap={3}>
              {themeConfigOptions.boardThemes.map((theme) => {
                const themeColors = getThemeColors(theme, mode);
                const isActive = boardTheme === theme;
                return (
                  <TouchableOpacity
                    key={theme}
                    onPress={() => {
                      console.log('Board theme pressed:', theme);
                      setBoardTheme(theme);
                    }}
                    activeOpacity={0.7}
                  >
                    <Card
                      variant={isActive ? 'elevated' : 'outline'}
                      size="md"
                      style={{ pointerEvents: 'box-none' } as any}
                    >
                      <HStack gap={4} style={{ alignItems: 'center' }}>
                        {/* Color Preview */}
                        <HStack gap={1} style={styles.colorPreview}>
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              backgroundColor: themeColors.lightSquare,
                              borderRadius: 4,
                            }}
                          />
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              backgroundColor: themeColors.darkSquare,
                              borderRadius: 4,
                            }}
                          />
                        </HStack>

                        {/* Theme Name */}
                        <VStack gap={0} style={{ flex: 1 }}>
                          <Text style={[styles.themeName, { color: colors.foreground.primary }]}>
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </Text>
                          {isActive && (
                            <Text style={[styles.themeActive, { color: colors.accent.primary }]}>
                              ✓ Active
                            </Text>
                          )}
                        </VStack>

                        {/* Selection Indicator */}
                        {isActive && (
                          <Text style={[styles.checkmark, { color: colors.accent.primary }]}>✓</Text>
                        )}
                      </HStack>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </VStack>
          </VStack>

          {/* Piece Theme Selection */}
          <VStack gap={3}>
            <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Piece Style</Text>
            <VStack gap={3}>
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
                  <TouchableOpacity
                    key={theme}
                    onPress={() => setPieceTheme(theme)}
                    activeOpacity={0.7}
                  >
                    <Card
                      variant={isActive ? 'elevated' : 'outline'}
                      size="md"
                      style={{ pointerEvents: 'box-none' } as any}
                    >
                      <HStack gap={4} style={{ alignItems: 'center' }}>
                        <Text style={styles.pieceIcon}>♔</Text>
                        <VStack gap={0} style={{ flex: 1 }}>
                          <Text style={[styles.themeName, { color: colors.foreground.primary }]}>
                            {label.name}
                          </Text>
                          <Text style={[styles.themeDescription, { color: colors.foreground.tertiary }]}>
                            {label.description}
                          </Text>
                          {isActive && (
                            <Text style={[styles.themeActive, { color: colors.accent.primary }]}>
                              ✓ Active
                            </Text>
                          )}
                        </VStack>
                        {isActive && (
                          <Text style={[styles.checkmark, { color: colors.accent.primary }]}>✓</Text>
                        )}
                      </HStack>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </VStack>
          </VStack>

        </VStack>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

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
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 300,
  },
  previewSectionDesktop: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  previewContent: {
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  boardContainer: {
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  settingsSection: {
    flex: 1,
  },
  settingsSectionDesktop: {
    maxWidth: 500,
  },
  settingsContent: {
    padding: 20,
  },
  content: {
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorPreview: {
    padding: 4,
    borderRadius: 8,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeActive: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 24,
    fontWeight: '700',
  },
  pieceIcon: {
    fontSize: 32,
    padding: 8,
  },
  themeDescription: {
    fontSize: 13,
    marginTop: 2,
  },
});

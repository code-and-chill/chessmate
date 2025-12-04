 import { StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { VStack, HStack, Text, useColors } from '@/ui';
import { Card } from '@/ui/primitives/Card';
import { useBoardTheme } from '@/contexts/BoardThemeContext';
import {
  themeConfigOptions,
  getBoardColors as getThemeColors,
  type BoardTheme,
  type ThemeMode,
  type PieceTheme,
} from '@/features/board/config/themeConfig';

export default function BoardThemeSettings() {
  const colors = useColors();
  const { mode, boardTheme, pieceTheme, setMode, setBoardTheme, setPieceTheme, getBoardColors, isLoading } = useBoardTheme();

  console.log('BoardThemeSettings rendered!', { mode, boardTheme, pieceTheme, isLoading });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={[styles.loaderText, { color: colors.foreground.secondary }]}>
            Loading theme settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentColors = getBoardColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]} pointerEvents="auto">
      <ScrollView contentContainerStyle={styles.scrollContent} pointerEvents="auto">
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
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
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

          {/* Preview Section */}
          <VStack gap={3}>
            <Text style={[styles.sectionTitle, { color: colors.foreground.primary }]}>Preview</Text>
            <Card variant="elevated" size="lg">
              <VStack gap={2} style={{ alignItems: 'center' }}>
                <Text style={[styles.previewTitle, { color: colors.foreground.primary }]}>
                  Current Selection
                </Text>
                <Text style={[styles.previewText, { color: colors.foreground.secondary }]}>
                  Mode: {mode} | Board: {boardTheme} | Pieces: {pieceTheme}
                </Text>
                {/* Mini board preview - 2x2 squares */}
                <View style={styles.miniBoard}>
                  <View style={styles.miniRow}>
                    <View style={[styles.miniSquare, { backgroundColor: currentColors.lightSquare }]} />
                    <View style={[styles.miniSquare, { backgroundColor: currentColors.darkSquare }]} />
                  </View>
                  <View style={styles.miniRow}>
                    <View style={[styles.miniSquare, { backgroundColor: currentColors.darkSquare }]} />
                    <View style={[styles.miniSquare, { backgroundColor: currentColors.lightSquare }]} />
                  </View>
                </View>
              </VStack>
            </Card>
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 20,
    fontSize: 17,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
  },
  content: {
    maxWidth: 600,
    alignSelf: 'center',
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
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  miniBoard: {
    width: 120,
    height: 120,
  },
  miniRow: {
    flexDirection: 'row',
  },
  miniSquare: {
    width: 60,
    height: 60,
  },
});

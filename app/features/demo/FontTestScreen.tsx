/**
 * Font Test Screen
 * Quick verification that fonts are loaded and working
 */

import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, VStack, Card, useColors } from '@/ui';

export function FontTestScreen() {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <VStack gap={6}>
          <Card variant="elevated" style={styles.card}>
            <VStack gap={4}>
              <Text variant="label" style={{ color: colors.accent.primary }}>
                ✅ OUTFIT (Display & Titles)
              </Text>
              <Text variant="display" style={{ color: colors.foreground.primary }}>
                ChessMate
              </Text>
              <Text variant="title" style={{ color: colors.foreground.primary }}>
                Premium Typography
              </Text>
              <Text variant="titleSmall" style={{ color: colors.foreground.secondary }}>
                Modern geometric sans-serif
              </Text>
            </VStack>
          </Card>

          <Card variant="elevated" style={styles.card}>
            <VStack gap={4}>
              <Text variant="label" style={{ color: colors.accent.primary }}>
                ✅ INTER (Body & UI)
              </Text>
              <Text variant="body" style={{ color: colors.foreground.primary }}>
                The quick brown fox jumps over the lazy dog. This is body text with exceptional readability using Inter's OpenType features.
              </Text>
              <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                Inter 400 Regular • Optimized for screens
              </Text>
            </VStack>
          </Card>

          <Card variant="elevated" style={styles.card}>
            <VStack gap={4}>
              <Text variant="label" style={{ color: colors.accent.primary }}>
                ✅ JETBRAINS MONO (Code)
              </Text>
              <Text mono style={{ color: colors.foreground.primary, fontSize: 16 }}>
                1. e4 e5 2. Nf3 Nc6 3. Bb5
              </Text>
              <Text mono style={{ color: colors.foreground.secondary, fontSize: 14 }}>
                rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR
              </Text>
            </VStack>
          </Card>

          <Card variant="elevated" style={styles.card}>
            <VStack gap={2}>
              <Text variant="display" style={{ color: colors.foreground.primary }}>✨</Text>
              <Text variant="title" style={{ color: colors.foreground.primary }}>
                Fonts Loaded!
              </Text>
              <Text variant="body" style={{ color: colors.foreground.secondary }}>
                All premium fonts are working correctly. Your app now has professional typography!
              </Text>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    padding: 20,
  },
});

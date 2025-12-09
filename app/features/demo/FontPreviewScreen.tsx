/**
 * Font Preview Component
 * app/features/demo/FontPreviewScreen.tsx
 * 
 * Showcases the new premium font stack with before/after comparison
 */

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, VStack, HStack, Card, useColors } from '@/ui';

export function FontPreviewScreen() {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack gap={6} style={styles.content}>
          {/* Header */}
          <VStack gap={2} style={styles.section}>
            <Text variant="display" style={{ color: colors.foreground.primary }}>
              Premium Font Stack
            </Text>
            <Text variant="body" style={{ color: colors.foreground.secondary }}>
              Outfit for display, Inter for body, JetBrains Mono for code
            </Text>
          </VStack>

          {/* Display Fonts */}
          <Card variant="elevated" style={styles.card}>
            <VStack gap={4}>
              <Text variant="label" style={{ color: colors.accent.primary }}>
                DISPLAY & TITLES (Outfit)
              </Text>
              
              <VStack gap={3}>
                <Text variant="display" style={{ color: colors.foreground.primary }}>
                  The quick brown fox
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                  Outfit 700 Bold • 32px • Display variant
                </Text>
              </VStack>

              <VStack gap={3}>
                <Text variant="title" style={{ color: colors.foreground.primary }}>
                  The quick brown fox jumps
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                  Outfit 600 SemiBold • 24px • Title variant
                </Text>
              </VStack>

              <VStack gap={3}>
                <Text variant="titleSmall" style={{ color: colors.foreground.primary }}>
                  The quick brown fox jumps over
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                  Outfit 500 Medium • 18px • TitleSmall variant
                </Text>
              </VStack>
            </VStack>
          </Card>

          {/* Body Fonts */}
          <Card variant="elevated" style={styles.card}>
            <VStack gap={4}>
              <Text variant="label" style={{ color: colors.accent.primary }}>
                BODY & UI (Inter)
              </Text>
              
              <VStack gap={3}>
                <Text variant="body" style={{ color: colors.foreground.primary }}>
                  The quick brown fox jumps over the lazy dog. This is body text optimized for readability with Inter's exceptional letterforms and OpenType features.
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                  Inter 400 Regular • 16px • Body variant
                </Text>
              </VStack>

              <VStack gap={3}>
                <Text variant="bodyMedium" style={{ color: colors.foreground.primary }}>
                  The quick brown fox jumps over the lazy dog. This is medium body text for secondary content with excellent readability.
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                  Inter 400 Regular • 14px • BodyMedium variant
                </Text>
              </VStack>

              <VStack gap={3}>
                <Text variant="caption" style={{ color: colors.foreground.secondary }}>
                  The quick brown fox jumps over the lazy dog. This is caption text for metadata.
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                  Inter 400 Regular • 13px • Caption variant
                </Text>
              </VStack>
            </VStack>
          </Card>

          {/* Monospace Fonts */}
          <Card variant="elevated" style={styles.card}>
            <VStack gap={4}>
              <Text variant="label" style={{ color: colors.accent.primary }}>
                CODE & NOTATION (JetBrains Mono)
              </Text>
              
              <VStack gap={3}>
                <Text mono style={{ color: colors.foreground.primary, fontSize: 16 }}>
                  1. e4 e5 2. Nf3 Nc6 3. Bb5 a6
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                  Chess notation with clear piece distinction
                </Text>
              </VStack>

              <VStack gap={3}>
                <Text mono style={{ color: colors.foreground.primary, fontSize: 14 }}>
                  rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                  FEN string with monospaced alignment
                </Text>
              </VStack>

              <VStack gap={3}>
                <Text mono style={{ color: colors.foreground.primary, fontSize: 14 }}>
                  const game = new Chess();{'\n'}
                  game.move('e4');{'\n'}
                  console.log(game.fen());
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.tertiary }}>
                  Code snippet with clear syntax
                </Text>
              </VStack>
            </VStack>
          </Card>

          {/* Real-World Example */}
          <Card variant="elevated" style={styles.card}>
            <VStack gap={4}>
              <Text variant="label" style={{ color: colors.accent.primary }}>
                REAL-WORLD EXAMPLE
              </Text>
              
              <VStack gap={3}>
                <Text variant="title" style={{ color: colors.foreground.primary }}>
                  🏆 Tournament Final
                </Text>
                <Text variant="body" style={{ color: colors.foreground.secondary }}>
                  Magnus Carlsen vs. Hikaru Nakamura • Classical Time Control
                </Text>
                <Text mono style={{ color: colors.foreground.tertiary, fontSize: 13 }}>
                  Rating: 2830 vs. 2790
                </Text>
              </VStack>

              <VStack gap={2}>
                <HStack gap={3} style={{ justifyContent: 'space-between' }}>
                  <Text variant="label" style={{ color: colors.foreground.primary }}>
                    Opening
                  </Text>
                  <Text variant="body" style={{ color: colors.foreground.secondary }}>
                    Sicilian Defense
                  </Text>
                </HStack>
                <HStack gap={3} style={{ justifyContent: 'space-between' }}>
                  <Text variant="label" style={{ color: colors.foreground.primary }}>
                    Moves
                  </Text>
                  <Text variant="body" style={{ color: colors.foreground.secondary }}>
                    42 moves
                  </Text>
                </HStack>
                <HStack gap={3} style={{ justifyContent: 'space-between' }}>
                  <Text variant="label" style={{ color: colors.foreground.primary }}>
                    Result
                  </Text>
                  <Text variant="body" style={{ color: colors.accent.primary }}>
                    1-0
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Card>

          {/* Typography Scale */}
          <Card variant="elevated" style={styles.card}>
            <VStack gap={4}>
              <Text variant="label" style={{ color: colors.accent.primary }}>
                TYPOGRAPHY SCALE
              </Text>
              
              <VStack gap={2}>
                <Text variant="display" style={{ color: colors.foreground.primary }}>
                  Display 32px
                </Text>
                <Text variant="displayLarge" style={{ color: colors.foreground.primary }}>
                  Display Large 28px
                </Text>
                <Text variant="title" style={{ color: colors.foreground.primary }}>
                  Title 24px
                </Text>
                <Text variant="titleMedium" style={{ color: colors.foreground.primary }}>
                  Title Medium 20px
                </Text>
                <Text variant="titleSmall" style={{ color: colors.foreground.primary }}>
                  Title Small 18px
                </Text>
                <Text variant="body" style={{ color: colors.foreground.primary }}>
                  Body 16px
                </Text>
                <Text variant="bodyMedium" style={{ color: colors.foreground.primary }}>
                  Body Medium 14px
                </Text>
                <Text variant="caption" style={{ color: colors.foreground.secondary }}>
                  Caption 13px
                </Text>
                <Text variant="captionSmall" style={{ color: colors.foreground.tertiary }}>
                  Caption Small 12px
                </Text>
              </VStack>
            </VStack>
          </Card>

          {/* Benefits */}
          <Card variant="elevated" style={styles.card}>
            <VStack gap={4}>
              <Text variant="label" style={{ color: colors.accent.primary }}>
                WHY THIS FONT STACK?
              </Text>
              
              <VStack gap={3}>
                <VStack gap={1}>
                  <Text variant="titleSmall" style={{ color: colors.foreground.primary }}>
                    ✨ Professional Appearance
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.foreground.secondary }}>
                    Outfit's geometric design creates a modern, trustworthy aesthetic matching top-tier SaaS products.
                  </Text>
                </VStack>

                <VStack gap={1}>
                  <Text variant="titleSmall" style={{ color: colors.foreground.primary }}>
                    📖 Superior Readability
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.foreground.secondary }}>
                    Inter's OpenType features and precise letterforms ensure exceptional legibility at all sizes.
                  </Text>
                </VStack>

                <VStack gap={1}>
                  <Text variant="titleSmall" style={{ color: colors.foreground.primary }}>
                    🎯 Clear Hierarchy
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.foreground.secondary }}>
                    Distinct fonts for display vs. body create immediate visual hierarchy without relying on size alone.
                  </Text>
                </VStack>

                <VStack gap={1}>
                  <Text variant="titleSmall" style={{ color: colors.foreground.primary }}>
                    🔧 Technical Precision
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.foreground.secondary }}>
                    JetBrains Mono ensures chess notation and code are crystal clear with perfect monospace alignment.
                  </Text>
                </VStack>
              </VStack>
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
  scrollContent: {
    padding: 24,
  },
  content: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  section: {
    marginBottom: 8,
  },
  card: {
    padding: 20,
  },
});

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack, Text, InteractivePressable, useColors } from '@/ui';

export default function NotFoundPage(): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const colorsFromHook = useColors();
  const colors = colorsFromHook ?? { background: { primary: '#FFFFFF', secondary: '#F7F7F7' }, foreground: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' }, accentForeground: { primary: '#FFFFFF' }, accent: { primary: '#0a84ff' } };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.inner}>
        <VStack gap={16} style={styles.content}>
          <Text variant="display" weight="bold" color={colors.foreground.primary}>Page not found</Text>
          <Text variant="body" color={colors.foreground.secondary}>We could not find the page for:</Text>
          <Text variant="caption" color={colors.foreground.tertiary}>{pathname || '/'}</Text>

          <VStack gap={12} style={{ width: '100%', alignItems: 'stretch' }}>
            <InteractivePressable onPress={() => router.push('/')} style={styles.button}>
              <Text variant="body" weight="semibold" color={colors.accentForeground.primary}>Go to Home</Text>
            </InteractivePressable>

            <InteractivePressable onPress={() => router.push('/explore')} style={styles.ghostButton}>
              <Text variant="body" color={colors.foreground.primary}>Explore</Text>
            </InteractivePressable>

            <InteractivePressable onPress={() => router.push('/(tabs)/play' as any)} style={styles.ghostButton}>
              <Text variant="body" color={colors.foreground.primary}>Play</Text>
            </InteractivePressable>
          </VStack>
        </VStack>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  content: { width: '100%', maxWidth: 680, alignItems: 'center' },
  button: { backgroundColor: '#0a84ff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  ghostButton: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
});

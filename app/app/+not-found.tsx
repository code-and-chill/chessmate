import React from 'react';
import { StyleSheet, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack, Text, InteractivePressable, useColors, Button, spacingTokens, radiusTokens } from '@/ui';

export default function NotFoundPage(): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <View style={styles.inner}>
        <VStack gap={4} style={styles.content}>
          <Text variant="display" weight="bold" color={colors.foreground.primary}>Page not found</Text>
          <Text variant="body" color={colors.foreground.secondary}>We could not find the page for:</Text>
          <Text variant="caption" color={colors.foreground.tertiary}>{pathname || '/'}</Text>

          <VStack gap={3} style={{ width: '100%', alignItems: 'stretch' }}>
            <Button
              variant="primary"
              onPress={() => router.push('/')}
            >
              Go to Home
            </Button>

            <Button
              variant="outline"
              onPress={() => router.push('/explore')}
            >
              Explore
            </Button>

            <Button
              variant="outline"
              onPress={() => router.push('/(tabs)/play' as any)}
            >
              Play
            </Button>
          </VStack>
        </VStack>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacingTokens[5] },
  content: { width: '100%', maxWidth: 680, alignItems: 'center' },
});

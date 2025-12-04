import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/ui';
import { useThemeTokens } from '@/ui';

function HeaderActions() {
  const router = useRouter();
  const { mode, setMode, colors } = useThemeTokens();
  const toggle = () => setMode(mode === 'dark' ? 'light' : 'dark');
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingRight: 12 }}>
      <TouchableOpacity onPress={() => router.push('/search')} accessibilityLabel="Search">
        <IconSymbol size={22} name="magnifyingglass" color={colors.accent.primary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggle} accessibilityLabel="Toggle Theme">
        <IconSymbol size={22} name={mode === 'dark' ? 'sun.max.fill' : 'moon.fill'} color={colors.accent.primary} />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerRight: () => <HeaderActions />,
        headerStyle: {
          backgroundColor: colors.background.secondary,
        },
        headerTintColor: colors.foreground.primary,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Live Chess' }} />
      <Stack.Screen name="play" options={{ headerShown: false }} />
      <Stack.Screen name="puzzle" options={{ title: 'Puzzles' }} />
      <Stack.Screen name="explore" options={{ title: 'Explore' }} />
      <Stack.Screen name="learn" options={{ title: 'Learn' }} />
      <Stack.Screen name="social" options={{ title: 'Social' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}

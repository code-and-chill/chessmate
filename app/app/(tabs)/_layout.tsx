import { Stack } from 'expo-router';
import { useThemeTokens } from '@/ui';

export default function TabLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
          headerStyle: {
          backgroundColor: colors.background.secondary,
        },
        headerTintColor: colors.foreground.primary,
      }}
    >
      <Stack.Screen name="index"/>
      <Stack.Screen name="play"/>
      <Stack.Screen name="puzzle"/>
      <Stack.Screen name="explore" />
      <Stack.Screen name="learn" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

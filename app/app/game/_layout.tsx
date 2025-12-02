import { Stack } from 'expo-router';
import { useThemeTokens } from '@/ui';

export default function GameLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background.secondary,
        },
        headerTintColor: colors.foreground.primary,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Game',
        }} 
      />
    </Stack>
  );
}

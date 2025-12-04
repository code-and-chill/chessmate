import { Stack } from 'expo-router';
import { useThemeTokens } from '@/ui';

export default function GameLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

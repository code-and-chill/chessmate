import { Stack } from 'expo-router';
import { useThemeTokens } from '@/ui';

export default function PlayLayout() {
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
        name="online" 
        options={{ 
          title: 'Online Play',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="bot" 
        options={{ 
          title: 'Play vs Bot',
          presentation: 'card',
        }} 
      />
      <Stack.Screen 
        name="friend" 
        options={{ 
          title: 'Friend Challenge',
          presentation: 'card',
        }} 
      />
    </Stack>
  );
}

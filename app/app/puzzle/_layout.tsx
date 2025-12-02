import { Stack } from 'expo-router';
import { useThemeTokens } from '@/ui';

export default function PuzzleLayout() {
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
        name="index" 
        options={{ 
          title: 'Puzzles',
        }} 
      />
      <Stack.Screen 
        name="daily" 
        options={{ 
          title: 'Daily Puzzle',
        }} 
      />
      <Stack.Screen 
        name="history" 
        options={{ 
          title: 'Puzzle History',
        }} 
      />
    </Stack>
  );
}

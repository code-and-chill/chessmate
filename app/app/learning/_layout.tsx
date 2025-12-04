import { Stack } from 'expo-router';
import { useThemeTokens } from '@/ui';

export default function LearningLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Using DetailScreenLayout's built-in header
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
          title: 'Learning',
        }} 
      />
      <Stack.Screen 
        name="lesson" 
        options={{ 
          title: 'Lesson',
        }} 
      />
      <Stack.Screen 
        name="tactics" 
        options={{ 
          title: 'Tactics',
        }} 
      />
      <Stack.Screen 
        name="review" 
        options={{ 
          title: 'Game Review',
        }} 
      />
      <Stack.Screen 
        name="openings" 
        options={{ 
          title: 'Openings',
        }} 
      />
    </Stack>
  );
}

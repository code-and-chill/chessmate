import { Stack } from 'expo-router';
import { useThemeTokens } from '@/ui';

export default function LearningLayout() {
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
          title: 'Learning',
        }} 
      />
      <Stack.Screen 
        name="lesson" 
        options={{ 
          title: 'Lesson',
        }} 
      />
    </Stack>
  );
}

import { Stack } from 'expo-router';
import { useThemeTokens } from '@/ui';

export default function SocialLayout() {
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
        name="friends" 
        options={{ 
          title: 'Friends',
        }} 
      />
      <Stack.Screen 
        name="messages" 
        options={{ 
          title: 'Messages',
        }} 
      />
      <Stack.Screen 
        name="clubs" 
        options={{ 
          title: 'Clubs',
        }} 
      />
    </Stack>
  );
}

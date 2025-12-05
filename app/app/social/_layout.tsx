import { Stack } from 'expo-router';
export default function SocialLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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

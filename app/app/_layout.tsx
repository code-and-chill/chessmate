import { DarkTheme, DefaultTheme, ThemeProvider as RNThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider } from '@/ui';
import { 
  ApiProvider,
  AuthProvider, 
  GameProvider, 
  MatchmakingProvider,
  PuzzleProvider,
  LearningProvider,
  SocialProvider 
} from '@/contexts';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ApiProvider>
      <AuthProvider>
        <SocialProvider>
          <GameProvider>
            <MatchmakingProvider>
              <PuzzleProvider>
                <LearningProvider>
                  <ThemeProvider defaultMode={colorScheme === 'dark' ? 'dark' : 'light'}>
                    <RNThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                      <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                        <Stack.Screen name="login" options={{ headerShown: false }} />
                        <Stack.Screen name="register" options={{ headerShown: false }} />
                        <Stack.Screen name="settings" options={{ headerShown: false }} />
                      </Stack>
                      <StatusBar style="auto" />
                    </RNThemeProvider>
                  </ThemeProvider>
                </LearningProvider>
              </PuzzleProvider>
            </MatchmakingProvider>
          </GameProvider>
        </SocialProvider>
      </AuthProvider>
    </ApiProvider>
  );
}

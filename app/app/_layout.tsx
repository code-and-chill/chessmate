import { DarkTheme, DefaultTheme, ThemeProvider as RNThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { ThemeProvider } from '@/ui';
import { GlobalLayout } from '@/ui/components';
import { 
  ApiProvider,
  AuthProvider, 
  GameProvider, 
  MatchmakingProvider,
  PuzzleProvider,
  LearningProvider,
  SocialProvider 
} from '@/contexts';
import { I18nProvider } from '@/i18n/I18nContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <I18nProvider defaultLocale="en">
      <ApiProvider>
        <AuthProvider>
          <SocialProvider>
            <GameProvider>
              <MatchmakingProvider>
                <PuzzleProvider>
                  <LearningProvider>
                    <ThemeProvider defaultMode={colorScheme === 'dark' ? 'dark' : 'light'}>
                      <RNThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <GlobalLayout>
                        <Stack screenOptions={{ headerShown: false }}>
                          <Stack.Screen name="(tabs)" />
                          <Stack.Screen name="(drawer)" />
                          <Stack.Screen name="puzzle" options={{ headerShown: false }} />
                          <Stack.Screen name="learning" options={{ headerShown: false }} />
                          <Stack.Screen name="social" options={{ headerShown: false }} />
                          <Stack.Screen name="login" />
                          <Stack.Screen name="register" />
                          <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
                        </Stack>
                      </GlobalLayout>
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
    </I18nProvider>
  );
}

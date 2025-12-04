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
  SocialProvider,
  BoardThemeProvider 
} from '@/contexts';
import { I18nProvider } from '@/i18n/I18nContext';
import { useAppFonts } from '@/config/fonts';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useAppFonts();

  // Keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

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
                      <BoardThemeProvider>
                        <RNThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                          <GlobalLayout>
                            <Stack screenOptions={{ headerShown: false }}>
                              <Stack.Screen name="(tabs)" />
                              <Stack.Screen name="(drawer)" />
                              <Stack.Screen name="puzzle" />
                              <Stack.Screen name="learning" />
                              <Stack.Screen name="social" />
                              <Stack.Screen name="game" />
                              <Stack.Screen 
                                name="login" 
                                options={{ 
                                  presentation: 'modal',
                                  headerShown: true,
                                  title: 'Sign In',
                                }} 
                              />
                              <Stack.Screen 
                                name="register" 
                                options={{ 
                                  presentation: 'modal',
                                  headerShown: true,
                                  title: 'Sign Up',
                                }} 
                              />
                              <Stack.Screen name="settings" />
                              <Stack.Screen 
                                name="settings/board-theme"
                                options={{
                                  presentation: 'card',
                                  headerShown: false,
                                }}
                              />
                            </Stack>
                          </GlobalLayout>
                          <StatusBar style="auto" />
                        </RNThemeProvider>
                      </BoardThemeProvider>
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

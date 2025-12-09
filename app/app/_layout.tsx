import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as RNThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme, Platform } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {GlobalLayout, ThemeProvider } from '@/ui';
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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    // derive title from first path segment
    const firstSegment = (pathname || '/').split('/').filter(Boolean)[0] ?? '';
    const routeTitleMap: Record<string, string> = {
      '': 'Home',
      'puzzle': 'Puzzles',
      'learn': 'Learn',
      'social': 'Social',
      'settings': 'Settings',
      'game': 'Play',
    };

    const human = routeTitleMap[firstSegment] ?? (firstSegment ? firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1) : 'Home');
    document.title = `ChessMate — ${human}`;
   }, [pathname]);

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
                          <SafeAreaProvider>
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
                              </Stack>
                            </GlobalLayout>
                          </SafeAreaProvider>
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

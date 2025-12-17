import React, {useEffect} from 'react';
import {DarkTheme, DefaultTheme, ThemeProvider as RNThemeProvider} from '@react-navigation/native';
import {Stack, usePathname} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {Platform} from 'react-native';
import 'react-native-reanimated';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import '../global.css';

import {ThemeProvider} from '@/ui/theme/ThemeProvider';
import {useIsDark} from '@/ui/hooks/useThemeTokens';
import {GlobalLayout} from './GlobalLayout';
import {
    ApiProvider,
    AuthProvider,
    BoardThemeProvider,
    GameProvider,
    LearningProvider,
    MatchmakingProvider,
    PuzzleProvider,
    SocialProvider
} from '@/contexts';
import {I18nProvider} from '@/i18n/I18nContext';
import {useAppFonts} from '@/config/fonts';
import {ConfigProvider, initializeConfiguration} from '@/config';

// Initialize configuration at module load time (before React renders)
// This ensures ConfigProvider can access the config store
try {
  initializeConfiguration();
} catch (error) {
  console.error('[Config] Failed to initialize configuration at startup:', error);
  // ConfigProvider will handle this gracefully by throwing a more helpful error
}

// Inner component that can access ThemeProvider
function RootLayoutContent() {
  const pathname = usePathname();
  const isDark = useIsDark();
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
    <RNThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <GlobalLayout>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen name="puzzle" />
            <Stack.Screen name="learning" />
            <Stack.Screen name="social" />
            <Stack.Screen name="game" />
            <Stack.Screen name="not-found" />
            <Stack.Screen name="404" />
            <Stack.Screen
              name="login"
              options={{
                presentation: 'modal',
                title: 'Sign In',
              }}
            />
            <Stack.Screen
              name="register"
              options={{
                presentation: 'modal',
                title: 'Sign Up',
              }}
            />
            <Stack.Screen name="settings" />
          </Stack>
        </GlobalLayout>
      </SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </RNThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ConfigProvider>
      <I18nProvider defaultLocale="en">
        <ApiProvider>
          <AuthProvider>
            <SocialProvider>
              <GameProvider>
                <MatchmakingProvider>
                  <PuzzleProvider>
                    <LearningProvider>
                      <ThemeProvider defaultMode="auto">
                        <BoardThemeProvider>
                          <RootLayoutContent />
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
    </ConfigProvider>
  );
}

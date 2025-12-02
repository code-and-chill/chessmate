/**
 * App.tsx Font Integration Example
 * Copy this pattern to your main App.tsx file
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useAppFonts } from './config/fonts';
import { ThemeProvider } from './ui';
import { Text } from './ui/primitives/Text';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function App() {
  // Load fonts using the custom hook
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    // Hide splash screen once fonts are loaded or if there's an error
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading state while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show error state if fonts failed to load
  if (fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text variant="title" style={{ color: '#DC2626', marginBottom: 8 }}>
          Font Loading Error
        </Text>
        <Text variant="body" style={{ textAlign: 'center', color: '#6B7280' }}>
          Unable to load fonts. Please restart the app.
        </Text>
        <Text variant="caption" style={{ marginTop: 16, color: '#9CA3AF' }}>
          {fontError.message}
        </Text>
      </View>
    );
  }

  // Fonts loaded successfully - render your app
  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  );
}

function YourAppContent() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Display text - Uses Outfit Bold */}
      <Text variant="display" style={{ marginBottom: 8 }}>
        ChessMate
      </Text>
      
      {/* Body text - Uses Inter Regular */}
      <Text variant="body" style={{ textAlign: 'center' }}>
        Premium fonts loaded successfully! ✨
      </Text>
      
      {/* Chess notation - Uses JetBrains Mono */}
      <Text mono style={{ marginTop: 16 }}>
        1. e4 e5 2. Nf3 Nc6
      </Text>
    </View>
  );
}

/**
 * Alternative: Minimal integration if you don't need error handling
 */
export function MinimalApp() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) {
    return null; // Or <SplashScreen />
  }

  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  );
}

/**
 * Alternative: Integration with existing splash screen
 */
export function AppWithCustomSplash() {
  const [fontsLoaded, fontError] = useAppFonts();
  const [appReady, setAppReady] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Perform any other async initialization here
        await Promise.all([
          // Load any other resources
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the app to render
        setAppReady(true);
      }
    }

    if (fontsLoaded || fontError) {
      prepare();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null; // Splash screen still visible
  }

  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  );
}

/**
 * Usage Notes:
 * 
 * 1. Choose one of the patterns above based on your needs
 * 2. Basic app: Use MinimalApp (simplest)
 * 3. Production app: Use App (with error handling)
 * 4. Custom loading: Use AppWithCustomSplash
 * 
 * 5. Make sure to install fonts first:
 *    npx expo install @expo-google-fonts/outfit @expo-google-fonts/inter @expo-google-fonts/jetbrains-mono
 * 
 * 6. Font loading is automatic via useAppFonts() hook
 * 7. All Text components will use the correct fonts automatically
 */

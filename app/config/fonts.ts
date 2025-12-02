/**
 * Font Loading Configuration
 * app/config/fonts.ts
 * 
 * Loads premium Google Fonts for ChessMate:
 * - Outfit: Modern geometric sans-serif for display/titles
 * - Inter: Optimized for body text and UI
 * - JetBrains Mono: Clear monospace for chess notation
 */

import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

export const fontConfig = {
  // Outfit - Display & Titles
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  
  // Inter - Body & UI
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  
  // JetBrains Mono - Code & Notation
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
};

/**
 * Hook to load all app fonts
 * Usage in App.tsx:
 * 
 * ```tsx
 * import { useAppFonts } from './config/fonts';
 * 
 * function App() {
 *   const [fontsLoaded, fontError] = useAppFonts();
 *   
 *   if (!fontsLoaded && !fontError) {
 *     return null; // or <SplashScreen />
 *   }
 *   
 *   return <YourApp />;
 * }
 * ```
 */
export function useAppFonts() {
  return useFonts(fontConfig);
}

/**
 * Font family constants for direct usage
 */
export const FontFamily = {
  // Display & Headings
  display: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semiBold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
  },
  
  // Body & UI
  body: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  
  // Code & Notation
  mono: {
    regular: 'JetBrainsMono_400Regular',
    medium: 'JetBrainsMono_500Medium',
    bold: 'JetBrainsMono_700Bold',
  },
} as const;

/**
 * Font loading best practices:
 * 
 * 1. Load fonts before rendering UI (use splash screen)
 * 2. Handle loading errors gracefully with fallback fonts
 * 3. Use font-display: swap for web builds
 * 4. Preload critical fonts only (reduce bundle size)
 * 5. Use subset fonts if possible (Latin only for EN apps)
 */

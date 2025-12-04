/**
 * Settings Screen - Main Container
 * features/settings/screens/SettingsScreen.tsx
 */

import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { SettingsHub } from '../components/SettingsHub';
import { ProfileView } from '../components/ProfileView';
import { StatsView } from '../components/StatsView';
import { AchievementsView } from '../components/AchievementsView';
import { PreferencesView } from '../components/PreferencesView';
import { AppearanceView } from '../components/AppearanceView';
import type { SettingsMode } from '../types';

export interface SettingsScreenProps {
  userId?: string;
}

/**
 * Main settings screen with navigation between different sections
 * Similar to PlayScreen pattern - handles mode switching
 */
export function SettingsScreen({ userId = 'current-user' }: SettingsScreenProps) {
  const [mode, setMode] = useState<SettingsMode>('hub');

  const handleNavigate = (newMode: SettingsMode) => {
    console.log('handleNavigate called with:', newMode);
    // Board theme navigates to dedicated route
    if (newMode === 'board-theme') {
      console.log('Navigating to board-theme page...');
      router.push('/settings/board-theme');
      return;
    }
    setMode(newMode);
  };

  // Render the appropriate view based on mode
  switch (mode) {
    case 'hub':
      return <SettingsHub onNavigate={handleNavigate} userId={userId} />;
    case 'profile':
      return <ProfileView onBack={() => setMode('hub')} userId={userId} />;
    case 'stats':
      return <StatsView onBack={() => setMode('hub')} userId={userId} />;
    case 'achievements':
      return <AchievementsView onBack={() => setMode('hub')} userId={userId} />;
    case 'preferences':
      return <PreferencesView onBack={() => setMode('hub')} userId={userId} />;
    case 'appearance':
      return <AppearanceView onBack={() => setMode('hub')} userId={userId} />;
    default:
      return <SettingsHub onNavigate={handleNavigate} userId={userId} />;
  }
}

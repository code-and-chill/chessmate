import { FeatureScreenLayout } from '@/ui';
import { PreferencesPanel } from '@/features/preferences/PreferencesPanel';

export default function PreferencesSettingsScreen() {
  return (
    <FeatureScreenLayout title="Preferences" subtitle="Configure app preferences and notifications">
      <PreferencesPanel />
    </FeatureScreenLayout>
  );
}

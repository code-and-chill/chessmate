import { FeatureScreenLayout } from '@/ui';
import { AppearancePanel } from '@/features/appearance/AppearancePanel';

export default function AppearanceSettingsScreen() {
  return (
    <FeatureScreenLayout title="Appearance" subtitle="Customize app theme and board style">
      <AppearancePanel />
    </FeatureScreenLayout>
  );
}

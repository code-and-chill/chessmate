import { FeatureScreenLayout } from '@/ui';
import { AccessibilitySettingsPanel } from '@/features/accessibility/AccessibilitySettingsPanel';

export default function AccessibilitySettingsScreen() {
  return (
    <FeatureScreenLayout title="Accessibility" subtitle="Adjust contrast, motion, and font sizes">
      <AccessibilitySettingsPanel />
    </FeatureScreenLayout>
  );
}

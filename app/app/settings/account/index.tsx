import { FeatureScreenLayout } from '@/ui';
import { AccountSettingsPanel } from '@/features/account/AccountSettingsPanel';

export default function AccountSettingsScreen() {
  return (
    <FeatureScreenLayout title="Account" subtitle="Manage account security and billing">
      <AccountSettingsPanel />
    </FeatureScreenLayout>
  );
}

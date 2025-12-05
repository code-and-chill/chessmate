import { FeatureScreenLayout } from '@/ui';
import { ProfileForm } from '@/features/profile/ProfileForm';

export default function ProfileSettingsScreen() {
  return (
    <FeatureScreenLayout title="Profile" subtitle="Manage your personal info and avatar">
      <ProfileForm />
    </FeatureScreenLayout>
  );
}

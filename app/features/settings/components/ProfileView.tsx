/**
 * Profile View Component
 * features/settings/components/ProfileView.tsx
 */

import { useState } from 'react';
import { FeatureScreenLayout } from '@/ui/components';
import { VStack } from '@/ui/primitives/Stack';
import { Input } from '@/ui/primitives/Input';
import { Button } from '@/ui/primitives/Button';
import { Text } from '@/ui/primitives/Text';

export function ProfileView() {
  const [form, setForm] = useState({
    displayName: '',
    country: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 800); // Simulate save
  };

  return (
    <FeatureScreenLayout
      title="Profile"
      subtitle="Manage your chess profile"
      statsRow={null}
    >
      <VStack gap={5} padding={2}>
        <Input
          label="Display Name"
          value={form.displayName}
          onChangeText={(v: string) => handleChange('displayName', v)}
          placeholder="Your name"
          autoCapitalize="words"
        />
        <Input
          label="Country"
          value={form.country}
          onChangeText={(v: string) => handleChange('country', v)}
          placeholder="Country"
        />
        <Input
          label="Bio"
          value={form.bio}
          onChangeText={(v: string) => handleChange('bio', v)}
          placeholder="Short bio"
          multiline
          numberOfLines={3}
        />
        <Button onPress={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        {saved && (
          <Text color="#16A34A" variant="caption" weight="semibold">
            Profile saved!
          </Text>
        )}
      </VStack>
    </FeatureScreenLayout>
  );
}

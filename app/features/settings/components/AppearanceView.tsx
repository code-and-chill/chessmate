/**
 * Appearance View Component
 * features/settings/components/AppearanceView.tsx
 */


import { useState } from 'react';
import { FeatureScreenLayout } from '@/ui/components';
import { VStack } from '@/ui/primitives/Stack';
import { Button } from '@/ui/primitives/Button';
import { Text } from '@/ui/primitives/Text';

export function AppearanceView() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelect = (t: 'light' | 'dark' | 'auto') => {
    setTheme(t);
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 600);
  };

  return (
    <FeatureScreenLayout
      title="Appearance"
      subtitle="Personalize your interface"
      statsRow={null}
    >
      <VStack gap={5} padding={2}>
        <Button variant={theme === 'light' ? 'primary' : 'outline'} onPress={() => handleSelect('light')}>
          ☀️ Light
        </Button>
        <Button variant={theme === 'dark' ? 'primary' : 'outline'} onPress={() => handleSelect('dark')}>
          🌙 Dark
        </Button>
        <Button variant={theme === 'auto' ? 'primary' : 'outline'} onPress={() => handleSelect('auto')}>
          ⚙️ Auto
        </Button>
        <Button onPress={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Appearance'}
        </Button>
        {saved && (
          <Text color="#16A34A" variant="caption" weight="semibold">
            Appearance saved!
          </Text>
        )}
      </VStack>
    </FeatureScreenLayout>
  );
}

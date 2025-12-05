import { useState } from 'react';
import { FeatureScreenLayout } from '@/ui/components';
import { VStack } from '@/ui/primitives/Stack';
import { Button } from '@/ui/primitives/Button';
import { Text } from '@/ui/primitives/Text';

export function PreferencesView() {
  const [prefs, setPrefs] = useState({
    notifications: true,
    sound: true,
    vibration: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
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
      title="Preferences"
      subtitle="App notification and sound settings"
      statsRow={null}
    >
      <VStack gap={5} padding={2}>
        <Button variant={prefs.notifications ? 'primary' : 'outline'} onPress={() => toggle('notifications')}>
          {prefs.notifications ? '🔔 Notifications On' : '🔕 Notifications Off'}
        </Button>
        <Button variant={prefs.sound ? 'primary' : 'outline'} onPress={() => toggle('sound')}>
          {prefs.sound ? '🔊 Sound On' : '🔈 Sound Off'}
        </Button>
        <Button variant={prefs.vibration ? 'primary' : 'outline'} onPress={() => toggle('vibration')}>
          {prefs.vibration ? '📳 Vibration On' : '📴 Vibration Off'}
        </Button>
        <Button onPress={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
        {saved && (
          <Text color="#16A34A" variant="caption" weight="semibold">
            Preferences saved!
          </Text>
        )}
      </VStack>
    </FeatureScreenLayout>
  );
}
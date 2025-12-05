import { FeatureScreenLayout } from '@/ui';
import { GameplaySettingsPanel } from '@/features/gameplay/GameplaySettingsPanel';

export default function GameplaySettingsScreen() {
  return (
    <FeatureScreenLayout title="Gameplay" subtitle="Gameplay options and move helpers">
      <GameplaySettingsPanel />
    </FeatureScreenLayout>
  );
}

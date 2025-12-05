import { FeatureScreenLayout } from '@/ui';
import { BoardSettingsPanel } from '@/features/board/BoardSettingsPanel';

export default function BoardSettingsScreen() {
  return (
    <FeatureScreenLayout title="Board & Pieces" subtitle="Choose board theme and piece set">
      <BoardSettingsPanel />
    </FeatureScreenLayout>
  );
}

/**
 * Learn Feature - Main Screen
 * features/learn/components/LearnScreen.tsx
 */

import { useState } from 'react';
import { LearnHub } from './LearnHub';
import { LessonsModule } from './LessonsModule';
import { TacticsModule } from './TacticsModule';
import { GameReviewModule } from './GameReviewModule';
import { OpeningsModule } from './OpeningsModule';
import type { LearnMode } from '../types/learn.types';

export type LearnScreenProps = {
  initialMode?: LearnMode;
};

export const LearnScreen: React.FC<LearnScreenProps> = ({ initialMode = 'hub' }) => {
  const [mode, setMode] = useState<LearnMode>(initialMode);

  if (mode === 'hub') {
    return <LearnHub onSelectMode={setMode} />;
  }

  if (mode === 'lessons') {
    return <LessonsModule onBack={() => setMode('hub')} />;
  }

  if (mode === 'tactics') {
    return <TacticsModule onBack={() => setMode('hub')} />;
  }

  if (mode === 'review') {
    return <GameReviewModule onBack={() => setMode('hub')} />;
  }

  if (mode === 'openings') {
    return <OpeningsModule onBack={() => setMode('hub')} />;
  }

  return null;
};

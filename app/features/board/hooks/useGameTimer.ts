import { useState } from 'react';

interface GameTimerState {
  whiteTimeMs: number;
  blackTimeMs: number;
}

interface GameTimerActions {
  handleTimeExpire: (color: 'w' | 'b') => void;
}

const DEFAULT_TIME_MS = 600000; // 10 minutes

export function useGameTimer(
  onTimeExpire: (result: '1-0' | '0-1', reason: string) => void
): [GameTimerState, GameTimerActions] {
  const [timerState] = useState<GameTimerState>({
    whiteTimeMs: DEFAULT_TIME_MS,
    blackTimeMs: DEFAULT_TIME_MS,
  });

  const handleTimeExpire = (color: 'w' | 'b') => {
    const result = color === 'w' ? '0-1' : '1-0';
    const loser = color === 'w' ? 'White' : 'Black';
    onTimeExpire(result, `${loser} ran out of time`);
  };

  return [timerState, { handleTimeExpire }];
}


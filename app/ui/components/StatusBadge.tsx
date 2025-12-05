import React from 'react';
import { Badge } from '@/ui/primitives/Badge';

export type GameStatus = 'live' | 'ended' | 'paused' | 'waiting';

interface StatusBadgeProps {
  status: GameStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig: Record<GameStatus, { label: string; variant: 'success' | 'neutral' | 'warning' | 'info' }> = {
  live: { label: 'Live', variant: 'success' },
  ended: { label: 'Ended', variant: 'neutral' },
  paused: { label: 'Paused', variant: 'warning' },
  waiting: { label: 'Waiting', variant: 'info' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
}) => {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size}>
      {showLabel && config.label}
    </Badge>
  );
};

StatusBadge.displayName = 'StatusBadge';


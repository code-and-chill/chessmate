import React from 'react';
import { Color } from '../../../core/models/game';
export interface PlayerPanelProps {
    position: 'top' | 'bottom';
    color: Color;
    isSelf: boolean;
    remainingMs: number;
    accountId: string;
}
export declare const PlayerPanel: React.ForwardRefExoticComponent<PlayerPanelProps & React.RefAttributes<any>>;
//# sourceMappingURL=PlayerPanel.d.ts.map
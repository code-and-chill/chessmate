import React from 'react';
import { GameStatus } from '../../../core/models/game';
export interface GameActionsProps {
    status: GameStatus;
    result: '1-0' | '0-1' | '1/2-1/2' | null;
    endReason: string | null;
    onResign: () => void;
}
export declare const GameActions: React.ForwardRefExoticComponent<GameActionsProps & React.RefAttributes<any>>;
//# sourceMappingURL=GameActions.d.ts.map
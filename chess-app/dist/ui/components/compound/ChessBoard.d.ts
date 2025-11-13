import React from 'react';
import { Color } from '../../../core/models/game';
export interface ChessBoardProps {
    fen: string;
    sideToMove: Color;
    myColor: Color;
    isInteractive: boolean;
    onMove(from: string, to: string, promotion?: string): void | Promise<void>;
}
export declare const ChessBoard: React.ForwardRefExoticComponent<ChessBoardProps & React.RefAttributes<any>>;
//# sourceMappingURL=ChessBoard.d.ts.map
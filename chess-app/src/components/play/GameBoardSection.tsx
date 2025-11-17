import React from 'react';
import { Box } from '../primitives/Box';
import { ChessBoard } from '../compound/ChessBoard';
import { PlayerPanel } from '../compound/PlayerPanel';
import { GameActions } from '../compound/GameActions';
import { type Color } from '../compound/ChessBoard';

interface GameBoardSectionProps {
  game: any;
  myColor: Color;
  opponentColor: Color;
  isInteractive: boolean;
  onMove: (from: string, to: string, promotion?: string) => Promise<void>;
  onResign: () => Promise<void>;
}

export const GameBoardSection: React.FC<GameBoardSectionProps> = ({
  game,
  myColor,
  opponentColor,
  isInteractive,
  onMove,
  onResign,
}) => (
  <Box flex={1} flexDirection="column" gap="lg">
    {/* Opponent Panel */}
    <PlayerPanel
      position="top"
      color={opponentColor}
      isSelf={false}
      remainingMs={game[opponentColor === 'w' ? 'white' : 'black'].remainingMs}
      accountId={game[opponentColor === 'w' ? 'white' : 'black'].accountId}
    />

    {/* Chess Board */}
    <Box justifyContent="center" alignItems="center">
      <ChessBoard
        fen={game.fen}
        sideToMove={game.sideToMove}
        myColor={myColor}
        isInteractive={isInteractive}
        onMove={onMove}
      />
    </Box>

    {/* Current Player Panel */}
    <PlayerPanel
      position="bottom"
      color={myColor}
      isSelf={true}
      remainingMs={game[myColor === 'w' ? 'white' : 'black'].remainingMs}
      accountId={game[myColor === 'w' ? 'white' : 'black'].accountId}
    />

    {/* Game Actions */}
    <GameActions
      status={game.status}
      result={game.result}
      endReason={game.endReason}
      onResign={onResign}
    />
  </Box>
);

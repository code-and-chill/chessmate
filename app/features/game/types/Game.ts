// Definition of the Game type

import type { DecisionReason } from './DecisionReason';

export interface Game {
    id: string;
    player1: string;
    player2: string;
    status: 'ongoing' | 'completed';
    moves: string[];
    winner?: string; // Optional, only present if the game is completed
    rated?: boolean;
    decision_reason?: DecisionReason | null;
    starting_fen?: string | null;
    is_odds_game?: boolean;
}
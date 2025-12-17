import type { IGameRepository } from '../repositories/IGameRepository';
import type { IChessEngine } from '../domain/IChessEngine';
import type { MakeMoveParams } from '../repositories/IGameRepository';
import type { GameState } from '@/types/live-game';

export class InvalidMoveError extends Error {
  constructor(message: string = 'Invalid move') {
    super(message);
    this.name = 'InvalidMoveError';
  }
}

export class GameNotActiveError extends Error {
  constructor(message: string = 'Game is not active') {
    super(message);
    this.name = 'GameNotActiveError';
  }
}

/**
 * MakeMove Use Case
 * 
 * Executes a move in a game with business rule validation.
 * 
 * Business rules:
 * - Game must be in progress
 * - Move must be valid according to chess rules
 * - Move must be legal for current position
 */
export class MakeMoveUseCase {
  constructor(
    private gameRepository: IGameRepository,
    private chessEngine: IChessEngine
  ) {}

  async execute(params: MakeMoveParams): Promise<GameState> {
    // 1. Fetch current game state
    const game = await this.gameRepository.getGame(params.gameId);

    // 2. Validate game is active (business rule)
    if (game.status !== 'in_progress') {
      throw new GameNotActiveError(
        `Game ${params.gameId} is not active (status: ${game.status})`
      );
    }

    // 3. Validate move is legal (business rule)
    const isValid = this.chessEngine.validateMove(game, {
      from: params.from,
      to: params.to,
      promotion: params.promotion,
    });

    if (!isValid) {
      throw new InvalidMoveError(`Invalid move: ${params.from} to ${params.to}`);
    }

    // 4. Execute move via repository
    const updatedGame = await this.gameRepository.makeMove(params);

    // 5. Check for game end conditions (business rule)
    // Note: The backend should handle this, but we check for consistency
    if (this.chessEngine.isCheckmate(updatedGame)) {
      // Game ends - backend should have updated status
    } else if (this.chessEngine.isStalemate(updatedGame)) {
      // Stalemate - game ends in draw
    }

    return updatedGame;
  }
}

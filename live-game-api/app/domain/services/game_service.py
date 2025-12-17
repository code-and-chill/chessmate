"""Game domain service."""

import asyncio
import time
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

import chess

from app.core.metrics import (
    live_game_move_latency_seconds,
    live_game_moves_total,
)

from app.core.exceptions import (
    BoardEditNotAllowedError,
    GameAlreadyEndedError,
    GameNotFoundError,
    GameStateError,
    InvalidMoveError,
    NotPlayersTurnError,
    RatedStatusImmutableError,
    TakebackNotAllowedError,
)
from app.domain.models.game import (
    DecisionReason,
    EndReason,
    Game,
    GameCreatedEvent,
    GameEndedEvent,
    GameResult,
    GameStartedEvent,
    Move,
    MovePlayedEvent,
    TimeControl,
)
from app.domain.repositories.game_repository import GameRepositoryInterface
from app.domain.services.rating_decision_engine import RatingDecisionEngine, RulesConfig
from app.infrastructure.clients.bot_orchestrator import BotOrchestratorClient


class GameService:
    """Game domain service."""

    def __init__(
        self,
        repository: GameRepositoryInterface,
        rating_decision_engine: Optional[RatingDecisionEngine] = None,
        bot_orchestrator_client: Optional[BotOrchestratorClient] = None,
        event_publisher = None,
        websocket_manager = None,
    ):
        self.repository = repository
        self.rating_decision_engine = rating_decision_engine or RatingDecisionEngine()
        self.bot_orchestrator_client = bot_orchestrator_client or BotOrchestratorClient()
        self.event_publisher = event_publisher
        self.websocket_manager = websocket_manager
        self.events: List = []  # Keep for backward compatibility

    async def create_challenge(
        self,
        creator_id: UUID,
        time_control: TimeControl,
        opponent_account_id: Optional[UUID] = None,
        color_preference: str = "random",
        rated: bool = True,
        is_local_game: bool = False,
        starting_fen: Optional[str] = None,
        is_odds_game: bool = False,
        creator_rating: Optional[int] = None,
        opponent_rating: Optional[int] = None,
    ) -> Game:
        """Create a new game challenge.
        
        Args:
            creator_id: Account ID of game creator
            time_control: Time control settings
            opponent_account_id: Optional specific opponent
            color_preference: Color preference for creator
            rated: Requested rated status (may be overridden by automatic rules)
            is_local_game: Whether this is a local pass-and-play game
            starting_fen: Custom starting position (if any)
            is_odds_game: Whether this uses odds/handicap
            creator_rating: Current rating of creator (for rating gap check)
            opponent_rating: Current rating of opponent (for rating gap check)
            
        Returns:
            Created game with authoritative rated status and decision reason
        """
        # Calculate authoritative rated status using decision engine
        final_rated, decision_reason = self.rating_decision_engine.calculate_decision_reason(
            requested_rated=rated,
            is_local_game=is_local_game,
            player1_rating=creator_rating,
            player2_rating=opponent_rating,
            has_custom_fen=starting_fen is not None,
            is_odds_game=is_odds_game,
        )

        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=time_control.initial_seconds * 1000,
            black_clock_ms=time_control.initial_seconds * 1000,
            rated=final_rated,
            decision_reason=decision_reason,
            starting_fen=starting_fen,
            is_odds_game=is_odds_game,
        )

        # Assign creator's color based on preference
        # If no opponent, we still need to assign creator's side
        import random
        if color_preference == "white":
            game.white_account_id = creator_id
        elif color_preference == "black":
            game.black_account_id = creator_id
        else:  # random
            if random.choice([True, False]):
                game.white_account_id = creator_id
            else:
                game.black_account_id = creator_id

        # Save game
        saved_game = await self.repository.create(game)

        # Emit event
        event = GameCreatedEvent(
            aggregate_id=saved_game.id,
            creator_account_id=creator_id,
            time_control=time_control,
            rated=rated,
        )
        self.events.append(event)
        
        # Publish event to Kafka (async, non-blocking)
        if self.event_publisher:
            self.event_publisher.publish_game_created(event)

        return saved_game

    def _map_difficulty_to_bot_id(self, difficulty: str) -> str:
        """Map difficulty string to bot ID.
        
        Args:
            difficulty: Difficulty level (beginner, easy, medium, hard, expert, master)
            
        Returns:
            Bot ID string (e.g., "bot-beginner-400")
        """
        mapping = {
            "beginner": "bot-beginner-400",
            "easy": "bot-easy-800",
            "medium": "bot-medium-1200",
            "hard": "bot-hard-1600",
            "expert": "bot-expert-2000",
            "master": "bot-master-2400",
        }
        return mapping.get(difficulty.lower(), "bot-medium-1200")

    async def create_bot_game(
        self,
        creator_id: UUID,
        difficulty: str,
        player_color: str,
        time_control: TimeControl,
    ) -> Game:
        """Create a new bot game.
        
        Args:
            creator_id: Account ID of the human player
            difficulty: Bot difficulty level (beginner, easy, medium, hard, expert, master)
            player_color: Color preference for human player (white, black, random)
            time_control: Time control settings
            
        Returns:
            Created game with bot assigned and game started
        """
        # Bot games are always unrated
        final_rated = False
        decision_reason = DecisionReason.BOT_GAME
        
        # Map difficulty to bot_id
        bot_id = self._map_difficulty_to_bot_id(difficulty)
        
        # Determine bot color (opposite of player)
        import random
        if player_color == "white":
            human_color = "w"
            bot_color = "b"
        elif player_color == "black":
            human_color = "b"
            bot_color = "w"
        else:  # random
            if random.choice([True, False]):
                human_color = "w"
                bot_color = "b"
            else:
                human_color = "b"
                bot_color = "w"
        
        # Create game
        game = Game(
            creator_account_id=creator_id,
            time_control=time_control,
            white_clock_ms=time_control.initial_seconds * 1000,
            black_clock_ms=time_control.initial_seconds * 1000,
            rated=final_rated,
            decision_reason=decision_reason,
            bot_id=bot_id,
            bot_color=bot_color,
        )
        
        # Assign human player to their color
        if human_color == "w":
            game.white_account_id = creator_id
        else:
            game.black_account_id = creator_id
        
        # Start the game immediately (bot is already assigned)
        game.start_game()
        
        # Save game
        saved_game = await self.repository.create(game)
        
        # Emit events
        game_created_event = GameCreatedEvent(
            aggregate_id=saved_game.id,
            creator_account_id=creator_id,
            time_control=time_control,
            rated=final_rated,
        )
        self.events.append(game_created_event)
        if self.event_publisher:
            self.event_publisher.publish_game_created(game_created_event)
        
        game_started_event = GameStartedEvent(
            aggregate_id=saved_game.id,
            white_account_id=saved_game.white_account_id,
            black_account_id=saved_game.black_account_id,
            started_at=saved_game.started_at,
        )
        self.events.append(game_started_event)
        # Note: GameStartedEvent is not in scope for Kafka publishing (only GameCreated, MovePlayed, GameEnded)
        
        # If bot goes first, play bot move immediately
        if saved_game.is_bot_turn() and saved_game.is_in_progress():
            try:
                saved_game = await self.play_bot_move(saved_game.id)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to play initial bot move: {e}", exc_info=True)
                # Continue with the game even if bot move fails
        
        return saved_game

    async def join_game(
        self, game_id: UUID, opponent_id: UUID, color_preference: str = "random"
    ) -> Game:
        """Join an existing game challenge."""

        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        if not game.can_join(opponent_id):
            raise GameStateError(
                "Cannot join this game - it is not waiting for opponent or you are already in it",
                str(game_id),
            )

        # Assign colors
        game.assign_colors(opponent_id, color_preference)

        # Start the game
        game.start_game()

        # Save updated game
        saved_game = await self.repository.update(game)

        # Emit events
        game_started_event = GameStartedEvent(
            aggregate_id=saved_game.id,
            white_account_id=saved_game.white_account_id,
            black_account_id=saved_game.black_account_id,
            started_at=saved_game.started_at,
        )
        self.events.append(game_started_event)
        # Note: GameStartedEvent is not in scope for Kafka publishing (only GameCreated, MovePlayed, GameEnded)

        return saved_game

    async def play_move(
        self,
        game_id: UUID,
        player_id: UUID,
        from_square: str,
        to_square: str,
        promotion: Optional[str] = None,
    ) -> Game:
        """Play a move in an active game."""
        start_time = time.time()

        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        if not game.is_in_progress():
            raise GameStateError(
                f"Game is not in progress (status: {game.status})", str(game_id)
            )

        # Verify it's this player's turn
        player_color = game.get_player_by_id(player_id)
        if not player_color:
            raise GameStateError("You are not a player in this game", str(game_id))

        if game.side_to_move != player_color:
            raise NotPlayersTurnError(str(game_id))

        # Validate move using chess engine
        board = chess.Board(game.fen)
        
        try:
            # Parse squares
            from_sq = chess.parse_square(from_square)
            to_sq = chess.parse_square(to_square)
            
            # Parse promotion piece
            promotion_piece = None
            if promotion:
                promotion_map = {
                    "q": chess.QUEEN,
                    "r": chess.ROOK,
                    "b": chess.BISHOP,
                    "n": chess.KNIGHT,
                }
                promotion_piece = promotion_map.get(promotion.lower())
            
            # Create move
            chess_move = chess.Move(from_sq, to_sq, promotion=promotion_piece)
            
            # Validate move is legal
            if chess_move not in board.legal_moves:
                raise InvalidMoveError(
                    f"Illegal move: {from_square} to {to_square}", str(game_id)
                )
            
            # Apply move to board
            san = board.san(chess_move)
            board.push(chess_move)
            fen_after = board.fen()
            
        except ValueError as e:
            raise InvalidMoveError(f"Invalid move format: {str(e)}", str(game_id))

        # Calculate elapsed time (simplified for MVP)
        elapsed_ms = 0  # TODO: Calculate from actual clock

        # Create move object
        ply = len(game.moves) + 1
        move_number = (ply + 1) // 2

        move = Move(
            ply=ply,
            move_number=move_number,
            color=player_color,
            from_square=from_square,
            to_square=to_square,
            promotion=promotion,
            san=san,
            fen_after=fen_after,
            played_at=datetime.now(timezone.utc),
            elapsed_ms=elapsed_ms,
        )

        # Add move to game
        game.add_move(move)

        # Update game state
        game.fen = fen_after
        game.side_to_move = "b" if game.side_to_move == "w" else "w"

        # Check for game end conditions
        move_result = "valid"
        if board.is_checkmate():
            result = GameResult.WHITE_WIN if player_color == "w" else GameResult.BLACK_WIN
            game.end_game(result, EndReason.CHECKMATE)
            move_result = "checkmate"
        elif board.is_stalemate():
            game.end_game(GameResult.DRAW, EndReason.STALEMATE)
            move_result = "stalemate"
        elif board.is_insufficient_material():
            game.end_game(GameResult.DRAW, EndReason.INSUFFICIENT_MATERIAL)
            move_result = "draw"
        elif board.is_fifty_moves():
            game.end_game(GameResult.DRAW, EndReason.FIFTY_MOVE_RULE)
            move_result = "draw"
        elif board.is_repetition():
            game.end_game(GameResult.DRAW, EndReason.THREEFOLD_REPETITION)
            move_result = "draw"

        # Save updated game
        saved_game = await self.repository.update(game)

        # Record metrics
        latency = time.time() - start_time
        live_game_move_latency_seconds.observe(latency)
        live_game_moves_total.labels(result=move_result).inc()

        # Emit event
        move_played_event = MovePlayedEvent(
            aggregate_id=saved_game.id, move=move, fen=saved_game.fen
        )
        self.events.append(move_played_event)
        if self.event_publisher:
            self.event_publisher.publish_move_played(move_played_event)
        
        # Broadcast to WebSocket subscribers
        if self.websocket_manager:
            try:
                await self.websocket_manager.broadcast_to_game(
                    saved_game.id,
                    {
                        "type": "move_played",
                        "game_id": str(saved_game.id),
                        "move": {
                            "ply": move.ply,
                            "from_square": move.from_square,
                            "to_square": move.to_square,
                            "san": move.san,
                            "fen_after": move.fen_after,
                        },
                        "fen": saved_game.fen,
                    },
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to broadcast move to WebSocket: {e}", exc_info=True)
                # Don't fail the operation if WebSocket broadcast fails
        
        # If game ended, emit game ended event
        if saved_game.is_ended():
            game_ended_event = GameEndedEvent(
                aggregate_id=saved_game.id,
                white_account_id=saved_game.white_account_id,
                black_account_id=saved_game.black_account_id,
                result=saved_game.result,
                end_reason=saved_game.end_reason,
                time_control=saved_game.time_control,
                rated=saved_game.rated,
            )
            self.events.append(game_ended_event)
            if self.event_publisher:
                self.event_publisher.publish_game_ended(game_ended_event)
            
            # Broadcast game ended to WebSocket subscribers
            if self.websocket_manager:
                try:
                    await self.websocket_manager.broadcast_to_game(
                        saved_game.id,
                        {
                            "type": "game_ended",
                            "game_id": str(saved_game.id),
                            "result": saved_game.result.value if saved_game.result else None,
                            "end_reason": saved_game.end_reason.value if saved_game.end_reason else None,
                        },
                    )
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to broadcast game ended to WebSocket: {e}", exc_info=True)
        
        # If this is a bot game and it's now the bot's turn, play bot move
        if saved_game.is_bot_game() and saved_game.is_bot_turn() and saved_game.is_in_progress():
            try:
                saved_game = await self.play_bot_move(game_id)
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to play bot move after human move: {e}", exc_info=True)
                # Continue with the game even if bot move fails
                # The frontend can poll for bot moves if needed

        return saved_game

    async def play_bot_move(self, game_id: UUID) -> Game:
        """Play a bot move in a bot game.
        
        Args:
            game_id: ID of the game
            
        Returns:
            Updated game with bot move applied
            
        Raises:
            GameNotFoundError: If game not found
            GameStateError: If game is not a bot game or not bot's turn
        """
        import logging
        logger = logging.getLogger(__name__)
        
        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))
        
        if not game.is_bot_game():
            raise GameStateError("Game is not a bot game", str(game_id))
        
        if not game.is_bot_turn():
            raise GameStateError("It is not the bot's turn", str(game_id))
        
        if not game.is_in_progress():
            raise GameStateError(f"Game is not in progress (status: {game.status})", str(game_id))
        
        try:
            # Calculate move number
            move_number = len(game.moves) // 2 + 1
            
            # Get bot move from orchestrator
            bot_response = await self.bot_orchestrator_client.get_bot_move(
                bot_id=game.bot_id,
                game_id=str(game.id),
                fen=game.fen,
                bot_color=game.bot_color,
                move_number=move_number,
                white_clock_ms=game.white_clock_ms,
                black_clock_ms=game.black_clock_ms,
                increment_ms=game.time_control.increment_seconds * 1000,
                metadata={},
                debug=False,
            )
            
            # Parse bot move (format: "e2e4" or "e2e4q" for promotion)
            bot_move_str = bot_response.move
            if len(bot_move_str) < 4:
                raise InvalidMoveError(f"Invalid bot move format: {bot_move_str}", str(game_id))
            
            from_square = bot_move_str[0:2]
            to_square = bot_move_str[2:4]
            promotion = bot_move_str[4:5] if len(bot_move_str) > 4 else None
            
            # Apply bot move using existing play_move logic
            # We need to use a special player_id for the bot
            # For now, we'll use the bot_id as a string and handle it specially
            # Actually, we should call the internal move logic directly
            
            # Validate move using chess engine
            board = chess.Board(game.fen)
            
            try:
                # Parse squares
                from_sq = chess.parse_square(from_square)
                to_sq = chess.parse_square(to_square)
                
                # Parse promotion piece
                promotion_piece = None
                if promotion:
                    promotion_map = {
                        "q": chess.QUEEN,
                        "r": chess.ROOK,
                        "b": chess.BISHOP,
                        "n": chess.KNIGHT,
                    }
                    promotion_piece = promotion_map.get(promotion.lower())
                
                # Create move
                chess_move = chess.Move(from_sq, to_sq, promotion=promotion_piece)
                
                # Validate move is legal
                if chess_move not in board.legal_moves:
                    raise InvalidMoveError(
                        f"Illegal bot move: {from_square} to {to_square}", str(game_id)
                    )
                
                # Apply move to board
                san = board.san(chess_move)
                board.push(chess_move)
                fen_after = board.fen()
                
            except ValueError as e:
                raise InvalidMoveError(f"Invalid bot move format: {str(e)}", str(game_id))
            
            # Calculate elapsed time
            elapsed_ms = bot_response.thinking_time_ms
            
            # Create move object
            ply = len(game.moves) + 1
            move_number = (ply + 1) // 2
            
            move = Move(
                ply=ply,
                move_number=move_number,
                color=game.bot_color,
                from_square=from_square,
                to_square=to_square,
                promotion=promotion,
                san=san,
                fen_after=fen_after,
                played_at=datetime.now(timezone.utc),
                elapsed_ms=elapsed_ms,
            )
            
            # Add move to game
            game.add_move(move)
            
            # Update game state
            game.fen = fen_after
            game.side_to_move = "b" if game.side_to_move == "w" else "w"
            
            # Check for game end conditions
            if board.is_checkmate():
                result = GameResult.WHITE_WIN if game.bot_color == "b" else GameResult.BLACK_WIN
                game.end_game(result, EndReason.CHECKMATE)
            elif board.is_stalemate():
                game.end_game(GameResult.DRAW, EndReason.STALEMATE)
            elif board.is_insufficient_material():
                game.end_game(GameResult.DRAW, EndReason.INSUFFICIENT_MATERIAL)
            elif board.is_fifty_moves():
                game.end_game(GameResult.DRAW, EndReason.FIFTY_MOVE_RULE)
            elif board.is_repetition():
                game.end_game(GameResult.DRAW, EndReason.THREEFOLD_REPETITION)
            
            # Save updated game
            saved_game = await self.repository.update(game)
            
            # Emit event
            move_played_event = MovePlayedEvent(
                aggregate_id=saved_game.id, move=move, fen=saved_game.fen
            )
            self.events.append(move_played_event)
            if self.event_publisher:
                self.event_publisher.publish_move_played(move_played_event)
            
            # Broadcast to WebSocket subscribers
            if self.websocket_manager:
                try:
                    await self.websocket_manager.broadcast_to_game(
                        saved_game.id,
                        {
                            "type": "move_played",
                            "game_id": str(saved_game.id),
                            "move": {
                                "ply": move.ply,
                                "from_square": move.from_square,
                                "to_square": move.to_square,
                                "san": move.san,
                                "fen_after": move.fen_after,
                            },
                            "fen": saved_game.fen,
                        },
                    )
                except Exception as e:
                    logger.error(f"Failed to broadcast bot move to WebSocket: {e}", exc_info=True)
            
            # If game ended, emit game ended event
            if saved_game.is_ended():
                game_ended_event = GameEndedEvent(
                    aggregate_id=saved_game.id,
                    white_account_id=saved_game.white_account_id,
                    black_account_id=saved_game.black_account_id,
                    result=saved_game.result,
                    end_reason=saved_game.end_reason,
                    time_control=saved_game.time_control,
                    rated=saved_game.rated,
                )
                self.events.append(game_ended_event)
                if self.event_publisher:
                    self.event_publisher.publish_game_ended(game_ended_event)
                
                # Broadcast game ended to WebSocket subscribers
                if self.websocket_manager:
                    try:
                        await self.websocket_manager.broadcast_to_game(
                            saved_game.id,
                            {
                                "type": "game_ended",
                                "game_id": str(saved_game.id),
                                "result": saved_game.result.value if saved_game.result else None,
                                "end_reason": saved_game.end_reason.value if saved_game.end_reason else None,
                            },
                        )
                    except Exception as e:
                        logger.error(f"Failed to broadcast game ended to WebSocket: {e}", exc_info=True)
            
            return saved_game
            
        except Exception as e:
            logger.error(f"Failed to play bot move: {e}", exc_info=True)
            # Don't fail the game, just log the error
            # In production, you might want to retry or use a fallback move
            raise GameStateError(f"Failed to get bot move: {str(e)}", str(game_id))

    async def resign(self, game_id: UUID, player_id: UUID) -> Game:
        """Player resigns from the game."""

        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        if game.is_ended():
            raise GameAlreadyEndedError(str(game_id), str(game.end_reason))

        # Verify player is in game
        player_color = game.get_player_by_id(player_id)
        if not player_color:
            raise GameStateError("You are not a player in this game", str(game_id))

        # Determine winner
        if player_color == "w":
            result = GameResult.BLACK_WIN
        else:
            result = GameResult.WHITE_WIN

        # End game
        game.end_game(result, EndReason.RESIGNATION)

        # Save updated game
        saved_game = await self.repository.update(game)

        # Emit event
        game_ended_event = GameEndedEvent(
            aggregate_id=saved_game.id,
            white_account_id=saved_game.white_account_id,
            black_account_id=saved_game.black_account_id,
            result=result,
            end_reason=EndReason.RESIGNATION,
            time_control=saved_game.time_control,
            rated=saved_game.rated,
        )
        self.events.append(game_ended_event)
        if self.event_publisher:
            self.event_publisher.publish_game_ended(game_ended_event)
        
        # Broadcast game ended to WebSocket subscribers
        if self.websocket_manager:
            try:
                await self.websocket_manager.broadcast_to_game(
                    saved_game.id,
                    {
                        "type": "game_ended",
                        "game_id": str(saved_game.id),
                        "result": result.value if result else None,
                        "end_reason": EndReason.RESIGNATION.value,
                    },
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to broadcast resignation to WebSocket: {e}", exc_info=True)

        return saved_game

    async def request_takeback(self, game_id: UUID, player_id: UUID) -> Game:
        """Request to undo the last move.
        
        Enforcement Rules:
        - Rated games: Takebacks are NOT allowed
        - Unrated games: Takebacks are allowed (immediate undo for now)
        
        Args:
            game_id: ID of the game
            player_id: ID of the player requesting takeback
            
        Returns:
            Updated game with last move removed
            
        Raises:
            TakebackNotAllowedError: If game is rated
            GameStateError: If no moves to take back
        """
        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        if game.is_ended():
            raise GameAlreadyEndedError(str(game_id), str(game.end_reason))

        if not game.is_player_in_game(player_id):
            raise GameStateError("You are not a player in this game", str(game_id))
        
        if game.rated:
            raise TakebackNotAllowedError(str(game_id))

        if len(game.moves) == 0:
            raise GameStateError("No moves to take back", str(game_id))

        last_move = game.moves.pop()

        if len(game.moves) > 0:
            previous_move = game.moves[-1]
            game.fen = previous_move.fen_after
        else:
            if game.starting_fen:
                game.fen = game.starting_fen
            else:
                game.fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

        # Toggle side to move
        game.side_to_move = "b" if game.side_to_move == "w" else "w"

        # Save updated game
        saved_game = await self.repository.update(game)

        return saved_game

    async def set_position(
        self, game_id: UUID, player_id: UUID, fen: str
    ) -> Game:
        """Set a custom board position (only allowed before game starts).
        
        Enforcement Rules:
        - Rated games: Board edits are NOT allowed
        - Unrated games: Board edits allowed only before game starts
        
        Args:
            game_id: ID of the game
            player_id: ID of the player setting position
            fen: FEN string for the position
            
        Returns:
            Updated game with new position
            
        Raises:
            BoardEditNotAllowedError: If game is rated
            GameStateError: If game has already started
        """
        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        # Verify player is the creator
        if game.creator_account_id != player_id:
            raise GameStateError(
                "Only the game creator can set the position", str(game_id)
            )

        # ENFORCEMENT RULE: No board edits in rated games
        if game.rated:
            raise BoardEditNotAllowedError(str(game_id))

        # Can only set position before game starts
        if not game.is_waiting_for_opponent():
            raise GameStateError(
                "Cannot set position after game has started", str(game_id)
            )

        # Validate FEN (basic validation)
        try:
            chess.Board(fen)
        except ValueError as e:
            raise InvalidMoveError(f"Invalid FEN: {str(e)}", str(game_id))

        # Update game
        game.starting_fen = fen
        game.fen = fen

        # Save updated game
        saved_game = await self.repository.update(game)

        return saved_game

    async def update_rated_status(
        self, game_id: UUID, player_id: UUID, rated: bool
    ) -> Game:
        """Update the rated status of a game.
        
        Enforcement Rules:
        - Can only be changed before the game starts
        - Will be re-validated by RatingDecisionEngine
        
        Args:
            game_id: ID of the game
            player_id: ID of the player updating status
            rated: Requested rated status
            
        Returns:
            Updated game with new rated status
            
        Raises:
            RatedStatusImmutableError: If game has already started
        """
        game = await self.repository.get_by_id(game_id)
        if not game:
            raise GameNotFoundError(str(game_id))

        # Verify player is the creator
        if game.creator_account_id != player_id:
            raise GameStateError(
                "Only the game creator can update rated status", str(game_id)
            )

        # ENFORCEMENT RULE: Rated status is immutable after game starts
        if not game.can_change_rated_status():
            raise RatedStatusImmutableError(str(game_id))

        # Re-validate with decision engine
        # TODO: Fetch player ratings if available
        final_rated, decision_reason = self.rating_decision_engine.calculate_decision_reason(
            requested_rated=rated,
            is_local_game=False,  # If changing via API, it's not local
            has_custom_fen=game.starting_fen is not None,
            is_odds_game=game.is_odds_game,
        )

        game.rated = final_rated
        game.decision_reason = decision_reason

        # Save updated game
        saved_game = await self.repository.update(game)

        return saved_game

    def get_pending_events(self) -> List:
        """Get pending domain events."""
        return self.events.copy()

    def clear_pending_events(self) -> None:
        """Clear pending events after publishing."""
        self.events.clear()

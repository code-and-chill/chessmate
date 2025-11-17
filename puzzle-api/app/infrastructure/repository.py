import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.models import Puzzle, DailyPuzzle, UserPuzzleAttempt, UserPuzzleStats
from app.core.schemas import PuzzleCreate, DailyPuzzleCreate, UserPuzzleAttemptCreate

class PuzzleRepository:
    @staticmethod
    def create_puzzle(db: Session, puzzle: PuzzleCreate) -> Puzzle:
        db_puzzle = Puzzle(
            id=str(uuid.uuid4()),
            fen=puzzle.fen,
            solution_moves=puzzle.solution_moves,
            side_to_move=puzzle.side_to_move,
            initial_depth=puzzle.initial_depth,
            difficulty=puzzle.difficulty.value,
            themes=puzzle.themes,
            source=puzzle.source.value,
            rating=puzzle.rating
        )
        db.add(db_puzzle)
        db.commit()
        db.refresh(db_puzzle)
        return db_puzzle

    @staticmethod
    def get_puzzle_by_id(db: Session, puzzle_id: str) -> Puzzle:
        return db.query(Puzzle).filter(Puzzle.id == puzzle_id).first()

    @staticmethod
    def get_active_puzzles(db: Session) -> list[Puzzle]:
        return db.query(Puzzle).filter(Puzzle.is_active == True).all()

class DailyPuzzleRepository:
    @staticmethod
    def create_daily_puzzle(db: Session, daily_puzzle: DailyPuzzleCreate) -> DailyPuzzle:
        db_daily = DailyPuzzle(
            id=str(uuid.uuid4()),
            puzzle_id=daily_puzzle.puzzle_id,
            date_utc=daily_puzzle.date_utc,
            global_title=daily_puzzle.global_title,
            short_description=daily_puzzle.short_description,
            featured=daily_puzzle.featured,
            created_by_admin_id=daily_puzzle.created_by_admin_id
        )
        db.add(db_daily)
        db.commit()
        db.refresh(db_daily)
        return db_daily

    @staticmethod
    def get_daily_puzzle_by_date(db: Session, date_utc: str) -> DailyPuzzle:
        return db.query(DailyPuzzle).filter(DailyPuzzle.date_utc == date_utc).first()

    @staticmethod
    def update_daily_puzzle(db: Session, date_utc: str, puzzle_id: str, title: str) -> DailyPuzzle:
        db_daily = db.query(DailyPuzzle).filter(DailyPuzzle.date_utc == date_utc).first()
        if db_daily:
            db_daily.puzzle_id = puzzle_id
            db_daily.global_title = title
            db.commit()
            db.refresh(db_daily)
        return db_daily

class UserPuzzleAttemptRepository:
    @staticmethod
    def create_attempt(db: Session, attempt: UserPuzzleAttemptCreate) -> UserPuzzleAttempt:
        db_attempt = UserPuzzleAttempt(
            id=str(uuid.uuid4()),
            user_id=attempt.user_id,
            puzzle_id=attempt.puzzle_id,
            is_daily=attempt.is_daily,
            status=attempt.status.value,
            moves_played=attempt.moves_played,
            mistakes=attempt.mistakes,
            hints_used=attempt.hints_used,
            time_spent_ms=attempt.time_spent_ms,
            client_metadata=attempt.client_metadata
        )
        db.add(db_attempt)
        db.commit()
        db.refresh(db_attempt)
        return db_attempt

    @staticmethod
    def get_user_attempts(db: Session, user_id: str, limit: int = 10, offset: int = 0) -> list[UserPuzzleAttempt]:
        return db.query(UserPuzzleAttempt).filter(UserPuzzleAttempt.user_id == user_id).order_by(UserPuzzleAttempt.started_at.desc()).limit(limit).offset(offset).all()

    @staticmethod
    def get_daily_attempt_for_user(db: Session, user_id: str, puzzle_id: str, date_utc: str) -> UserPuzzleAttempt:
        return db.query(UserPuzzleAttempt).filter(
            UserPuzzleAttempt.user_id == user_id,
            UserPuzzleAttempt.puzzle_id == puzzle_id,
            UserPuzzleAttempt.is_daily == True
        ).first()

class UserPuzzleStatsRepository:
    @staticmethod
    def get_or_create_stats(db: Session, user_id: str) -> UserPuzzleStats:
        stats = db.query(UserPuzzleStats).filter(UserPuzzleStats.user_id == user_id).first()
        if not stats:
            stats = UserPuzzleStats(user_id=user_id)
            db.add(stats)
            db.commit()
            db.refresh(stats)
        return stats

    @staticmethod
    def update_stats(db: Session, user_id: str, **kwargs) -> UserPuzzleStats:
        stats = db.query(UserPuzzleStats).filter(UserPuzzleStats.user_id == user_id).first()
        if stats:
            for key, value in kwargs.items():
                if hasattr(stats, key):
                    setattr(stats, key, value)
            db.commit()
            db.refresh(stats)
        return stats

    @staticmethod
    def get_stats(db: Session, user_id: str) -> UserPuzzleStats:
        return db.query(UserPuzzleStats).filter(UserPuzzleStats.user_id == user_id).first()

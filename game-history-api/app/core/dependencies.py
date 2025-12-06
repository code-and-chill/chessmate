from app.services.repository import GameHistoryRepository

def get_repository() -> GameHistoryRepository:
    return GameHistoryRepository()

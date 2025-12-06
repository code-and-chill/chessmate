from app.services.repository import InsightsRepository


repo = InsightsRepository()


def get_repository() -> InsightsRepository:
    return repo

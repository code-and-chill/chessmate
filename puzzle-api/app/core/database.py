import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

# Database URL from environment (default to SQLite for development)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# Detect if using SQLite (connection pooling config differs)
is_sqlite = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

# Connection pool configuration for production performance
# These settings optimize for typical web workloads
POOL_CONFIG = {
    "pool_size": int(os.getenv("DB_POOL_SIZE", "5")),  # Base pool size
    "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "10")),  # Extra connections when busy
    "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),  # Seconds to wait for connection
    "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "1800")),  # Recycle connections after 30 mins
    "pool_pre_ping": True,  # Verify connections before use (handles dropped connections)
}

# Create engine with appropriate configuration
if is_sqlite:
    # SQLite doesn't support connection pooling the same way
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False},
        echo=os.getenv("DB_ECHO", "false").lower() == "true",
    )
else:
    # PostgreSQL/MySQL with connection pooling
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        poolclass=QueuePool,
        **POOL_CONFIG,
        echo=os.getenv("DB_ECHO", "false").lower() == "true",
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Database session dependency.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_pool_status():
    """
    Get current connection pool status (useful for monitoring).
    Returns None for SQLite.
    """
    if is_sqlite:
        return None
    pool = engine.pool
    return {
        "pool_size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
    }

---
title: Python Service Architecture Guidelines
service: global
status: active
last_reviewed: 2025-11-16
type: standard
---

# Python Service Architecture Guidelines (Monocto)

This document defines the architectural principles and implementation patterns for Python services in the **monocto** monorepo. Python services primarily handle ML/AI workloads, content processing, and data-intensive operations.

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [Project Structure](#2-project-structure)
3. [FastAPI Application Architecture](#3-fastapi-application-architecture)
4. [Domain Modeling with Pydantic](#4-domain-modeling-with-pydantic)
5. [Data Access Patterns](#5-data-access-patterns)
6. [Async Programming Patterns](#6-async-programming-patterns)
7. [ML/AI Integration Patterns](#7-mlai-integration-patterns)
8. [Testing Strategies](#8-testing-strategies)
9. [Performance Optimization](#9-performance-optimization)
10. [Implementation Guidelines](#10-implementation-guidelines)
    - 10.1 Layer-Specific Guidelines
    - 10.2 Code Organization Best Practices
    - 10.3 Self-Documenting Code Rules
    - 10.4 SOLID Principles in Python
    - 10.5 File Organization Rules
    - 10.6 Error Handling Best Practices
    - 10.7 Logging and Observability
    - 10.8 Security Best Practices
11. [PEP 8 Style Guide Reference](#11-pep-8-style-guide-reference)
    - 11.1 Code Layout
    - 11.2 Imports
    - 11.3 Whitespace in Expressions and Statements
    - 11.4 Comments and Docstrings
    - 11.5 Naming Conventions
    - 11.6 Programming Recommendations
    - 11.7 Function and Method Arguments
12. [Automated Tooling](#12-automated-tooling)
    - 12.1 Code Formatting
    - 12.2 Static Analysis
    - 12.3 Pre-commit Hooks

---

## 1. Architecture Philosophy

### 1.1 Core Principles

**Type Safety First**
- Comprehensive type hints with mypy validation
- Pydantic models for data validation and serialization
- Strict type checking in CI/CD pipeline
- Runtime type validation for external data

**Async-First Design**
- Async/await for I/O operations
- Non-blocking database and HTTP clients
- Proper connection pooling and resource management
- Graceful handling of concurrent operations

**Data-Driven Architecture**
- Pydantic models as single source of truth
- Schema-first API development
- Automatic OpenAPI generation
- Strong validation at service boundaries

**ML/AI Integration**
- Model versioning and artifact management
- A/B testing infrastructure for model experiments
- Feature store integration
- Monitoring and observability for ML pipelines

### 1.2 Service Types

Python services in the Monocto ecosystem typically handle:

- **Content Processing**: Review moderation, text analysis, NLP
- **ML Services**: Recommendation engines, ranking models, personalization
- **Data Processing**: ETL pipelines, data transformation, analytics
- **AI APIs**: LLM integration, computer vision, natural language processing

---

## 2. Project Structure

### 2.1 Standard Layout

```
service-name/
├── app/                           # Application code
│   ├── __init__.py
│   ├── main.py                   # FastAPI application entry point
│   ├── api/                      # API layer
│   │   ├── __init__.py
│   │   ├── dependencies.py       # Dependency injection
│   │   ├── routes/              # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── health.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── content.py
│   │   │       └── models.py
│   │   └── middleware/          # Custom middleware
│   ├── core/                    # Core application logic
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration management
│   │   ├── security.py         # Authentication/authorization
│   │   └── exceptions.py       # Custom exceptions
│   ├── domain/                 # Business domain logic
│   │   ├── __init__.py
│   │   ├── models/            # Domain models
│   │   ├── services/          # Domain services
│   │   └── repositories/      # Repository interfaces
│   ├── infrastructure/        # Infrastructure layer
│   │   ├── __init__.py
│   │   ├── database/         # Database implementations
│   │   ├── external/         # External service clients
│   │   ├── ml/              # ML model implementations
│   │   └── cache/           # Caching implementations
│   └── utils/               # Utility functions
├── tests/                   # Test code
│   ├── __init__.py
│   ├── conftest.py         # Pytest configuration
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── fixtures/           # Test fixtures
├── scripts/                # Utility scripts
├── migrations/             # Database migrations (if using Alembic)
├── requirements/           # Dependency files
│   ├── base.txt           # Base dependencies
│   ├── dev.txt            # Development dependencies
│   └── prod.txt           # Production dependencies
├── pyproject.toml         # Project configuration
├── Dockerfile             # Container definition
└── README.md              # Service documentation
```

### 2.2 Package Organization Rules

**Import Organization**
- Standard library imports first
- Third-party imports second
- Local application imports last
- Use absolute imports for clarity

**Module Naming**
- Use snake_case for module names
- Keep module names short and descriptive
- Group related functionality in packages
- Avoid circular imports

---

## 3. FastAPI Application Architecture

### 3.1 Application Setup

**Main Application**
```python
# app/main.py
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.routes import api_router
from app.core.config import get_settings
from app.core.exceptions import setup_exception_handlers
from app.infrastructure.database import database_manager
from app.infrastructure.ml import model_manager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    # Startup
    await database_manager.connect()
    await model_manager.load_models()
    
    yield
    
    # Shutdown
    await database_manager.disconnect()
    await model_manager.cleanup()


def create_app() -> FastAPI:
    """Create FastAPI application."""
    settings = get_settings()
    
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan,
    )
    
    # Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )
    
    # Exception handlers
    setup_exception_handlers(app)
    
    # Routes
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    return app


app = create_app()

if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
```

### 3.2 Configuration Management

**Settings with Pydantic**
```python
# app/core/config.py
from functools import lru_cache
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )
    
    # Application
    PROJECT_NAME: str = "Content Moderation API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-powered content moderation service"
    DEBUG: bool = False
    PORT: int = 8000
    
    # API
    API_V1_STR: str = "/api/v1"
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_POOL_SIZE: int = 10
    
    # ML Models
    MODEL_CACHE_DIR: str = "/tmp/models"
    MODEL_REGISTRY_URL: Optional[str] = None
    
    # External Services
    OPENAI_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"
    
    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
```

### 3.3 Dependency Injection

**FastAPI Dependencies**
```python
# app/api/dependencies.py
from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import verify_token
from app.domain.models.user import User
from app.infrastructure.database import get_db_session
from app.infrastructure.ml import get_model_manager

# Security
security = HTTPBearer()
settings = get_settings()


async def get_current_user(
    token: str = Depends(security),
    db: AsyncSession = Depends(get_db_session),
) -> User:
    """Get current authenticated user."""
    try:
        payload = verify_token(token.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    
    # Get user from database
    user = await get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


async def get_ml_service():
    """Get ML service dependency."""
    return get_model_manager()


async def get_content_service(
    db: AsyncSession = Depends(get_db_session),
    ml_service = Depends(get_ml_service),
):
    """Get content service with dependencies."""
    from app.domain.services.content_service import ContentService
    from app.infrastructure.repositories.content_repository import ContentRepository
    
    repository = ContentRepository(db)
    return ContentService(repository, ml_service)
```

---

## 4. Domain Modeling with Pydantic

### 4.1 Pydantic V2 Guidelines

**CRITICAL: Use Pydantic V2 Patterns**

All Pydantic models **MUST** use V2 patterns to avoid deprecation warnings and ensure future compatibility.

**Model Configuration (ConfigDict)**
```python
# ❌ BAD: Deprecated Pydantic V1 pattern (class-based Config)
from pydantic import BaseModel

class User(BaseModel):
    name: str
    
    class Config:
        from_attributes = True  # Deprecated pattern
        validate_assignment = True
        use_enum_values = True

# ✅ GOOD: Pydantic V2 pattern (model_config with ConfigDict)
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        validate_assignment=True,
        use_enum_values=True,
    )
    
    name: str
```

**Common ConfigDict Options**
```python
from pydantic import BaseModel, ConfigDict

class DomainModel(BaseModel):
    """Domain model with Pydantic V2 configuration."""
    
    model_config = ConfigDict(
        # ORM mode - allows model to be created from ORM objects
        from_attributes=True,
        
        # Validation
        validate_assignment=True,     # Validate on attribute assignment
        validate_default=True,         # Validate default values
        strict=False,                  # Allow coercion (int -> str, etc.)
        
        # Enums
        use_enum_values=True,         # Use enum values in dict/json
        
        # Serialization
        populate_by_name=True,        # Allow population by field name or alias
        
        # Frozen (immutable)
        frozen=False,                  # Set True for immutable models
        
        # JSON schema
        json_schema_extra={
            "example": {
                "name": "John Doe",
                "email": "john@example.com"
            }
        }
    )
    
    name: str
    email: str
```

**Field Validators (V2 Patterns)**
```python
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

class Account(BaseModel):
    """Account with field validation."""
    
    model_config = ConfigDict(from_attributes=True)
    
    username: str = Field(min_length=3, max_length=32)
    email: str
    tags: list[str] = Field(default_factory=list)
    
    # Field validator (V2 pattern - decorator above method)
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format."""
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v.lower()
    
    # Multiple fields validator
    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: list[str]) -> list[str]:
        """Validate and normalize tags."""
        if len(v) > 10:
            raise ValueError('Maximum 10 tags allowed')
        return [tag.lower().strip() for tag in v if tag.strip()]
    
    # Model validator (validates entire model)
    @model_validator(mode='after')
    def validate_model(self) -> 'Account':
        """Validate entire model after field validation."""
        if 'admin' in self.username and '@admin.com' not in self.email:
            raise ValueError('Admin usernames require admin email domain')
        return self
```

**Computed Fields (V2 Pattern)**
```python
from pydantic import BaseModel, ConfigDict, computed_field

class User(BaseModel):
    """User with computed properties."""
    
    model_config = ConfigDict(from_attributes=True)
    
    first_name: str
    last_name: str
    
    # Computed field (V2 pattern)
    @computed_field
    @property
    def full_name(self) -> str:
        """Computed full name property."""
        return f"{self.first_name} {self.last_name}"
    
    # Cached computed field
    @computed_field
    @property
    def display_name(self) -> str:
        """Cached computed display name."""
        return self.full_name.upper()
```

**Serialization Aliases (V2 Pattern)**
```python
from pydantic import BaseModel, ConfigDict, Field

class APIResponse(BaseModel):
    """API response with field aliases."""
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,  # Accept both 'user_id' and 'userId'
    )
    
    # Serialization alias (output name)
    user_id: str = Field(serialization_alias='userId')
    created_at: datetime = Field(serialization_alias='createdAt')
    
    # Validation alias (input name)
    display_name: str = Field(validation_alias='displayName')
```

**Type Annotations (V2 Patterns)**
```python
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

class Account(BaseModel):
    """Account with annotated types."""
    
    model_config = ConfigDict(from_attributes=True)
    
    # Annotated constraints (more readable than Field)
    username: Annotated[str, StringConstraints(
        min_length=3,
        max_length=32,
        pattern=r'^[a-zA-Z0-9_]+$'
    )]
    
    # Or use Field for complex constraints
    email: str = Field(pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    
    # Numeric constraints
    age: Annotated[int, Field(ge=0, le=150)]
```

**Migration Checklist for Pydantic V2**

When updating existing models:
- [ ] Replace `class Config:` with `model_config = ConfigDict(...)`
- [ ] Add `ConfigDict` to imports: `from pydantic import ConfigDict`
- [ ] Change `orm_mode` to `from_attributes`
- [ ] Replace `regex=` with `pattern=` in Field constraints
- [ ] Replace `max_items` with `max_length` for lists in Field
- [ ] Update validators to use `@field_validator` decorator with `@classmethod`
- [ ] Update model validators to use `@model_validator(mode='after')`
- [ ] Replace `@validator` with `@field_validator`
- [ ] Replace `@root_validator` with `@model_validator`
- [ ] Update computed properties to use `@computed_field`
- [ ] Update settings models: `BaseSettings` from `pydantic_settings`
- [ ] Add type hints to all validator methods
- [ ] Test all validation logic still works

**Common Migration Patterns**
```python
# V1 -> V2 Config
class Config:                          →  model_config = ConfigDict(
    orm_mode = True                    →      from_attributes=True,
    validate_assignment = True         →      validate_assignment=True,
    use_enum_values = True            →      use_enum_values=True,
    allow_population_by_field_name    →      populate_by_name=True,
)

# V1 -> V2 Field Constraints
Field(..., regex=r"^[a-z]+$")         →  Field(..., pattern=r"^[a-z]+$")
Field(..., max_items=10)              →  Field(..., max_length=10)

# V1 -> V2 Validators
@validator('field')                    →  @field_validator('field')
def validate_field(cls, v):           →  @classmethod
    return v                          →  def validate_field(cls, v: type) -> type:
                                      →      return v

@root_validator                       →  @model_validator(mode='after')
def validate_model(cls, values):      →  def validate_model(self) -> 'ModelName':
    return values                     →      return self

# V1 -> V2 Settings
from pydantic import BaseSettings     →  from pydantic_settings import BaseSettings, SettingsConfigDict
class Config:                         →  model_config = SettingsConfigDict(
    env_file = ".env"                 →      env_file=".env",
    case_sensitive = True             →      case_sensitive=True,
)                                     →  )
```

**Common Deprecation Warnings and Fixes**
```python
# Warning: "Support for class-based `config` is deprecated"
# ❌ Old (V1)
class User(BaseModel):
    class Config:
        from_attributes = True

# ✅ New (V2)
class User(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# Warning: "`regex` is deprecated, use `pattern` instead"
# ❌ Old (V1)
email: str = Field(regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")

# ✅ New (V2)
email: str = Field(pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")

# Warning: "Pydantic V1 style `@validator` validators are deprecated"
# ❌ Old (V1)
@validator('username')
def check_username(cls, v):
    return v.lower()

# ✅ New (V2)
@field_validator('username')
@classmethod
def check_username(cls, v: str) -> str:
    return v.lower()
```

### 4.2 Domain Models

**Base Domain Model**
```python
# app/domain/models/base.py
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class BaseEntity(BaseModel):
    """Base entity with common fields."""
    
    model_config = ConfigDict(
        from_attributes=True,
        use_enum_values=True,
        validate_assignment=True,
    )
    
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class BaseDomainEvent(BaseModel):
    """Base domain event."""
    
    model_config = ConfigDict(frozen=True)
    
    event_id: UUID = Field(default_factory=uuid4)
    event_type: str
    aggregate_id: UUID
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    version: int = 1
```

**Content Domain Models**
```python
# app/domain/models/content.py
from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .base import BaseEntity, BaseDomainEvent


class ContentType(str, Enum):
    """Content type enumeration."""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


class ModerationStatus(str, Enum):
    """Content moderation status."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"


class ModerationReason(str, Enum):
    """Moderation rejection reasons."""
    SPAM = "spam"
    HATE_SPEECH = "hate_speech"
    VIOLENCE = "violence"
    ADULT_CONTENT = "adult_content"
    MISINFORMATION = "misinformation"


class ContentItem(BaseEntity):
    """Content item domain model."""
    
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=10000)
    content_type: ContentType
    author_id: UUID
    tenant_id: UUID
    
    # Moderation fields
    moderation_status: ModerationStatus = ModerationStatus.PENDING
    moderation_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    moderation_reasons: List[ModerationReason] = Field(default_factory=list)
    moderated_by: Optional[UUID] = None
    moderated_at: Optional[datetime] = None
    
    # Metadata
    language: Optional[str] = Field(None, pattern=r"^[a-z]{2}$")
    tags: List[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)
    
    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Validate tags list."""
        if len(v) > 10:
            raise ValueError("Maximum 10 tags allowed")
        return [tag.lower().strip() for tag in v if tag.strip()]
    
    def moderate(
        self,
        status: ModerationStatus,
        score: float,
        reasons: List[ModerationReason],
        moderator_id: UUID,
    ) -> "ContentItem":
        """Apply moderation decision."""
        self.moderation_status = status
        self.moderation_score = score
        self.moderation_reasons = reasons
        self.moderated_by = moderator_id
        self.moderated_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        return self
    
    def is_approved(self) -> bool:
        """Check if content is approved."""
        return self.moderation_status == ModerationStatus.APPROVED
    
    def is_rejected(self) -> bool:
        """Check if content is rejected."""
        return self.moderation_status == ModerationStatus.REJECTED


# Domain Events
class ContentCreatedEvent(BaseDomainEvent):
    """Content created domain event."""
    
    event_type: str = "content.created"
    content_id: UUID
    author_id: UUID
    tenant_id: UUID
    content_type: ContentType


class ContentModeratedEvent(BaseDomainEvent):
    """Content moderated domain event."""
    
    event_type: str = "content.moderated"
    content_id: UUID
    status: ModerationStatus
    score: float
    reasons: List[ModerationReason]
    moderator_id: UUID
```

### 4.3 API Models

**Request/Response Models**
```python
# app/api/routes/v1/models.py
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.domain.models.content import ContentType, ModerationStatus, ModerationReason


# Request Models
class CreateContentRequest(BaseModel):
    """Create content request."""
    
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=10000)
    content_type: ContentType
    language: Optional[str] = Field(None, pattern=r"^[a-z]{2}$")
    tags: List[str] = Field(default_factory=list, max_length=10)


class ModerateContentRequest(BaseModel):
    """Moderate content request."""
    
    status: ModerationStatus
    reasons: List[ModerationReason] = Field(default_factory=list)
    notes: Optional[str] = Field(None, max_length=1000)


# Response Models
class ContentResponse(BaseModel):
    """Content response model."""
    
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    body: str
    content_type: ContentType
    author_id: UUID
    moderation_status: ModerationStatus
    moderation_score: Optional[float]
    moderation_reasons: List[ModerationReason]
    language: Optional[str]
    tags: List[str]
    created_at: datetime
    updated_at: Optional[datetime]


class ModerationResponse(BaseModel):
    """Moderation result response."""
    
    content_id: UUID
    status: ModerationStatus
    score: float
    reasons: List[ModerationReason]
    confidence: float
    processing_time_ms: int


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""
    
    model_config = ConfigDict(from_attributes=True)
    
    items: List[ContentResponse]
    total: int
    page: int
    size: int
    pages: int
```

---

## 5. Data Access Patterns

### 5.1 Database Setup

**Async SQLAlchemy Setup**
```python
# app/infrastructure/database/__init__.py
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    echo=settings.DEBUG,
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for ORM models
Base = declarative_base()


class DatabaseManager:
    """Database connection manager."""
    
    async def connect(self) -> None:
        """Connect to database."""
        # Create tables if needed
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    async def disconnect(self) -> None:
        """Disconnect from database."""
        await engine.dispose()


database_manager = DatabaseManager()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session dependency."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### 5.2 Repository Pattern

**Repository Interface**
```python
# app/domain/repositories/content_repository.py
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.models.content import ContentItem, ModerationStatus


class ContentRepositoryInterface(ABC):
    """Content repository interface."""
    
    @abstractmethod
    async def create(self, content: ContentItem) -> ContentItem:
        """Create new content item."""
        pass
    
    @abstractmethod
    async def get_by_id(self, content_id: UUID) -> Optional[ContentItem]:
        """Get content by ID."""
        pass
    
    @abstractmethod
    async def update(self, content: ContentItem) -> ContentItem:
        """Update content item."""
        pass
    
    @abstractmethod
    async def delete(self, content_id: UUID) -> bool:
        """Delete content item."""
        pass
    
    @abstractmethod
    async def find_by_status(
        self,
        status: ModerationStatus,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ContentItem]:
        """Find content by moderation status."""
        pass
    
    @abstractmethod
    async def find_by_author(
        self,
        author_id: UUID,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ContentItem]:
        """Find content by author."""
        pass
```

**Repository Implementation**
```python
# app/infrastructure/repositories/content_repository.py
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.content import ContentItem, ModerationStatus
from app.domain.repositories.content_repository import ContentRepositoryInterface
from app.infrastructure.database.models import ContentORM


class ContentRepository(ContentRepositoryInterface):
    """SQLAlchemy content repository implementation."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, content: ContentItem) -> ContentItem:
        """Create new content item."""
        orm_obj = ContentORM.from_domain(content)
        self.session.add(orm_obj)
        await self.session.commit()
        await self.session.refresh(orm_obj)
        return orm_obj.to_domain()
    
    async def get_by_id(self, content_id: UUID) -> Optional[ContentItem]:
        """Get content by ID."""
        stmt = select(ContentORM).where(ContentORM.id == content_id)
        result = await self.session.execute(stmt)
        orm_obj = result.scalar_one_or_none()
        return orm_obj.to_domain() if orm_obj else None
    
    async def update(self, content: ContentItem) -> ContentItem:
        """Update content item."""
        stmt = (
            update(ContentORM)
            .where(ContentORM.id == content.id)
            .values(**content.dict(exclude={"id", "created_at"}))
            .returning(ContentORM)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        orm_obj = result.scalar_one()
        return orm_obj.to_domain()
    
    async def delete(self, content_id: UUID) -> bool:
        """Delete content item."""
        stmt = delete(ContentORM).where(ContentORM.id == content_id)
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount > 0
    
    async def find_by_status(
        self,
        status: ModerationStatus,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ContentItem]:
        """Find content by moderation status."""
        stmt = (
            select(ContentORM)
            .where(ContentORM.moderation_status == status)
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        orm_objects = result.scalars().all()
        return [obj.to_domain() for obj in orm_objects]
    
    async def find_by_author(
        self,
        author_id: UUID,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ContentItem]:
        """Find content by author."""
        stmt = (
            select(ContentORM)
            .where(ContentORM.author_id == author_id)
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        orm_objects = result.scalars().all()
        return [obj.to_domain() for obj in orm_objects]
```

---

## 6. Async Programming Patterns

### 6.1 Async Service Implementation

**Domain Service with Async Operations**
```python
# app/domain/services/content_service.py
import asyncio
from typing import List, Optional
from uuid import UUID

from app.domain.models.content import ContentItem, ModerationStatus, ModerationReason
from app.domain.repositories.content_repository import ContentRepositoryInterface
from app.infrastructure.ml.moderation_service import ModerationServiceInterface


class ContentService:
    """Content domain service."""
    
    def __init__(
        self,
        repository: ContentRepositoryInterface,
        moderation_service: ModerationServiceInterface,
    ):
        self.repository = repository
        self.moderation_service = moderation_service
    
    async def create_content(
        self,
        title: str,
        body: str,
        content_type: str,
        author_id: UUID,
        tenant_id: UUID,
        **kwargs,
    ) -> ContentItem:
        """Create new content with automatic moderation."""
        
        # Create content item
        content = ContentItem(
            title=title,
            body=body,
            content_type=content_type,
            author_id=author_id,
            tenant_id=tenant_id,
            **kwargs,
        )
        
        # Save to repository
        content = await self.repository.create(content)
        
        # Trigger async moderation
        asyncio.create_task(self._moderate_content(content.id))
        
        return content
    
    async def moderate_content(
        self,
        content_id: UUID,
        moderator_id: UUID,
    ) -> Optional[ContentItem]:
        """Manually moderate content."""
        
        content = await self.repository.get_by_id(content_id)
        if not content:
            return None
        
        # Run AI moderation
        moderation_result = await self.moderation_service.moderate_text(
            content.title + " " + content.body
        )
        
        # Apply moderation decision
        content.moderate(
            status=moderation_result.status,
            score=moderation_result.score,
            reasons=moderation_result.reasons,
            moderator_id=moderator_id,
        )
        
        # Update in repository
        return await self.repository.update(content)
    
    async def bulk_moderate(
        self,
        content_ids: List[UUID],
        moderator_id: UUID,
    ) -> List[ContentItem]:
        """Bulk moderate multiple content items."""
        
        # Fetch all content items concurrently
        tasks = [self.repository.get_by_id(cid) for cid in content_ids]
        contents = await asyncio.gather(*tasks)
        
        # Filter out None values
        valid_contents = [c for c in contents if c is not None]
        
        # Moderate all items concurrently
        moderation_tasks = [
            self._moderate_single_content(content, moderator_id)
            for content in valid_contents
        ]
        
        return await asyncio.gather(*moderation_tasks)
    
    async def _moderate_content(self, content_id: UUID) -> None:
        """Background task for content moderation."""
        try:
            content = await self.repository.get_by_id(content_id)
            if not content:
                return
            
            # Run AI moderation
            moderation_result = await self.moderation_service.moderate_text(
                content.title + " " + content.body
            )
            
            # Auto-approve if score is low enough
            if moderation_result.score < 0.3:
                status = ModerationStatus.APPROVED
            elif moderation_result.score > 0.7:
                status = ModerationStatus.REJECTED
            else:
                status = ModerationStatus.FLAGGED
            
            # Apply moderation
            content.moderate(
                status=status,
                score=moderation_result.score,
                reasons=moderation_result.reasons,
                moderator_id=None,  # AI moderation
            )
            
            # Update in repository
            await self.repository.update(content)
            
        except Exception as e:
            # Log error but don't raise to avoid crashing background task
            logger.error(f"Failed to moderate content {content_id}: {e}")
    
    async def _moderate_single_content(
        self,
        content: ContentItem,
        moderator_id: UUID,
    ) -> ContentItem:
        """Moderate a single content item."""
        
        moderation_result = await self.moderation_service.moderate_text(
            content.title + " " + content.body
        )
        
        content.moderate(
            status=moderation_result.status,
            score=moderation_result.score,
            reasons=moderation_result.reasons,
            moderator_id=moderator_id,
        )
        
        return await self.repository.update(content)
```

### 6.2 HTTP Client Patterns

**Async HTTP Client**
```python
# app/infrastructure/external/http_client.py
import asyncio
from typing import Any, Dict, Optional
from urllib.parse import urljoin

import aiohttp
from aiohttp import ClientTimeout

from app.core.config import get_settings


class AsyncHTTPClient:
    """Async HTTP client with connection pooling."""
    
    def __init__(
        self,
        base_url: str,
        timeout: int = 30,
        max_connections: int = 100,
        headers: Optional[Dict[str, str]] = None,
    ):
        self.base_url = base_url
        self.timeout = ClientTimeout(total=timeout)
        self.headers = headers or {}
        
        # Connection pool configuration
        connector = aiohttp.TCPConnector(
            limit=max_connections,
            limit_per_host=20,
            keepalive_timeout=30,
            enable_cleanup_closed=True,
        )
        
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=self.timeout,
            headers=self.headers,
        )
    
    async def get(
        self,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Make GET request."""
        url = urljoin(self.base_url, path)
        
        async with self.session.get(
            url,
            params=params,
            headers=headers,
        ) as response:
            response.raise_for_status()
            return await response.json()
    
    async def post(
        self,
        path: str,
        data: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Make POST request."""
        url = urljoin(self.base_url, path)
        
        async with self.session.post(
            url,
            data=data,
            json=json,
            headers=headers,
        ) as response:
            response.raise_for_status()
            return await response.json()
    
    async def close(self) -> None:
        """Close the HTTP session."""
        await self.session.close()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
```

---

## 7. ML/AI Integration Patterns

### 7.1 Model Management

**ML Model Manager**
```python
# app/infrastructure/ml/model_manager.py
import asyncio
import pickle
from pathlib import Path
from typing import Any, Dict, Optional

import joblib
import torch
from transformers import AutoModel, AutoTokenizer

from app.core.config import get_settings


class ModelManager:
    """ML model lifecycle manager."""
    
    def __init__(self):
        self.settings = get_settings()
        self.models: Dict[str, Any] = {}
        self.tokenizers: Dict[str, Any] = {}
        self._lock = asyncio.Lock()
    
    async def load_models(self) -> None:
        """Load all required models."""
        await asyncio.gather(
            self._load_text_classifier(),
            self._load_sentiment_analyzer(),
            self._load_toxicity_detector(),
        )
    
    async def _load_text_classifier(self) -> None:
        """Load text classification model."""
        async with self._lock:
            model_path = Path(self.settings.MODEL_CACHE_DIR) / "text_classifier"
            
            if model_path.exists():
                # Load from local cache
                self.models["text_classifier"] = joblib.load(model_path / "model.pkl")
            else:
                # Load from model registry or train new model
                model = await self._download_model("text_classifier")
                self.models["text_classifier"] = model
                
                # Cache locally
                model_path.mkdir(parents=True, exist_ok=True)
                joblib.dump(model, model_path / "model.pkl")
    
    async def _load_sentiment_analyzer(self) -> None:
        """Load sentiment analysis model."""
        async with self._lock:
            model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
            
            # Load tokenizer and model
            self.tokenizers["sentiment"] = AutoTokenizer.from_pretrained(model_name)
            self.models["sentiment"] = AutoModel.from_pretrained(model_name)
    
    async def _load_toxicity_detector(self) -> None:
        """Load toxicity detection model."""
        async with self._lock:
            model_name = "unitary/toxic-bert"
            
            self.tokenizers["toxicity"] = AutoTokenizer.from_pretrained(model_name)
            self.models["toxicity"] = AutoModel.from_pretrained(model_name)
    
    async def _download_model(self, model_name: str) -> Any:
        """Download model from registry."""
        # Implement model registry download logic
        # This could be MLflow, Weights & Biases, or custom registry
        pass
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get loaded model."""
        return self.models.get(model_name)
    
    def get_tokenizer(self, tokenizer_name: str) -> Optional[Any]:
        """Get loaded tokenizer."""
        return self.tokenizers.get(tokenizer_name)
    
    async def cleanup(self) -> None:
        """Cleanup resources."""
        self.models.clear()
        self.tokenizers.clear()


# Global model manager instance
model_manager = ModelManager()


def get_model_manager() -> ModelManager:
    """Get model manager dependency."""
    return model_manager
```

### 7.2 ML Service Implementation

**Content Moderation Service**
```python
# app/infrastructure/ml/moderation_service.py
import asyncio
from typing import List, NamedTuple

import numpy as np
import torch
from transformers import pipeline

from app.domain.models.content import ModerationStatus, ModerationReason
from app.infrastructure.ml.model_manager import ModelManager


class ModerationResult(NamedTuple):
    """Moderation result."""
    status: ModerationStatus
    score: float
    reasons: List[ModerationReason]
    confidence: float


class ModerationServiceInterface:
    """Moderation service interface."""
    
    async def moderate_text(self, text: str) -> ModerationResult:
        """Moderate text content."""
        raise NotImplementedError


class MLModerationService(ModerationServiceInterface):
    """ML-powered content moderation service."""
    
    def __init__(self, model_manager: ModelManager):
        self.model_manager = model_manager
        self._sentiment_pipeline = None
        self._toxicity_pipeline = None
    
    async def moderate_text(self, text: str) -> ModerationResult:
        """Moderate text using multiple ML models."""
        
        # Run multiple moderation checks concurrently
        tasks = [
            self._check_sentiment(text),
            self._check_toxicity(text),
            self._check_spam(text),
            self._check_hate_speech(text),
        ]
        
        results = await asyncio.gather(*tasks)
        
        # Aggregate results
        sentiment_score, sentiment_reasons = results[0]
        toxicity_score, toxicity_reasons = results[1]
        spam_score, spam_reasons = results[2]
        hate_score, hate_reasons = results[3]
        
        # Calculate overall score (weighted average)
        overall_score = (
            sentiment_score * 0.2 +
            toxicity_score * 0.4 +
            spam_score * 0.2 +
            hate_score * 0.2
        )
        
        # Determine status
        if overall_score < 0.3:
            status = ModerationStatus.APPROVED
        elif overall_score > 0.7:
            status = ModerationStatus.REJECTED
        else:
            status = ModerationStatus.FLAGGED
        
        # Combine reasons
        all_reasons = sentiment_reasons + toxicity_reasons + spam_reasons + hate_reasons
        unique_reasons = list(set(all_reasons))
        
        # Calculate confidence (inverse of score variance)
        scores = [sentiment_score, toxicity_score, spam_score, hate_score]
        confidence = 1.0 - np.var(scores)
        
        return ModerationResult(
            status=status,
            score=overall_score,
            reasons=unique_reasons,
            confidence=confidence,
        )
    
    async def _check_sentiment(self, text: str) -> tuple[float, List[ModerationReason]]:
        """Check sentiment of text."""
        if not self._sentiment_pipeline:
            model = self.model_manager.get_model("sentiment")
            tokenizer = self.model_manager.get_tokenizer("sentiment")
            self._sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model=model,
                tokenizer=tokenizer,
            )
        
        # Run sentiment analysis
        result = await asyncio.get_event_loop().run_in_executor(
            None, self._sentiment_pipeline, text
        )
        
        # Convert to moderation score
        if result[0]["label"] == "NEGATIVE" and result[0]["score"] > 0.8:
            return 0.7, []  # High negative sentiment
        elif result[0]["label"] == "POSITIVE":
            return 0.1, []  # Positive sentiment is good
        else:
            return 0.3, []  # Neutral sentiment
    
    async def _check_toxicity(self, text: str) -> tuple[float, List[ModerationReason]]:
        """Check toxicity of text."""
        if not self._toxicity_pipeline:
            model = self.model_manager.get_model("toxicity")
            tokenizer = self.model_manager.get_tokenizer("toxicity")
            self._toxicity_pipeline = pipeline(
                "text-classification",
                model=model,
                tokenizer=tokenizer,
            )
        
        # Run toxicity detection
        result = await asyncio.get_event_loop().run_in_executor(
            None, self._toxicity_pipeline, text
        )
        
        # Check for toxic content
        toxic_score = next(
            (r["score"] for r in result if r["label"] == "TOXIC"),
            0.0
        )
        
        reasons = []
        if toxic_score > 0.7:
            reasons.append(ModerationReason.HATE_SPEECH)
        
        return toxic_score, reasons
    
    async def _check_spam(self, text: str) -> tuple[float, List[ModerationReason]]:
        """Check for spam content."""
        # Simple spam detection logic
        spam_indicators = [
            "click here", "buy now", "limited time", "act fast",
            "free money", "guaranteed", "no risk", "100% free"
        ]
        
        text_lower = text.lower()
        spam_count = sum(1 for indicator in spam_indicators if indicator in text_lower)
        
        # Calculate spam score
        spam_score = min(spam_count * 0.2, 1.0)
        
        reasons = []
        if spam_score > 0.5:
            reasons.append(ModerationReason.SPAM)
        
        return spam_score, reasons
    
    async def _check_hate_speech(self, text: str) -> tuple[float, List[ModerationReason]]:
        """Check for hate speech."""
        # Implement hate speech detection
        # This could use a specialized model or rule-based approach
        
        hate_keywords = [
            # Add hate speech keywords (be careful with this list)
        ]
        
        text_lower = text.lower()
        hate_count = sum(1 for keyword in hate_keywords if keyword in text_lower)
        
        hate_score = min(hate_count * 0.3, 1.0)
        
        reasons = []
        if hate_score > 0.5:
            reasons.append(ModerationReason.HATE_SPEECH)
        
        return hate_score, reasons
```

---

## 8. Testing Strategies

### 8.1 Unit Testing with Pytest

**Test Configuration**
```python
# tests/conftest.py
import asyncio
from typing import AsyncGenerator, Generator
from unittest.mock import AsyncMock

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.infrastructure.database import Base, get_db_session
from app.main import app


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    # Use in-memory SQLite for tests
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    AsyncSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with AsyncSessionLocal() as session:
        yield session
    
    await engine.dispose()


@pytest.fixture
def client(db_session: AsyncSession) -> TestClient:
    """Create test client with database override."""
    
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db_session] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def mock_ml_service():
    """Mock ML service for testing."""
    mock = AsyncMock()
    mock.moderate_text.return_value = ModerationResult(
        status=ModerationStatus.APPROVED,
        score=0.2,
        reasons=[],
        confidence=0.9,
    )
    return mock
```

**Domain Model Tests**
```python
# tests/unit/domain/test_content.py
import pytest
from uuid import uuid4

from app.domain.models.content import ContentItem, ContentType, ModerationStatus, ModerationReason


class TestContentItem:
    """Test content item domain model."""
    
    def test_create_content_item(self):
        """Test creating a content item."""
        content = ContentItem(
            title="Test Title",
            body="Test body content",
            content_type=ContentType.TEXT,
            author_id=uuid4(),
            tenant_id=uuid4(),
        )
        
        assert content.title == "Test Title"
        assert content.body == "Test body content"
        assert content.content_type == ContentType.TEXT
        assert content.moderation_status == ModerationStatus.PENDING
        assert content.moderation_score is None
        assert content.moderation_reasons == []
    
    def test_moderate_content(self):
        """Test moderating content."""
        content = ContentItem(
            title="Test Title",
            body="Test body content",
            content_type=ContentType.TEXT,
            author_id=uuid4(),
            tenant_id=uuid4(),
        )
        
        moderator_id = uuid4()
        moderated_content = content.moderate(
            status=ModerationStatus.APPROVED,
            score=0.2,
            reasons=[],
            moderator_id=moderator_id,
        )
        
        assert moderated_content.moderation_status == ModerationStatus.APPROVED
        assert moderated_content.moderation_score == 0.2
        assert moderated_content.moderated_by == moderator_id
        assert moderated_content.moderated_at is not None
        assert moderated_content.updated_at is not None
    
    def test_is_approved(self):
        """Test content approval check."""
        content = ContentItem(
            title="Test Title",
            body="Test body content",
            content_type=ContentType.TEXT,
            author_id=uuid4(),
            tenant_id=uuid4(),
        )
        
        assert not content.is_approved()
        
        content.moderate(
            status=ModerationStatus.APPROVED,
            score=0.1,
            reasons=[],
            moderator_id=uuid4(),
        )
        
        assert content.is_approved()
    
    def test_validate_tags(self):
        """Test tag validation."""
        with pytest.raises(ValueError, match="Maximum 10 tags allowed"):
            ContentItem(
                title="Test Title",
                body="Test body content",
                content_type=ContentType.TEXT,
                author_id=uuid4(),
                tenant_id=uuid4(),
                tags=["tag" + str(i) for i in range(11)],
            )
    
    def test_tags_normalization(self):
        """Test tag normalization."""
        content = ContentItem(
            title="Test Title",
            body="Test body content",
            content_type=ContentType.TEXT,
            author_id=uuid4(),
            tenant_id=uuid4(),
            tags=["  Tag1  ", "TAG2", "tag3", ""],
        )
        
        assert content.tags == ["tag1", "tag2", "tag3"]
```

### 8.2 Integration Testing

**API Integration Tests**
```python
# tests/integration/test_content_api.py
import pytest
from fastapi.testclient import TestClient
from uuid import uuid4

from app.domain.models.content import ContentType, ModerationStatus


@pytest.mark.asyncio
class TestContentAPI:
    """Test content API endpoints."""
    
    async def test_create_content(self, client: TestClient):
        """Test creating content via API."""
        payload = {
            "title": "Test Content",
            "body": "This is test content for moderation",
            "content_type": ContentType.TEXT,
            "language": "en",
            "tags": ["test", "content"],
        }
        
        response = client.post("/api/v1/content", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == payload["title"]
        assert data["body"] == payload["body"]
        assert data["content_type"] == payload["content_type"]
        assert data["moderation_status"] == ModerationStatus.PENDING
    
    async def test_get_content(self, client: TestClient):
        """Test retrieving content via API."""
        # First create content
        payload = {
            "title": "Test Content",
            "body": "This is test content",
            "content_type": ContentType.TEXT,
        }
        
        create_response = client.post("/api/v1/content", json=payload)
        content_id = create_response.json()["id"]
        
        # Then retrieve it
        response = client.get(f"/api/v1/content/{content_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == content_id
        assert data["title"] == payload["title"]
    
    async def test_moderate_content(self, client: TestClient, mock_ml_service):
        """Test content moderation via API."""
        # Create content first
        payload = {
            "title": "Test Content",
            "body": "This is test content",
            "content_type": ContentType.TEXT,
        }
        
        create_response = client.post("/api/v1/content", json=payload)
        content_id = create_response.json()["id"]
        
        # Moderate the content
        moderate_payload = {
            "status": ModerationStatus.APPROVED,
            "reasons": [],
            "notes": "Looks good",
        }
        
        response = client.post(
            f"/api/v1/content/{content_id}/moderate",
            json=moderate_payload,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == ModerationStatus.APPROVED
    
    async def test_list_content_by_status(self, client: TestClient):
        """Test listing content by moderation status."""
        # Create some content
        for i in range(3):
            payload = {
                "title": f"Test Content {i}",
                "body": f"This is test content {i}",
                "content_type": ContentType.TEXT,
            }
            client.post("/api/v1/content", json=payload)
        
        # List pending content
        response = client.get("/api/v1/content?status=pending")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert all(item["moderation_status"] == ModerationStatus.PENDING for item in data["items"])
```

---

## 9. Performance Optimization

### 9.1 Database Optimization

**Query Optimization**
```python
# app/infrastructure/repositories/optimized_content_repository.py
from typing import List
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.models.content import ContentItem, ModerationStatus
from app.infrastructure.database.models import ContentORM, AuthorORM


class OptimizedContentRepository:
    """Optimized content repository with efficient queries."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def find_with_authors(
        self,
        status: ModerationStatus,
        limit: int = 100,
    ) -> List[ContentItem]:
        """Find content with authors using eager loading."""
        stmt = (
            select(ContentORM)
            .options(joinedload(ContentORM.author))  # Eager load author
            .where(ContentORM.moderation_status == status)
            .limit(limit)
        )
        
        result = await self.session.execute(stmt)
        orm_objects = result.unique().scalars().all()
        return [obj.to_domain() for obj in orm_objects]
    
    async def get_content_stats(self) -> dict:
        """Get content statistics with aggregation."""
        stmt = (
            select(
                ContentORM.moderation_status,
                func.count(ContentORM.id).label("count"),
                func.avg(ContentORM.moderation_score).label("avg_score"),
            )
            .group_by(ContentORM.moderation_status)
        )
        
        result = await self.session.execute(stmt)
        rows = result.all()
        
        return {
            row.moderation_status: {
                "count": row.count,
                "avg_score": float(row.avg_score) if row.avg_score else 0.0,
            }
            for row in rows
        }
    
    async def bulk_update_status(
        self,
        content_ids: List[UUID],
        status: ModerationStatus,
    ) -> int:
        """Bulk update content status."""
        stmt = (
            update(ContentORM)
            .where(ContentORM.id.in_(content_ids))
            .values(moderation_status=status, updated_at=func.now())
        )
        
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.rowcount
```

### 9.2 Caching Strategies

**Redis Caching**
```python
# app/infrastructure/cache/content_cache.py
import json
from typing import List, Optional
from uuid import UUID

from redis.asyncio import Redis

from app.domain.models.content import ContentItem, ModerationStatus


class ContentCache:
    """Content caching layer."""
    
    def __init__(self, redis: Redis, ttl: int = 3600):
        self.redis = redis
        self.ttl = ttl
    
    async def get_content(self, content_id: UUID) -> Optional[ContentItem]:
        """Get content from cache."""
        key = f"content:{content_id}"
        data = await self.redis.get(key)
        
        if data:
            content_dict = json.loads(data)
            return ContentItem(**content_dict)
        
        return None
    
    async def set_content(self, content: ContentItem) -> None:
        """Cache content item."""
        key = f"content:{content.id}"
        data = json.dumps(content.dict(), default=str)
        await self.redis.setex(key, self.ttl, data)
    
    async def get_content_list(
        self,
        cache_key: str,
    ) -> Optional[List[ContentItem]]:
        """Get content list from cache."""
        data = await self.redis.get(cache_key)
        
        if data:
            content_list = json.loads(data)
            return [ContentItem(**item) for item in content_list]
        
        return None
    
    async def set_content_list(
        self,
        cache_key: str,
        contents: List[ContentItem],
    ) -> None:
        """Cache content list."""
        data = json.dumps([content.dict() for content in contents], default=str)
        await self.redis.setex(cache_key, self.ttl, data)
    
    async def invalidate_content(self, content_id: UUID) -> None:
        """Invalidate content cache."""
        key = f"content:{content_id}"
        await self.redis.delete(key)
        
        # Also invalidate related list caches
        pattern = "content_list:*"
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)


# Cached repository decorator
class CachedContentRepository:
    """Content repository with caching."""
    
    def __init__(self, repository, cache: ContentCache):
        self.repository = repository
        self.cache = cache
    
    async def get_by_id(self, content_id: UUID) -> Optional[ContentItem]:
        """Get content with caching."""
        # Try cache first
        content = await self.cache.get_content(content_id)
        if content:
            return content
        
        # Fallback to repository
        content = await self.repository.get_by_id(content_id)
        if content:
            await self.cache.set_content(content)
        
        return content
    
    async def update(self, content: ContentItem) -> ContentItem:
        """Update content and invalidate cache."""
        updated_content = await self.repository.update(content)
        await self.cache.invalidate_content(content.id)
        return updated_content
    
    async def find_by_status(
        self,
        status: ModerationStatus,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ContentItem]:
        """Find content by status with caching."""
        cache_key = f"content_list:status:{status}:limit:{limit}:offset:{offset}"
        
        # Try cache first
        contents = await self.cache.get_content_list(cache_key)
        if contents:
            return contents
        
        # Fallback to repository
        contents = await self.repository.find_by_status(status, limit, offset)
        await self.cache.set_content_list(cache_key, contents)
        
        return contents
```

---

## 10. Implementation Guidelines

### 10.1 Do/Don't Checklist

**Type Safety**
- **Do**: Use comprehensive type hints for all functions and methods
- **Do**: Validate data with Pydantic models at service boundaries
- **Do**: Run mypy in strict mode in CI/CD
- **Do**: Use Union types and Optional for nullable values
- **Don't**: Use `Any` type unless absolutely necessary
- **Don't**: Skip type hints for "simple" functions
- **Don't**: Ignore mypy warnings

**Async Programming**
- **Do**: Use async/await for all I/O operations
- **Do**: Use asyncio.gather() for concurrent operations
- **Do**: Properly handle async context managers
- **Do**: Use connection pooling for databases and HTTP clients
- **Don't**: Mix sync and async code without proper handling
- **Don't**: Block the event loop with CPU-intensive operations
- **Don't**: Create tasks without proper cleanup

**Error Handling**
- **Do**: Create custom exception classes for domain errors
- **Do**: Use proper HTTP status codes for API responses
- **Do**: Log errors with structured logging
- **Do**: Validate input data at API boundaries
- **Don't**: Catch and ignore exceptions silently
- **Don't**: Return generic error messages to clients
- **Don't**: Let exceptions bubble up without context

**Performance**
- **Do**: Use database query optimization techniques
- **Do**: Implement caching for frequently accessed data
- **Do**: Use bulk operations for multiple database changes
- **Do**: Profile and monitor application performance
- **Don't**: Make N+1 database queries
- **Don't**: Load unnecessary data from databases
- **Don't**: Ignore memory usage in ML operations

### 10.2 Code Organization Best Practices

**Module Structure**
- Keep modules focused on single responsibilities
- Use clear, descriptive names for modules and functions
- Group related functionality in packages
- Maintain consistent import organization

**Function Design**
- Keep functions small and focused
- Use descriptive parameter and return type hints
- Handle edge cases explicitly
- Write docstrings for public functions

**Class Design**
- Use Pydantic models for data validation
- Implement proper `__str__` and `__repr__` methods
- Use composition over inheritance
- Keep classes focused on single responsibilities

### 10.3 Self-Documenting Code Rules

**Naming Conventions**
```python
# Bad: Unclear abbreviations and non-descriptive names
def proc_usr(u, st):
    return u.upd(st)

# Good: Clear, self-explanatory names
def process_user_status(user: User, status: UserStatus) -> User:
    return user.update_status(status)
```

**Function and Method Names**
- Use verbs for functions that perform actions: `calculate_total`, `send_notification`, `validate_email`
- Use nouns for functions that return values: `get_user`, `find_booking`, `to_dict`
- Boolean functions should start with `is_`, `has_`, `can_`: `is_valid`, `has_permission`, `can_access`

**Variable Names**
```python
# Bad: Single letters and unclear abbreviations
x = get_usr()
dt = datetime.now()
tmp = calc(a, b, c)

# Good: Descriptive names
current_user = get_current_user()
booking_date = datetime.now()
discount_amount = calculate_discount(base_price, tier, promo_code)
```

**Class Names**
- Use nouns: `UserRepository`, `BookingService`, `EmailValidator`
- Avoid generic names: Use `BookingRepository` not `DataAccess`
- Use specific names: Use `PremiumUserTier` not `Tier1`

**Type Hints as Documentation**
```python
# Bad: No type hints
def process(data):
    return data.transform()

# Good: Type hints document expected types
def process_booking_data(
    booking_data: BookingRequest,
    user_context: UserContext,
    validation_rules: list[ValidationRule]
) -> BookingResponse:
    """Process booking with validation and context."""
    return booking_data.transform(user_context, validation_rules)
```

**Constants and Configuration**
```python
# Bad: Magic numbers and unclear constants
if user.age > 18:
    discount = price * 0.15

# Good: Named constants with clear meaning
ADULT_AGE_THRESHOLD = 18
STANDARD_DISCOUNT_RATE = 0.15

if user.age > ADULT_AGE_THRESHOLD:
    discount = price * STANDARD_DISCOUNT_RATE
```

**Documentation Guidelines**
```python
# Only document WHY, not WHAT (code should be self-explanatory)

# Bad: Comment repeats what code does
# Check if user age is greater than 18
if user.age > ADULT_AGE_THRESHOLD:
    pass

# Good: Comment explains business context
# Insurance regulations require age verification for coverage eligibility
if user.age > ADULT_AGE_THRESHOLD:
    pass
```

### 10.4 SOLID Principles in Python

**Single Responsibility Principle (SRP)**
```python
# Bad: Class does too many things
class UserManager:
    def create_user(self, data: dict) -> User: ...
    def send_welcome_email(self, user: User) -> None: ...
    def log_creation(self, user: User) -> None: ...
    def update_analytics(self, user: User) -> None: ...

# Good: Each class has one responsibility
class UserRepository:
    def create(self, user: User) -> User: ...
    def find_by_id(self, user_id: str) -> User | None: ...

class EmailService:
    def send_welcome_email(self, user: User) -> None: ...

class UserEventLogger:
    def log_creation(self, user: User) -> None: ...
```

**Open/Closed Principle (OCP)**
```python
# Bad: Modifying class for new behavior
class DiscountCalculator:
    def calculate(self, amount: Decimal, user_type: str) -> Decimal:
        if user_type == "standard":
            return amount * Decimal("0.05")
        elif user_type == "premium":
            return amount * Decimal("0.15")
        # Adding new type requires modifying this class
        elif user_type == "vip":
            return amount * Decimal("0.25")

# Good: Open for extension, closed for modification
from abc import ABC, abstractmethod

class DiscountStrategy(ABC):
    @abstractmethod
    def calculate(self, amount: Decimal) -> Decimal:
        pass

class StandardDiscount(DiscountStrategy):
    def calculate(self, amount: Decimal) -> Decimal:
        return amount * Decimal("0.05")

class PremiumDiscount(DiscountStrategy):
    def calculate(self, amount: Decimal) -> Decimal:
        return amount * Decimal("0.15")

class VIPDiscount(DiscountStrategy):
    def calculate(self, amount: Decimal) -> Decimal:
        return amount * Decimal("0.25")

class DiscountCalculator:
    def __init__(self, strategy: DiscountStrategy):
        self.strategy = strategy
    
    def calculate(self, amount: Decimal) -> Decimal:
        return self.strategy.calculate(amount)
```

**Liskov Substitution Principle (LSP)**
```python
# Bad: Derived class violates base class contract
class Rectangle:
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height
    
    def area(self) -> float:
        return self.width * self.height

class Square(Rectangle):
    def __init__(self, side: float):
        # Violates LSP: changing width changes height
        super().__init__(side, side)
    
    def set_width(self, width: float):
        self.width = width
        self.height = width  # Side effect!

# Good: Proper abstraction
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        pass

class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height
    
    def area(self) -> float:
        return self.width * self.height

class Square(Shape):
    def __init__(self, side: float):
        self.side = side
    
    def area(self) -> float:
        return self.side * self.side
```

**Interface Segregation Principle (ISP)**
```python
# Bad: Fat interface forces implementations to have unused methods
from abc import ABC, abstractmethod

class Worker(ABC):
    @abstractmethod
    def work(self) -> None:
        pass
    
    @abstractmethod
    def eat(self) -> None:
        pass
    
    @abstractmethod
    def sleep(self) -> None:
        pass

class Robot(Worker):
    def work(self) -> None:
        print("Working")
    
    def eat(self) -> None:
        pass  # Robots don't eat - violation!
    
    def sleep(self) -> None:
        pass  # Robots don't sleep - violation!

# Good: Segregated interfaces
class Workable(ABC):
    @abstractmethod
    def work(self) -> None:
        pass

class Eatable(ABC):
    @abstractmethod
    def eat(self) -> None:
        pass

class Sleepable(ABC):
    @abstractmethod
    def sleep(self) -> None:
        pass

class Human(Workable, Eatable, Sleepable):
    def work(self) -> None:
        print("Working")
    
    def eat(self) -> None:
        print("Eating")
    
    def sleep(self) -> None:
        print("Sleeping")

class Robot(Workable):
    def work(self) -> None:
        print("Working")
```

**Dependency Inversion Principle (DIP)**
```python
# Bad: High-level module depends on low-level module
class MySQLUserRepository:
    def save(self, user: User) -> None:
        # MySQL-specific implementation
        pass

class UserService:
    def __init__(self):
        self.repo = MySQLUserRepository()  # Tight coupling!
    
    def create_user(self, data: dict) -> User:
        user = User(**data)
        self.repo.save(user)
        return user

# Good: Both depend on abstraction
from abc import ABC, abstractmethod

class UserRepository(ABC):
    @abstractmethod
    def save(self, user: User) -> None:
        pass

class MySQLUserRepository(UserRepository):
    def save(self, user: User) -> None:
        # MySQL-specific implementation
        pass

class PostgresUserRepository(UserRepository):
    def save(self, user: User) -> None:
        # Postgres-specific implementation
        pass

class UserService:
    def __init__(self, repo: UserRepository):  # Depend on abstraction
        self.repo = repo
    
    def create_user(self, data: dict) -> User:
        user = User(**data)
        self.repo.save(user)
        return user
```

### 10.5 File Organization Rules

**Module File Limits**
- Maximum 500 lines per file
- Split larger files into logical submodules
- Group related functionality in packages

**One Class Per File Rule** ⚠️ **CRITICAL**
- **Each public class MUST be in its own file** for maintainability and discoverability
- File name MUST match the class name in snake_case (e.g., `AccountRepository` → `account_repository.py`)
- **Repositories**: One repository class per file - NO exceptions
- **Services**: One service class per file - NO exceptions
- **Domain Models**: Split by aggregate root - see exceptions below

**VERY LIMITED Exceptions for Multiple Classes:**
1. **Single Aggregate Root with Sub-Models** (Same lifecycle, never used independently)
   - ✅ Example: `Account`, `AccountProfile`, `AccountMedia` in ONE `domain/models/account.py`
   - ✅ Must represent ONE domain concept with tightly coupled components
   - ✅ Sub-models are ALWAYS loaded/saved with the parent
   - ❌ NOT for: Independent models, different aggregates, or separately used models

2. **~~Request/Response DTOs in API Layer~~** ❌ **REMOVED - DTOs must follow one-class-per-file**
   - ❌ Each DTO (request/response model) MUST be in its own file
   - ❌ No grouping allowed, even for related API endpoints
   - ✅ Example: `create_account_request.py`, `create_account_response.py`, `account_response.py`

3. **Enums Directly Related to ONE Model** (< 5 enum classes, < 50 total lines)
   - ✅ Example: `AnimationLevel`, `DefaultTimeControl` used ONLY by `AccountPreferences`
   - ❌ NOT for: Shared enums used by multiple models

4. **Exception Hierarchies** (Only in dedicated `exceptions.py`)
   - ✅ Example: Multiple exception classes in `core/exceptions.py`

5. **Test Classes** (Multiple test classes per test file is fine)

**MUST Split Into Separate Files:**
- ❌ **Different domain aggregates**: `Account` vs `Game` → MUST be separate files
- ❌ **Different repositories**: `AccountRepository` vs `GameRepository` → MUST be separate files
- ❌ **Different services**: `AccountService` vs `GameService` → MUST be separate files
- ❌ **Models used independently**: Imported separately → MUST be separate files
- ❌ **File exceeds 500 lines**: MUST split immediately
- ❌ **Generic models.py with multiple unrelated classes**: NEVER allowed

**When to Split Files:**
- **Different aggregates/domains**: `Account` vs `Game` vs `Tournament` → separate files
- **Different responsibilities**: `AccountRepository` vs `GameRepository` → separate files  
- **File exceeds 500 lines**: Split by logical grouping
- **Classes used independently**: Each class imported/used separately → separate files

```python
# Good: Related aggregate components together
# domain/models/account.py
class TitleCode(str, Enum):
    """Chess titles."""
    GM = "GM"
    IM = "IM"

class Account(BaseModel):
    """Main account aggregate root."""
    title_code: Optional[TitleCode] = None

class AccountPreferences(BaseModel):
    """Account preferences (part of account aggregate)."""
    account_id: UUID

# Good: Separate files for different aggregates
# domain/models/account.py
class Account(BaseModel):
    pass

# domain/models/game.py  
class Game(BaseModel):
    pass

# Bad: Multiple unrelated classes (different aggregates) in one file
# domain/models/models.py
class Account(BaseModel):
    pass

class Game(BaseModel):
    pass

class Tournament(BaseModel):
    pass

# Bad: Multiple repository classes in one file
# infrastructure/repositories.py (350+ lines)
class AccountRepository:
    pass

class GameRepository:
    pass

class TournamentRepository:
    pass
```

**Import Organization**
```python
# 1. Standard library imports
import asyncio
import logging
from datetime import datetime
from typing import Any

# 2. Third-party imports
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select

# 3. Local application imports
from app.core.config import get_settings
from app.domain.models import User
from app.infrastructure.database import get_session
```

**Package Structure Rules**
```
app/
├── __init__.py              # Package marker
├── api/                     # API layer
│   ├── __init__.py
│   ├── dependencies.py      # Shared dependencies
│   └── routes/
│       ├── __init__.py
│       ├── health.py        # Health check endpoints
│       └── v1/
│           ├── __init__.py
│           ├── users.py     # User endpoints
│           └── bookings.py  # Booking endpoints
├── core/                    # Core application
│   ├── __init__.py
│   ├── config.py           # Configuration
│   ├── security.py         # Security utilities
│   └── exceptions.py       # Custom exceptions
├── domain/                  # Business domain
│   ├── __init__.py
│   ├── models.py           # Domain models
│   ├── services.py         # Domain services
│   └── events.py           # Domain events
└── infrastructure/          # Infrastructure
    ├── __init__.py
    ├── database.py         # Database setup
    ├── repositories/       # Data access
    │   ├── __init__.py
    │   ├── user.py
    │   └── booking.py
    └── external/           # External services
        ├── __init__.py
        ├── email.py
        └── payment.py
```

**File Naming Conventions**
- Use lowercase with underscores: `user_service.py`, `booking_repository.py`
- Test files mirror source: `test_user_service.py`
- Models in singular: `user.py` not `users.py`
- Services indicate purpose: `email_service.py`, `payment_gateway.py`

### 10.6 Error Handling Best Practices

**Custom Exception Hierarchy**
```python
class AppException(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, code: str | None = None):
        self.message = message
        self.code = code
        super().__init__(message)

class ValidationError(AppException):
    """Raised when input validation fails."""
    pass

class NotFoundError(AppException):
    """Raised when requested resource is not found."""
    pass

class AuthorizationError(AppException):
    """Raised when user lacks permission."""
    pass

class ExternalServiceError(AppException):
    """Raised when external service fails."""
    pass
```

**Error Handling Patterns**
```python
# Good: Specific exception handling
async def get_user(user_id: str) -> User:
    try:
        user = await user_repository.find_by_id(user_id)
        if user is None:
            raise NotFoundError(f"User {user_id} not found")
        return user
    except DatabaseError as e:
        logger.error(f"Database error fetching user {user_id}", exc_info=e)
        raise ExternalServiceError("Database unavailable") from e

# Good: Context managers for resource cleanup
async def process_file(file_path: str) -> dict[str, Any]:
    async with aiofiles.open(file_path, 'r') as f:
        content = await f.read()
        return parse_content(content)
```

### 10.7 Logging and Observability

**Structured Logging**
```python
import structlog

logger = structlog.get_logger()

# Good: Structured logs with context
async def create_booking(booking_data: BookingRequest) -> Booking:
    logger.info(
        "booking.create.started",
        user_id=booking_data.user_id,
        property_id=booking_data.property_id,
        check_in=booking_data.check_in.isoformat()
    )
    
    try:
        booking = await booking_service.create(booking_data)
        logger.info(
            "booking.create.success",
            booking_id=booking.id,
            user_id=booking_data.user_id
        )
        return booking
    except Exception as e:
        logger.error(
            "booking.create.failed",
            user_id=booking_data.user_id,
            error=str(e),
            exc_info=True
        )
        raise
```

**Performance Monitoring**
```python
import time
from functools import wraps

def measure_time(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            result = await func(*args, **kwargs)
            duration = time.perf_counter() - start
            logger.info(
                f"{func.__name__}.duration",
                duration_ms=duration * 1000,
                function=func.__name__
            )
            return result
        except Exception as e:
            duration = time.perf_counter() - start
            logger.error(
                f"{func.__name__}.error",
                duration_ms=duration * 1000,
                error=str(e)
            )
            raise
    return wrapper

@measure_time
async def expensive_operation(data: dict) -> Result:
    # Implementation
    pass
```

### 10.8 Security Best Practices

**Input Validation**
```python
from pydantic import BaseModel, Field, validator, EmailStr

class UserCreateRequest(BaseModel):
    email: EmailStr  # Validates email format
    username: str = Field(min_length=3, max_length=50, pattern=r'^[a-zA-Z0-9_]+$')
    age: int = Field(ge=0, le=150)
    
    @validator('username')
    def username_no_profanity(cls, v):
        if contains_profanity(v):
            raise ValueError('Username contains inappropriate content')
        return v
```

**Sensitive Data Handling**
```python
from pydantic import SecretStr, BaseModel

class DatabaseConfig(BaseModel):
    host: str
    port: int
    username: str
    password: SecretStr  # Not printed in logs
    
    def get_connection_string(self) -> str:
        # Access with .get_secret_value()
        return f"postgresql://{self.username}:{self.password.get_secret_value()}@{self.host}:{self.port}"

# Don't log sensitive data
logger.info("connecting to database", host=config.host, port=config.port)
# NOT: logger.info("connecting", password=config.password)
```

**SQL Injection Prevention**
```python
# Bad: String interpolation
async def find_user(username: str) -> User:
    query = f"SELECT * FROM users WHERE username = '{username}'"  # DANGEROUS!
    return await db.execute(query)

# Good: Parameterized queries
async def find_user(username: str) -> User:
    query = "SELECT * FROM users WHERE username = :username"
    return await db.fetch_one(query, values={"username": username})

# Best: ORM with type safety
async def find_user(username: str) -> User:
    return await db.scalar(
        select(User).where(User.username == username)
    )
```

---

## 11. PEP 8 Style Guide Reference

This section provides key PEP 8 conventions. For complete details, see [PEP 8](https://www.python.org/dev/peps/pep-0008/).

### 11.1 Code Layout

**Indentation**
- Use 4 spaces per indentation level
- Never mix tabs and spaces
- Continuation lines should align wrapped elements vertically or use a hanging indent

```python
# Good: Aligned with opening delimiter
foo = long_function_name(var_one, var_two,
                         var_three, var_four)

# Good: Hanging indent
foo = long_function_name(
    var_one, var_two,
    var_three, var_four)
```

**Maximum Line Length**
- Limit all lines to 100 characters (configurable via Black)
- For docstrings and comments, limit to 72 characters
- Use implicit line continuation inside parentheses, brackets, and braces

```python
# Good: Break before binary operator
income = (gross_wages
          + taxable_interest
          + (dividends - qualified_dividends)
          - ira_deduction
          - student_loan_interest)
```

**Blank Lines**
- Surround top-level function and class definitions with two blank lines
- Method definitions inside a class are surrounded by a single blank line
- Use blank lines sparingly inside functions to indicate logical sections

```python
class MyClass:
    """Example class."""
    
    def __init__(self):
        self.value = 0
    
    def method_one(self):
        """First method."""
        pass
    
    def method_two(self):
        """Second method."""
        pass


def top_level_function():
    """Top level function."""
    pass
```

### 11.2 Imports

**Import Order**
```python
# 1. Standard library imports
import os
import sys
from datetime import datetime

# 2. Related third-party imports
import numpy as np
import requests
from fastapi import APIRouter

# 3. Local application/library specific imports
from app.core.config import settings
from app.domain.models import User
```

**Import Guidelines**
- Imports should be on separate lines
- Absolute imports are recommended
- Avoid wildcard imports (`from module import *`)
- Use `import` for packages and modules
- Use `from module import name` for specific names

```python
# Good
import os
import sys
from subprocess import Popen, PIPE

# Bad
import os, sys
from subprocess import *
```

### 11.3 Whitespace in Expressions and Statements

**Avoid extraneous whitespace**
```python
# Good
spam(ham[1], {eggs: 2})
foo = (0,)
if x == 4:
    print(x, y)
    x, y = y, x

# Bad
spam( ham[ 1 ], { eggs: 2 } )
foo = (0, )
if x == 4 :
    print(x , y)
    x , y = y , x
```

**Binary Operators**
```python
# Good
i = i + 1
submitted += 1
x = x*2 - 1
hypot2 = x*x + y*y
c = (a+b) * (a-b)

# Bad
i=i+1
submitted +=1
x = x * 2 - 1
hypot2 = x * x + y * y
c = (a + b) * (a - b)
```

**Function Annotations**
```python
# Good
def complex_function(
    real: float,
    imag: float = 0.0
) -> Complex:
    pass

# Bad
def complex_function(real:float, imag:float=0.0)->Complex:
    pass
```

### 11.4 Comments and Docstrings

**Block Comments**
```python
# Block comments generally apply to some (or all) code that follows them,
# and are indented to the same level as that code. Each line of a block
# comment starts with a # and a single space.
#
# Paragraphs inside a block comment are separated by a line containing
# a single #.
```

**Inline Comments**
```python
# Use sparingly
x = x + 1  # Compensate for border

# Don't state the obvious
x = x + 1  # Increment x  # BAD
```

**Docstrings**
```python
def complex_function(arg1: str, arg2: int) -> bool:
    """
    Summary line: Brief description of function.
    
    Extended description providing more details about the function's
    behavior, parameters, and return values.
    
    Args:
        arg1: Description of arg1
        arg2: Description of arg2
        
    Returns:
        Description of return value
        
    Raises:
        ValueError: Description of when this is raised
        
    Examples:
        >>> complex_function("test", 42)
        True
    """
    pass
```

### 11.5 Naming Conventions

**General Principles**
- Names should be descriptive and unambiguous
- Avoid single letter names except for counters or iterators
- Avoid names that are similar to Python keywords

**Naming Styles**
```python
# Modules and packages: lowercase with underscores
my_module.py
my_package/

# Classes: CapWords (PascalCase)
class MyClass:
    pass

class HTTPResponseHandler:
    pass

# Functions and variables: lowercase with underscores
def my_function():
    pass

user_count = 0

# Constants: UPPERCASE with underscores
MAX_OVERFLOW = 100
TOTAL_CONNECTIONS = 500

# Private names: prefix with single underscore
class MyClass:
    def __init__(self):
        self._internal_value = 0  # Protected
        self.__private_value = 0  # Private (name mangling)
    
    def _internal_method(self):  # Protected method
        pass

# Type variables: CapWords
T = TypeVar('T')
UserType = TypeVar('UserType', bound=User)
```

**Special Cases**
```python
# Boolean variables: use is_, has_, can_, should_
is_active = True
has_permission = False
can_edit = True
should_retry = False

# Collections: use plural names
users = []
booking_ids = set()
user_map = {}

# Single item from collection: singular
for user in users:
    process_user(user)
```

### 11.6 Programming Recommendations

**Comparisons**
```python
# Good: Use 'is' for None
if value is None:
    pass

if value is not None:
    pass

# Bad
if value == None:
    pass

# Good: Use implicit boolean testing
if sequence:
    pass

if not sequence:
    pass

# Bad
if len(sequence) > 0:
    pass

if len(sequence) == 0:
    pass
```

**Exception Handling**
```python
# Good: Be specific about exceptions
try:
    value = collection[key]
except KeyError:
    return default_value

# Bad: Too broad
try:
    value = collection[key]
except:
    return default_value

# Good: Use finally for cleanup
try:
    process_file(file)
finally:
    file.close()

# Better: Use context managers
with open('file.txt') as file:
    process_file(file)
```

**Return Statements**
```python
# Good: Be consistent with return statements
def foo(x):
    if x >= 0:
        return math.sqrt(x)
    else:
        return None

# Bad: Inconsistent
def foo(x):
    if x >= 0:
        return math.sqrt(x)
```

**String Methods**
```python
# Good: Use string methods instead of string module
if name.startswith('prefix'):
    pass

if name.endswith('suffix'):
    pass

# Bad
import string
if name[:6] == 'prefix':
    pass
```

**Type Comparisons**
```python
# Good: Use isinstance()
if isinstance(obj, int):
    pass

# Bad: Direct type comparison
if type(obj) is int:
    pass

# Good: Check for specific types
if isinstance(obj, (int, float)):
    pass
```

**Boolean Comparisons**
```python
# Good: Don't compare boolean values to True or False
if greeting:
    pass

# Bad
if greeting == True:
    pass

if greeting is True:
    pass
```

### 11.7 Function and Method Arguments

**Argument Ordering**
```python
def function(
    positional_arg,
    *args,
    keyword_arg=None,
    **kwargs
):
    pass
```

**Default Argument Values**
```python
# Good: Use None for mutable defaults
def append_to_list(value, target=None):
    if target is None:
        target = []
    target.append(value)
    return target

# Bad: Mutable default argument
def append_to_list(value, target=[]):  # BUG!
    target.append(value)
    return target
```

---

## 12. Automated Tooling

### 12.1 Code Formatting

**Black**
- Automatic code formatter
- Line length: 100 characters
- No configuration needed beyond line length

```toml
# pyproject.toml
[tool.black]
line-length = 100
target-version = ["py311"]
```

**isort**
- Automatically sort and organize imports
- Compatible with Black

```toml
# pyproject.toml
[tool.isort]
profile = "black"
line_length = 100
```

### 12.2 Static Analysis

**mypy**
- Static type checker
- Enforce type hints throughout codebase

```toml
# pyproject.toml
[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
```

**flake8**
- Linting and style checking
- Enforce PEP 8 compliance

```ini
# .flake8
[flake8]
max-line-length = 100
extend-ignore = E203, W503
exclude = .git,__pycache__,venv
```

**pylint**
- Additional static analysis
- Catch potential bugs and code smells

```toml
# pyproject.toml
[tool.pylint.messages_control]
max-line-length = 100
disable = [
    "missing-docstring",
    "too-few-public-methods",
]
```

### 12.3 Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.10.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.1.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.6.0
    hooks:
      - id: mypy
        additional_dependencies: [pydantic, types-requests]
```

---

This comprehensive guide provides the foundation for building robust, scalable Python services in the ChessMate ecosystem. Follow these patterns to ensure high-quality, maintainable code that integrates well with ML/AI workflows and maintains consistency with our Kotlin services.
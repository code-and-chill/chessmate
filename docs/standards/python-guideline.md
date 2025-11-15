---
title: Python Service Architecture Guidelines
service: global
status: active
last_reviewed: 2025-11-15
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

from pydantic import BaseSettings, validator


class Settings(BaseSettings):
    """Application settings."""
    
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
    
    @validator("ALLOWED_HOSTS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


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

### 4.1 Domain Models

**Base Domain Model**
```python
# app/domain/models/base.py
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class BaseEntity(BaseModel):
    """Base entity with common fields."""
    
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True
        use_enum_values = True
        validate_assignment = True


class BaseDomainEvent(BaseModel):
    """Base domain event."""
    
    event_id: UUID = Field(default_factory=uuid4)
    event_type: str
    aggregate_id: UUID
    occurred_at: datetime = Field(default_factory=datetime.utcnow)
    version: int = 1
    
    class Config:
        frozen = True
```

**Content Domain Models**
```python
# app/domain/models/content.py
from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, validator

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
    language: Optional[str] = Field(None, regex=r"^[a-z]{2}$")
    tags: List[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)
    
    @validator("tags")
    def validate_tags(cls, v):
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

### 4.2 API Models

**Request/Response Models**
```python
# app/api/routes/v1/models.py
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.domain.models.content import ContentType, ModerationStatus, ModerationReason


# Request Models
class CreateContentRequest(BaseModel):
    """Create content request."""
    
    title: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=10000)
    content_type: ContentType
    language: Optional[str] = Field(None, regex=r"^[a-z]{2}$")
    tags: List[str] = Field(default_factory=list, max_items=10)


class ModerateContentRequest(BaseModel):
    """Moderate content request."""
    
    status: ModerationStatus
    reasons: List[ModerationReason] = Field(default_factory=list)
    notes: Optional[str] = Field(None, max_length=1000)


# Response Models
class ContentResponse(BaseModel):
    """Content response model."""
    
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
    
    class Config:
        orm_mode = True


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

This comprehensive guide provides the foundation for building robust, scalable Python services in the Monocto ecosystem. Follow these patterns to ensure high-quality, maintainable code that integrates well with ML/AI workflows.
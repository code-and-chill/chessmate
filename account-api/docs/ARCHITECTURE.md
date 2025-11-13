# Account API Architecture and Development Guide

## Overview

The account-api service is the source of truth for player identity and profile management in the chess platform. It implements domain-driven design principles with clear separation of concerns between API, domain, and infrastructure layers.

## Architecture Layers

### 1. API Layer (`app/api/`)

Handles HTTP request/response processing and dependency injection.

**Components:**
- `models.py` - Request/response Pydantic models
- `dependencies.py` - FastAPI dependency injection
- `routes/v1/accounts.py` - Public API endpoints
- `routes/internal/accounts.py` - Internal service-to-service endpoints

**Key Design:**
- One endpoint per concern (no god handlers)
- Request/response models separate from domain models
- Dependencies injected for testability
- Comprehensive error handling with appropriate HTTP status codes

### 2. Domain Layer (`app/domain/`)

Contains business logic and domain models (no external dependencies).

**Subpackages:**
- `models/account.py` - Domain models with business rules
- `services/account_service.py` - Account business logic
- `repositories/account_repository.py` - Repository interfaces (contracts)

**Key Design:**
- Domain models are rich (contain behavior)
- Services orchestrate domain logic
- Repositories are interfaces (abstracted from storage)
- No FastAPI/HTTP dependencies in this layer

### 3. Infrastructure Layer (`app/infrastructure/`)

Implements persistence and external integrations.

**Components:**
- `database/models.py` - SQLAlchemy ORM models
- `database/__init__.py` - Database connection management
- `repositories.py` - Repository implementations

**Key Design:**
- ORM models separate from domain models
- Repositories implement domain interfaces
- Database transactions handled here
- Can be replaced with different storage backend

### 4. Core Layer (`app/core/`)

Cross-cutting concerns for the entire application.

**Components:**
- `config.py` - Environment-based configuration (12-factor style)
- `security.py` - JWT token handling
- `exceptions.py` - Custom exceptions and error handlers

## Key Flows

### Account Creation Flow

```
POST /internal/accounts
  ↓
create_account_request (validation)
  ↓
AccountService.create_account()
  ├─ Validate username
  ├─ Check for duplicates
  ├─ Create Account in repository
  ├─ Create ProfileDetails with defaults
  ├─ Create Media with defaults
  ├─ Create Preferences with defaults
  ├─ Create PrivacySettings with defaults
  └─ Create SocialCounters with defaults
  ↓
Return account_id and username
```

### Profile View Flow

```
GET /v1/accounts/{username}
  ↓
Extract auth context
  ↓
AccountService.get_public_profile()
  ├─ Lookup account by username
  ├─ Check is_profile_public flag
  ├─ Apply privacy filters
  └─ Return public view
  ↓
Return PublicAccountResponse (filtered by privacy rules)
```

### Profile Update Flow

```
PATCH /v1/accounts/me
  ↓
get_current_user_id() from JWT
  ↓
UpdateAccountRequest (validation)
  ↓
AccountService.update_account()
  ├─ Load current account
  ├─ Apply updates
  ├─ Update timestamps
  └─ Persist to repository
  ↓
Return updated FullAccountResponse
```

## Data Models

### Domain Models (app/domain/models/account.py)

```
Account
├── id: UUID
├── auth_user_id: UUID (from auth-api)
├── username: str (unique, 3-32 chars)
├── display_name: str
├── title_code: Optional[TitleCode]  (GM, IM, FM, etc.)
├── country_code: Optional[str]      (ISO-3166)
├── time_zone: Optional[str]
├── language_code: Optional[str]
├── is_active: bool
├── is_banned: bool
├── is_kid_account: bool
├── is_titled_player: bool
├── member_since: datetime
└── timestamps: created_at, updated_at

AccountProfileDetails
├── account_id: UUID (PK, FK to Account)
├── bio: Optional[str]
├── location_text: Optional[str]
├── website_url: Optional[str]
├── youtube_url: Optional[str]
├── twitch_url: Optional[str]
├── twitter_url: Optional[str]
├── other_link_url: Optional[str]
├── favorite_players: Optional[str]
├── favorite_openings: Optional[str]
└── timestamps: created_at, updated_at

AccountPreferences
├── account_id: UUID (PK, FK to Account)
├── board_theme: str
├── piece_set: str
├── sound_enabled: bool
├── animation_level: AnimationLevel (none|minimal|full)
├── highlight_legal_moves: bool
├── show_coordinates: bool
├── confirm_moves: bool
├── default_time_control: DefaultTimeControl (bullet|blitz|rapid|classical)
├── auto_queen_promotion: bool
└── timestamps: created_at, updated_at

AccountPrivacySettings
├── account_id: UUID (PK, FK to Account)
├── show_ratings: bool
├── show_online_status: bool
├── show_game_archive: bool
├── allow_friend_requests: PrivacyLevel
├── allow_messages_from: PrivacyLevel
├── allow_challenges_from: PrivacyLevel
├── is_profile_public: bool
└── timestamps: created_at, updated_at

AccountSocialCounters (denormalized, updated by events)
├── account_id: UUID (PK, FK to Account)
├── followers_count: int
├── following_count: int
├── friends_count: int
├── clubs_count: int
├── total_games_played: int
├── total_puzzles_solved: int
├── last_game_at: Optional[datetime]
├── last_puzzle_at: Optional[datetime]
└── updated_at: datetime
```

### ORM Models (app/infrastructure/database/models.py)

Mirror domain models with SQLAlchemy columns and table definitions.

## Testing Strategy

### Unit Tests (tests/unit/domain/)

Test domain logic without database:
- `test_account_service.py` - Business logic tests
- Uses in-memory SQLite for speed
- Tests error conditions and validation

### Integration Tests (tests/integration/)

Test API endpoints end-to-end:
- HTTP request/response validation
- Database persistence
- Error handling

### Test Configuration (tests/conftest.py)

- Pytest fixtures for database sessions
- In-memory SQLite for fast testing
- Async test support with pytest-asyncio

## Development Workflow

### Local Development

```bash
# 1. Setup
python -m venv venv
source venv/bin/activate
pip install -r requirements/dev.txt

# 2. Configure
cp .env.example .env
# Edit .env with local database URL

# 3. Migrate
alembic upgrade head

# 4. Run
python -m uvicorn app.main:app --reload

# 5. Test
pytest                          # Run all tests
pytest tests/unit/             # Run unit tests only
pytest --cov=app               # With coverage
pytest -v                       # Verbose output

# 6. Code Quality
black app tests                 # Format
isort app tests                 # Sort imports
mypy app                        # Type check
flake8 app tests                # Lint
```

### Adding a New Feature

1. **Define Requirements** - What needs to change?
2. **Update Domain Model** - Add to `app/domain/models/account.py`
3. **Update Database Model** - Add to `app/infrastructure/database/models.py`
4. **Create Migration** - `alembic revision --autogenerate -m "description"`
5. **Implement Repository** - Add to `app/infrastructure/repositories.py`
6. **Implement Service Logic** - Add to `app/domain/services/account_service.py`
7. **Create API Endpoint** - Add to `app/api/routes/v1/accounts.py`
8. **Write Tests** - Add to `tests/unit/domain/` and `tests/integration/`
9. **Document** - Update this guide and endpoint documentation

## Common Patterns

### Adding a New Endpoint

```python
@router.get("/v1/accounts/search")
async def search_accounts(
    query: str,
    user_id: UUID = Depends(get_current_user_id),
    account_service: AccountService = Depends(get_account_service),
) -> list[dict]:
    """Search accounts by username."""
    try:
        accounts = await account_service.search_accounts(query)
        return [acc.model_dump() for acc in accounts]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### Updating the Service

```python
async def search_accounts(self, query: str) -> List[Account]:
    """Search accounts by username pattern."""
    accounts = await self.account_repository.search(query)
    return accounts
```

### Adding Repository Method

```python
async def search(self, query: str) -> List[Account]:
    """Search accounts by username."""
    stmt = select(AccountORM).where(
        AccountORM.username.ilike(f"%{query}%")
    )
    result = await self.session.execute(stmt)
    return [self._orm_to_domain(obj) for obj in result.scalars().all()]
```

## Error Handling

### Custom Exceptions

```python
# In app/core/exceptions.py
class AccountNotFoundError(Exception):
    pass

class InvalidUsernameError(Exception):
    pass

class AccountAlreadyExistsError(Exception):
    pass
```

### Exception Handlers

Map domain exceptions to HTTP responses:

```python
@app.exception_handler(AccountNotFoundError)
async def account_not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc)}
    )
```

## Performance Considerations

### Database Indexing

- `auth_user_id` - Frequently looked up by auth service
- `username` - User-facing lookups
- Consider adding composite indexes for common queries

### Caching

Phase 2 opportunity: Cache public profiles in Redis

```python
cache_key = f"profile:{username}"
cached = await redis.get(cache_key)
if cached:
    return json.loads(cached)
```

### Query Optimization

- Use `select()` with specific columns
- Lazy load related entities as needed
- Consider denormalized counters for analytics

## Security

### JWT Authentication

- Tokens contain `sub` claim (auth_user_id)
- Verify token signature on each request
- Use HTTPS in production

### Authorization

- Users can only modify their own profile
- Admin endpoints require service-to-service auth
- Privacy settings respected for public profiles

### Data Validation

- Pydantic models validate all inputs
- SQL injection prevented by parameterized queries
- Rate limiting should be added via gateway

## Future Enhancements

- Event publishing for profile changes
- Social graph integration (followers)
- Activity feed
- Profile verification badges
- Rich media handling (avatar upload)
- Profile themes/customization
- Search and discovery
- Audit logging for changes
- GDPR data export

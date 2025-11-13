# Account Service - Phase 1: Authentication MVP

**Version**: 1.0  
**Date**: 2024  
**Status**: In Development

## Phase Objectives

Establish foundational user authentication and authorization for the Chessmate platform:
- Enable user registration and login
- Implement JWT-based token generation
- Provide role-based access control (RBAC) framework
- Create account management API for other services

## Scope

### Included

- User registration with email and password
- User login with credential validation
- JWT token generation with user claims
- Token validation endpoint for other services
- Role assignment (admin, user, moderator)
- Account profile retrieval
- Password hashing with bcrypt
- Database persistence with PostgreSQL

### Excluded

- Multi-factor authentication (future phase)
- OAuth2/SAML integration (future phase)
- Account recovery flows (Phase 2)
- Audit logging of authentication events (Phase 2)
- Token refresh mechanism (Phase 2)

## Architecture Decisions

### 1. JWT Over Session-Based Authentication

**Decision**: Use stateless JWT tokens rather than server-side sessions

**Rationale**:
- Scales better with distributed microservices
- Services can validate tokens independently
- Reduced database load for auth checks
- Standard across platform

**Trade-off**: Tokens cannot be revoked immediately; use token blacklist for logouts

### 2. Role-Based Access Control (RBAC) in Claims

**Decision**: Store user roles directly in JWT claims

**Rationale**:
- Services don't need to call back to auth service for authorization
- Reduces latency on every request
- Reduces load on account service

**Trade-off**: Role changes require token reissue; implement token refresh mechanism in Phase 2

### 3. Bcrypt for Password Hashing

**Decision**: Use bcrypt with salt rounds = 12

**Rationale**:
- Industry standard, well-vetted
- Resistant to GPU attacks due to computational cost
- Adaptive: can increase rounds as compute improves

**Trade-off**: Slower login operations; acceptable for security benefit

### 4. PostgreSQL for Account Storage

**Decision**: Single PostgreSQL instance for account data

**Rationale**:
- ACID guarantees for critical data
- Strong referential integrity
- Mature ORM support (SQLAlchemy)

**Trade-off**: Single point of failure; mitigated with automated backup and replication

## Database Schema

### Tables Created

**accounts**
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  roles TEXT[] NOT NULL DEFAULT ARRAY['user'],
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_accounts_username ON accounts(username);
CREATE INDEX idx_accounts_is_active ON accounts(is_active);
```

**Sessions** (for token tracking)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  token_hash VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

CREATE INDEX idx_sessions_account_id ON sessions(account_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

## API Endpoints

### Authentication Endpoints

**POST /api/v1/accounts/register**
- Register new user account
- Input: email, password, username
- Output: account_id, email, username
- Status: 201 Created / 409 Conflict

**POST /api/v1/accounts/login**
- Authenticate and get JWT token
- Input: email, password
- Output: token, token_type, expires_in
- Status: 200 OK / 401 Unauthorized

**POST /api/v1/accounts/logout**
- Revoke token (add to blacklist)
- Input: token
- Output: none
- Status: 204 No Content

**POST /api/v1/accounts/verify-token**
- Verify JWT token validity (for other services)
- Input: token
- Output: user_id, roles, email
- Status: 200 OK / 401 Unauthorized

**GET /api/v1/accounts/me**
- Get current user account details
- Auth: Required (JWT token)
- Output: id, email, username, roles
- Status: 200 OK / 401 Unauthorized

## Breaking Changes

None for initial release.

## Testing Strategy

### Unit Tests (70% coverage)

- **Password Hashing**: Verify bcrypt hashing and verification
- **JWT Generation**: Verify claims are encoded correctly
- **Role Validation**: Verify RBAC logic
- **Input Validation**: Verify email format, password strength

### Integration Tests (15% coverage)

- **Full Registration Flow**: Create account → store in DB → retrieve
- **Full Login Flow**: Verify credentials → generate token → validate token
- **Token Validation**: Verify all services can validate tokens

### Contract Tests (15% coverage)

- **Token Format**: Verify JWT structure matches OpenAPI spec
- **Response Schemas**: Verify all responses match defined schemas
- **Error Responses**: Verify error codes and messages

### Test Files

- `tests/unit/domain/test_account_service.py`: Service logic
- `tests/unit/domain/test_account.py`: Domain model
- `tests/integration/test_accounts_api.py`: API endpoints

## Deployment Considerations

### Prerequisites

- PostgreSQL 14+ running and accessible
- JWT secret key configured (min 32 chars)
- Database initialized with migrations

### Database Initialization

```bash
poetry run alembic upgrade head
```

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret for signing tokens
- `JWT_ALGORITHM`: Algorithm (HS256)
- `JWT_EXPIRATION_HOURS`: Token TTL (24 hours default)

### Deployment Steps

1. Build Docker image
2. Run database migrations
3. Start service with env vars
4. Verify health endpoint: GET /health
5. Test login endpoint

## Service Dependencies

### Internal Dependencies

- None (foundational service)

### External Dependencies

- PostgreSQL 14+: Account data persistence
- python-jose: JWT token generation/validation
- passlib + bcrypt: Password hashing
- sqlalchemy: ORM and database access
- pydantic: Request/response validation

## Blockers and Risks

### Known Limitations

1. **No Immediate Token Revocation**
   - Tokens cannot be revoked until expiration
   - Mitigation: Implement token blacklist in Phase 2
   - Risk: Compromised tokens remain valid

2. **Single Database Instance**
   - No built-in replication
   - Mitigation: Use database backup/recovery procedures
   - Risk: Database outage = auth outage

3. **No Audit Logging**
   - Cannot track who logged in and when
   - Mitigation: Add event publishing in Phase 2
   - Risk: Security/compliance concerns

### Future Enhancements

- Phase 2: Token refresh mechanism, audit logging
- Phase 3: Multi-factor authentication
- Phase 4: OAuth2/SAML integration
- Phase 5: Single sign-on (SSO) across platform

---
title: Account Domain Model
service: account-api
status: draft
last_reviewed: 2025-11-15
type: domain
---

# Account Domain Model

Domain concepts and business rules for account management.

## Bounded Context

The Account service is responsible for player identity, profiles, and account lifecycle.

## Core Entities

### Account

Represents a user's authentication credentials and identity.

**Attributes**:
- `id`: Unique identifier (UUID)
- `username`: Unique login identifier
- `email`: User's email address
- `password_hash`: Bcrypt hash of password
- `created_at`: Account creation timestamp
- `updated_at`: Last modification timestamp
- `status`: active | deactivated | banned

**Invariants**:
- Username must be unique and 3-20 characters
- Email must be valid and unique
- Password must be at least 8 characters
- Status changes follow allowed transitions

### Profile

Public-facing representation of a player.

**Attributes**:
- `account_id`: Foreign key to Account
- `display_name`: Public display name
- `bio`: User biography
- `avatar_url`: Profile picture URL
- `country`: Country code (ISO 3166-1)
- `title`: Chess title (e.g., GM, IM, FM)

**Invariants**:
- Display name is 1-50 characters
- Bio is max 500 characters
- Title must be valid FIDE title

## Value Objects

### Credentials

Username and password combination for authentication.

### Preferences

User UI and gameplay preferences.

(Fill: List preference options)

### PrivacySettings

User-controlled visibility rules.

(Fill: Define privacy options)

## Domain Events

- `AccountCreated` - New account registered
- `AccountActivated` - Account email verified
- `AccountDeactivated` - User deactivated account
- `AccountBanned` - Administrator banned account
- `ProfileUpdated` - Profile information changed
- `PasswordChanged` - User changed password

## Business Rules

1. **Username Immutability**: Username cannot be changed after creation
2. **Email Uniqueness**: Only one active account per email
3. **Deactivation Policy**: Deactivated accounts can be reactivated; banned accounts cannot
4. **Profile Visibility**: Public profile shows only non-sensitive fields
5. **Password Security**: Minimum 8 characters, hashed with bcrypt

## Ubiquitous Language

| Term | Definition |
|------|------------|
| Account | User's authentication identity |
| Profile | Public representation of a player |
| Credentials | Login username and password |
| Status | Account state (active, deactivated, banned) |
| Title | Chess ranking (GM, IM, FM, etc.) |
| Deactivation | Temporary account suspension |
| Ban | Permanent account suspension |

---

*Last updated: 2025-11-15*

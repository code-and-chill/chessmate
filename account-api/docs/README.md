---
title: Account Service Overview
service: account-api
status: active
last_reviewed: 2025-11-15
type: overview
---

# Account Service Documentation

## Overview

The Account Service manages user authentication, authorization, and account lifecycle operations. It provides JWT-based authentication and RBAC (Role-Based Access Control) for the Chessmate platform.

## Key Capabilities

- User registration and authentication
- JWT token generation and validation
- Role-based access control (RBAC)
- Account profile management
- Secure password handling with bcrypt
- Account activation and verification flows

## Ubiquitous Language

- **Account**: User identity and credentials in the system
- **JWT Token**: JSON Web Token containing user claims and roles
- **Role**: Access control category (admin, user, moderator)
- **Credentials**: Email and password combination for authentication
- **Token Claims**: Encoded user ID and roles within JWT

## Integration Patterns

- **Authentication**: All services validate tokens via this service
- **User Lookup**: Services query account data for user information
- **Event Publishing**: Account lifecycle events (created, activated, deleted) propagated to other domains
- **RBAC Enforcement**: Services consume role information from token claims

## Service Dependencies

- PostgreSQL: Account persistence
- Redis: Token blacklist caching (optional)

## API Overview

See `overview.md` for complete API specification.

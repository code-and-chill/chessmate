---
title: Puzzle API Architecture
service: puzzle-api
status: active
last_reviewed: 2025-11-16
type: architecture
---

# Architecture

## High-Level Design
Puzzle API is built using Python and FastAPI. It uses PostgreSQL for data storage and integrates with other services for validation and analytics.

### Key Components
- **Puzzle Management**: Handles CRUD operations for puzzles.
- **Daily Puzzle**: Manages the daily puzzle feature.
- **User Stats**: Tracks user progress and ratings.
- **Admin Tools**: Provides capabilities for bulk import and metadata management.

### External Integrations
- **Account API**: For user authentication.
- **Engine Cluster API**: For puzzle validation and generation.
- **Chess Knowledge API**: For educational content and metadata.
- **Rating API**: For advanced rating calculations (future).

### Database Schema
- `puzzles`
- `daily_puzzles`
- `puzzle_attempts`
- `user_puzzle_stats`

### Event Streaming
- Emits `PuzzleAttemptCreated` events for analytics.
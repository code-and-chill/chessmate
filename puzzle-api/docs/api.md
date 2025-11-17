---
title: Puzzle API Endpoints
service: puzzle-api
status: active
last_reviewed: 2025-11-16
type: api
---

# API Documentation

## Public Endpoints

### GET /api/v1/puzzles/daily
Fetch the daily puzzle for the current or specified date.

### GET /api/v1/puzzles/{puzzle_id}
Retrieve full details of a specific puzzle.

### POST /api/v1/puzzles/{puzzle_id}/attempt
Submit an attempt for a puzzle.

### GET /api/v1/puzzles/user/stats
Retrieve user puzzle statistics.

### GET /api/v1/puzzles/user/history
Fetch the user's recent puzzle attempts.

## Admin Endpoints

### POST /api/v1/admin/puzzles/import
Import puzzles in bulk.

### PUT /api/v1/admin/daily-puzzles/{date_utc}
Set or override the daily puzzle for a specific date.

### POST /api/v1/admin/puzzles/{puzzle_id}/tags
Update puzzle metadata such as tags and difficulty.
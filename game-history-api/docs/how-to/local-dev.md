---
title: Run Game History API Locally
service: game-history-api
status: active
last_reviewed: 2025-12-06
type: how-to
---

# Run Game History API Locally

1. Install dependencies:
   ```bash
   pip install -r requirements
   ```
2. Start the API:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8014
   ```
3. Hit the health endpoint:
   ```bash
   curl http://localhost:8014/health
   ```
4. Create a test game:
   ```bash
   curl -X POST http://localhost:8014/api/v1/games \
     -H "Content-Type: application/json" \
     -d '{
       "whitePlayerId": "550e8400-e29b-41d4-a716-446655440000",
       "blackPlayerId": "550e8400-e29b-41d4-a716-446655440001",
       "result": "WHITE_WIN",
       "timeControl": "3+2",
       "timeControlBucket": "BLITZ",
       "mode": "RATED",
       "endedAt": "2025-12-06T10:00:00Z",
       "moves": 64
     }'
   ```
5. List recent games for a player:
   ```bash
   curl "http://localhost:8014/api/v1/players/550e8400-e29b-41d4-a716-446655440000/games?limit=10"
   ```

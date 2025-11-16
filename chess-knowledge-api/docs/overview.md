---
title: Chess Knowledge – Overview
service: chess-knowledge-api
status: active
last_reviewed: 2025-11-15
type: overview
---

Purpose: Provide pre-computed chess knowledge (opening theory and endgame tablebases).

Responsibilities:
- Query opening books for popular moves in known positions
- Query endgame tablebases for perfect play in simple endgames
- Return weighted move lists or best moves

Non-Goals:
- Position evaluation (engine-cluster-api)
- Game state management (live-game-api)
- Bot decision logic (bot-orchestrator-api)

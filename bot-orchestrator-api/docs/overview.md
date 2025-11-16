---
title: Bot Orchestrator – Overview
service: bot-orchestrator-api
status: active
last_reviewed: 2025-11-15
type: overview
---

Purpose: Orchestrate bot move selection using BotSpec, engine, and chess knowledge.

Responsibilities:
- Load BotSpec for `bot_id`
- Detect phase (opening/middlegame/endgame)
- Decide engine params (depth, time, multi-PV)
- Query engine-cluster/chess-knowledge
- Apply mistake + style models
- Return final move + metadata

Non-Goals:
- Rule validation (handled by live-game-api)
- Persist full games (game-history-api)
- Implement chess search (engine-cluster)
- Accounts/ratings (account-api, rating-api)

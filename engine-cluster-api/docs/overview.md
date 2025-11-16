---
title: Engine Cluster – Overview
service: engine-cluster-api
status: active
last_reviewed: 2025-11-15
type: overview
---

Purpose: Provide chess position evaluation using Stockfish engine.

Responsibilities:
- Accept FEN + search params (depth, time, multi-PV)
- Run Stockfish analysis
- Return top N candidate moves with evaluations
- Support multi-PV for alternative lines

Non-Goals:
- Game state management (live-game-api)
- Opening book (chess-knowledge-api)
- Bot logic (bot-orchestrator-api)

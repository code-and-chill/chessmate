"""Prometheus metrics for live-game-api."""

from prometheus_client import Counter, Gauge, Histogram, generate_latest
from prometheus_client.openmetrics.exposition import CONTENT_TYPE_LATEST

# HTTP request metrics
http_requests_total = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status"],
)

http_request_latency_seconds = Histogram(
    "http_request_latency_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)

http_errors_total = Counter(
    "http_errors_total",
    "Total number of HTTP errors",
    ["method", "endpoint", "status"],
)

# Business metrics (live-game-api specific)
live_game_active_games = Gauge(
    "live_game_active_games",
    "Number of currently active games",
)

live_game_moves_total = Counter(
    "live_game_moves_total",
    "Total number of moves played",
    ["result"],  # result: "valid", "invalid", "checkmate", "stalemate"
)

live_game_move_latency_seconds = Histogram(
    "live_game_move_latency_seconds",
    "Move processing latency in seconds",
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

live_game_websocket_connections = Gauge(
    "live_game_websocket_connections",
    "Number of active WebSocket connections",
)

live_game_websocket_reconnects_total = Counter(
    "live_game_websocket_reconnects_total",
    "Total number of WebSocket reconnections",
)

# Database metrics
db_query_duration_seconds = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["operation"],  # operation: "select", "insert", "update", "delete"
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

# External service call metrics
external_service_calls_total = Counter(
    "external_service_calls_total",
    "Total number of external service calls",
    ["service", "status"],  # service: "bot_orchestrator", "auth", etc.
)

external_service_call_duration_seconds = Histogram(
    "external_service_call_duration_seconds",
    "External service call duration in seconds",
    ["service"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)

# Kafka event publishing metrics
kafka_events_published_total = Counter(
    "kafka_events_published_total",
    "Total number of Kafka events published",
    ["event_type", "status"],  # event_type: "game_created", "move_played", "game_ended"
)

kafka_event_publish_duration_seconds = Histogram(
    "kafka_event_publish_duration_seconds",
    "Kafka event publishing duration in seconds",
    ["event_type"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0],
)

kafka_event_publish_errors_total = Counter(
    "kafka_event_publish_errors_total",
    "Total number of Kafka event publishing errors",
    ["event_type"],
)


def get_metrics_response():
    """Get Prometheus metrics in text format."""
    return generate_latest(), CONTENT_TYPE_LATEST

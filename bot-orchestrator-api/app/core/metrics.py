"""Prometheus metrics for bot-orchestrator-api."""

from prometheus_client import Counter, Histogram, generate_latest
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
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0],
)

http_errors_total = Counter(
    "http_errors_total",
    "Total number of HTTP errors",
    ["method", "endpoint", "status"],
)

# Business metrics
bot_moves_total = Counter(
    "bot_moves_total",
    "Total number of bot moves generated",
    ["bot_id", "status"],  # status: "success", "timeout", "fallback"
)

bot_move_latency_seconds = Histogram(
    "bot_move_latency_seconds",
    "Bot move generation latency in seconds",
    ["bot_id"],
    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 20.0, 30.0],
)

bot_move_timeouts_total = Counter(
    "bot_move_timeouts_total",
    "Total number of bot move timeouts",
    ["bot_id", "timeout_type"],  # timeout_type: "engine", "knowledge", "total"
)

# External service call metrics
external_service_calls_total = Counter(
    "external_service_calls_total",
    "Total number of external service calls",
    ["service", "status"],
)

external_service_call_duration_seconds = Histogram(
    "external_service_call_duration_seconds",
    "External service call duration in seconds",
    ["service"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 20.0, 30.0],
)

# Circuit breaker metrics
circuit_breaker_state = Histogram(
    "circuit_breaker_state",
    "Circuit breaker state (0=closed, 1=open, 2=half-open)",
    ["service"],
)

circuit_breaker_failures_total = Counter(
    "circuit_breaker_failures_total",
    "Total number of circuit breaker failures",
    ["service"],
)

circuit_breaker_transitions_total = Counter(
    "circuit_breaker_transitions_total",
    "Total number of circuit breaker state transitions",
    ["service", "from_state", "to_state"],
)

# Fallback metrics
fallback_moves_total = Counter(
    "fallback_moves_total",
    "Total number of fallback moves generated",
    ["reason"],  # reason: "timeout", "circuit_open", "error"
)


def get_metrics_response():
    """Get Prometheus metrics in text format."""
    return generate_latest(), CONTENT_TYPE_LATEST

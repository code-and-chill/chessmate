"""Prometheus metrics for matchmaking-api."""

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

# Business metrics (matchmaking-api specific)
matchmaking_queue_length = Gauge(
    "matchmaking_queue_length",
    "Current number of players in matchmaking queue",
)

matchmaking_matches_created_total = Counter(
    "matchmaking_matches_created_total",
    "Total number of matches created",
)

matchmaking_match_latency_seconds = Histogram(
    "matchmaking_match_latency_seconds",
    "Time from queue join to match creation in seconds",
    buckets=[1.0, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0, 600.0],
)

matchmaking_queue_wait_time_seconds = Histogram(
    "matchmaking_queue_wait_time_seconds",
    "Time players wait in queue before matching in seconds",
    buckets=[1.0, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0, 600.0],
)

# Database metrics
db_query_duration_seconds = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["operation"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
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
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)

# Circuit breaker metrics
circuit_breaker_state = Gauge(
    "circuit_breaker_state",
    "Circuit breaker state (0=closed, 1=open, 2=half-open)",
    ["service"],
)

circuit_breaker_failures_total = Counter(
    "circuit_breaker_failures_total",
    "Total number of circuit breaker failures",
    ["service"],
)

# Kafka event publishing metrics
kafka_events_published_total = Counter(
    "kafka_events_published_total",
    "Total number of Kafka events published",
    ["event_type", "status"],
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

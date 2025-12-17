"""Prometheus metrics for rating-api."""

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
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)

http_errors_total = Counter(
    "http_errors_total",
    "Total number of HTTP errors",
    ["method", "endpoint", "status"],
)

# Business metrics (rating-api specific)
rating_updates_total = Counter(
    "rating_updates_total",
    "Total number of rating updates",
    ["pool_id"],
)

rating_update_latency_seconds = Histogram(
    "rating_update_latency_seconds",
    "Rating update processing latency in seconds",
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

rating_event_processing_lag_seconds = Histogram(
    "rating_event_processing_lag_seconds",
    "Lag between event timestamp and processing time in seconds",
    buckets=[1.0, 5.0, 10.0, 30.0, 60.0, 120.0, 300.0, 600.0],
)

# Database metrics
db_query_duration_seconds = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["operation"],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

# Kafka event consumption metrics
kafka_events_consumed_total = Counter(
    "kafka_events_consumed_total",
    "Total number of Kafka events consumed",
    ["event_type", "status"],
)

kafka_event_processing_duration_seconds = Histogram(
    "kafka_event_processing_duration_seconds",
    "Kafka event processing duration in seconds",
    ["event_type"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0],
)

kafka_event_processing_errors_total = Counter(
    "kafka_event_processing_errors_total",
    "Total number of Kafka event processing errors",
    ["event_type"],
)

kafka_consumer_lag = Histogram(
    "kafka_consumer_lag",
    "Kafka consumer lag (offset lag) in messages",
    buckets=[1, 10, 100, 1000, 10000, 100000],
)


def get_metrics_response():
    """Get Prometheus metrics in text format."""
    return generate_latest(), CONTENT_TYPE_LATEST

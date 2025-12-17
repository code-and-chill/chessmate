"""OpenTelemetry tracing setup for rating-api."""

import logging
from typing import Optional

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.trace import Span, Tracer

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_settings = get_settings()
_tracer_provider: Optional[TracerProvider] = None
_tracer: Optional[Tracer] = None


def setup_tracing() -> None:
    """Initialize OpenTelemetry tracing."""
    global _tracer_provider, _tracer

    try:
        # Create resource with service information
        resource = Resource.create({
            SERVICE_NAME: "rating-api",
            SERVICE_VERSION: _settings.VERSION,
        })

        # Create tracer provider
        _tracer_provider = TracerProvider(resource=resource)

        # Configure exporter (OTLP to collector)
        otlp_endpoint = getattr(_settings, "OTEL_EXPORTER_OTLP_ENDPOINT", None)
        if otlp_endpoint:
            exporter = OTLPSpanExporter(endpoint=otlp_endpoint)
            span_processor = BatchSpanProcessor(exporter)
            _tracer_provider.add_span_processor(span_processor)
        else:
            logger.warning("OTEL_EXPORTER_OTLP_ENDPOINT not set, tracing disabled")

        # Set global tracer provider
        trace.set_tracer_provider(_tracer_provider)

        # Get tracer instance
        _tracer = trace.get_tracer(__name__)

        logger.info("OpenTelemetry tracing initialized")

    except Exception as e:
        logger.error(f"Failed to initialize OpenTelemetry tracing: {e}", exc_info=True)
        # Continue without tracing if setup fails
        _tracer = None


def instrument_fastapi(app) -> None:
    """Instrument FastAPI application for tracing."""
    try:
        FastAPIInstrumentor.instrument_app(app)
        logger.info("FastAPI instrumented for tracing")
    except Exception as e:
        logger.error(f"Failed to instrument FastAPI: {e}", exc_info=True)


def instrument_sqlalchemy() -> None:
    """Instrument SQLAlchemy for database query tracing."""
    try:
        SQLAlchemyInstrumentor().instrument()
        logger.info("SQLAlchemy instrumented for tracing")
    except Exception as e:
        logger.error(f"Failed to instrument SQLAlchemy: {e}", exc_info=True)


def get_tracer() -> Optional[Tracer]:
    """Get the tracer instance."""
    return _tracer


def get_current_span() -> Optional[Span]:
    """Get the current active span."""
    return trace.get_current_span()


def get_trace_id() -> Optional[str]:
    """Get the current trace ID."""
    span = get_current_span()
    if span and span.get_span_context().is_valid:
        return format(span.get_span_context().trace_id, "032x")
    return None

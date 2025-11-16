# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies and stockfish
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    stockfish \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements ./requirements

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements/prod.txt

# Runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install stockfish
RUN apt-get update && apt-get install -y --no-install-recommends \
    stockfish \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app

# Copy application code
COPY --chown=appuser:appuser app ./app

# Set environment
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    STOCKFISH_PATH=/usr/games/stockfish

USER appuser

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:9000/health')" || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9000"]

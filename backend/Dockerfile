FROM python:3.11-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependencies files
COPY pyproject.toml ./
# If uv.lock exists, copy it too
# COPY uv.lock ./

# Install dependencies
RUN uv sync --no-dev

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

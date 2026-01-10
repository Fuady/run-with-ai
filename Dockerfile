# Stage 1: Build the frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Final image
FROM python:3.11-slim
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy backend dependencies
COPY backend/pyproject.toml ./backend/
# COPY backend/uv.lock ./backend/

# Install dependencies (from root to keep directory structure consistent)
RUN cd backend && uv sync --no-dev

# Copy backend source
COPY backend/ ./backend/

# Copy frontend build to the location expected by main.py
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Render environment variables
ENV PORT=8000
EXPOSE 8000

# Set PYTHONPATH so main.py can find its modules when run from root
ENV PYTHONPATH=/app/backend

# Run the application
CMD ["sh", "-c", "uv run --project backend uvicorn main:app --host 0.0.0.0 --port ${PORT}"]

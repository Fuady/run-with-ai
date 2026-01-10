# RunAI: AI-Powered Running Coach

RunAI is a comprehensive web application designed to provide personalized training plans, real-time stress monitoring, and AI-driven coaching for runners of all levels.

## Problem Description

Most running applications provide generic training plans that don't adapt to a user's daily life. Runners often struggle with overtraining or injury because their plans are too rigid. **RunAI** solves this by:
-   **Adaptive Planning**: Generating dynamic training plans (5K to Marathon) that adjust based on user stress levels.
-   **Holistic Health**: Tracking stress, sleep quality, and injury history to provide a "Readiness Score".
-   **AI Coaching**: Using simulated AI feedback to guide users through their training based on workout completion and stress metrics.
-   **Community Engagement**: Challenges and leaderboards to keep runners motivated.

## AI System Development & MCP

The development of RunAI leveraged advanced AI techniques to ensure high code quality and rapid iteration.

### AI-Assisted Development
-   **Agentic Workflow**: The project was built using **Antigravity**, an agentic AI coding assistant. We followed a strict "Plan-Execute-Verify" cycle, documented in `task.md` and `walkthrough.md`.
-   **OpenAPI Contract-First**: The backend was architected based on a pre-defined `openapi.yaml` specification, ensuring a perfect sync between the React frontend and FastAPI backend.
-   **Prompts & Guidance**: The `agent.md` file serves as a living document of AI instructions for dependency management (`uv`), development scripts, and deployment strategies.

### MCP (Model Context Protocol)
-   The system utilizes custom MCP servers to manage project state, bridging the gap between high-level architectural design and low-level code execution.
-   Tools like `grep_search`, `multi_replace_file_content`, and `command_status` were used asynchronously to maintain system consistency and verify implementation against the API contract.

##  Technologies & System Architecture

The architecture is designed for scalability and modern deployment best practices.

-   **Frontend**: React + TypeScript + Vite. Uses a centralized `ApiClient` (in `services/api.ts`) for all backend communication.
-   **Backend**: FastAPI (Python) using asynchronous endpoints.
-   **Database**: SQLAlchemy ORM with support for:
    -   **SQLite**: Used for local development and fast integration testing.
    -   **PostgreSQL**: Used for production deployment to ensure ACID compliance.
-   **Containerization**: Docker & Docker Compose orchestrate the frontend (via Nginx), backend (via Uvicorn), and database.
-   **CI/CD**: GitHub Actions automates the testing and deployment flow to **Render**.

##  Getting Started

### Prerequisites
-   Docker and Docker Compose
-   Node.js 20+ (for local FE development)
-   Python 3.11+ with `uv` (for local BE development)

### One-Command Setup (Docker)
```bash
docker compose up --build
```
-   **Frontend**: http://localhost:8080
-   **Backend Docs**: http://localhost:8000/docs

## 🧪 Testing

### Frontend Tests (Vitest)
```bash
cd frontend
npm run test
```
Tests cover core logic in the API service layer.

### Backend Tests (Pytest)
```bash
cd backend
$env:PYTHONPATH="."
# Unit tests
python -m uv run pytest test_main.py
# Integration tests (with SQLite)
python -m uv run pytest tests_integration/test_workflow.py
```

## ☁️ Deployment & CI/CD

The application is configured for a **Unified Build** (single container) for cloud platforms like Render.

-   **Pipeline**: Every push to `main` triggers:
    1.  Frontend Linting & Tests.
    2.  Backend Unit & Integration Tests.
    3.  Automated Deployment to Render (if tests pass).
-   **Proof of Deployment**: Refer to [DEPLOYMENT.md](file:///c:/Users/amfua/Documents/GitHub/run_ai/run-with-ai/DEPLOYMENT.md) for configuration details.

## 📜 API Contract
The full API specification can be found in [openapi.yaml](file:///c:/Users/amfua/Documents/GitHub/run_ai/run-with-ai/openapi.yaml). This contract drives both the Pydantic models in the backend and the TypeScript interfaces in the frontend.

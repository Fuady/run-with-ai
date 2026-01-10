For backend development, use `uv` for dependency management.

Useful Commands

    # Sync dependencies from lockfile
    uv sync

    # Add a new package
    uv add <PACKAGE-NAME>

    # Run Python files
    uv run python <PYTHON-FILE>

Deployment

For unified deployment (both frontend and backend), use the Dockerfile in the root. 
The backend is configured to serve static files from `frontend/dist`.
Refer to [DEPLOYMENT.md](file:///c:/Users/amfua/Documents/GitHub/run_ai/run-with-ai/DEPLOYMENT.md) for more details.

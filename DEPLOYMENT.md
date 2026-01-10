# Deployment to Render

To deploy this application to Render as a single container:

1.  **Connect your GitHub Repository** to Render.
2.  **Create a New Web Service**:
    - Build Filter: `Dockerfile` (Render should detect this automatically).
    - Environment Variables:
        - `DATABASE_URL`: Your PostgreSQL connection string (Render provides this if you create a Render Postgres).
3.  **Unified Build**: The `Dockerfile` in the root handle building the frontend (React/Vite) and setting up the backend (FastAPI/uv).
4.  **Static Files**: The backend is configured to serve the frontend static files from the `frontend/dist` directory.

### Local Unified Test

You can test the production build locally using Docker:

```bash
docker build -t run-ai-unified .
docker run -p 8000:8000 -e DATABASE_URL=sqlite+aiosqlite:///./test.db run-ai-unified
```

Then visit `http://localhost:8000`.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/ci-cd.yml`.

### Workflow Steps
1.  **Frontend Tests**: Lints and builds the React application.
2.  **Backend Tests**: Runs unit tests (`test_main.py`) and integration tests (`tests_integration/test_workflow.py`) using `uv`.
3.  **Deployment**: If all tests pass and changes are pushed to `main`, the app is automatically deployed to Render.

### Configuration
To enable automatic deployment, you must add the following secrets to your GitHub repository settings:
- `RENDER_SERVICE_ID`: The unique ID of your Render service.
- `RENDER_API_KEY`: Your Render API Key (found in Account Settings).

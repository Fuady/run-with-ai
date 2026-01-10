import pytest
from httpx import AsyncClient
from main import app
from database import get_db
from models_db import Base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import asyncio

TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_main.db"
engine_test = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = async_sessionmaker(bind=engine_test, class_=AsyncSession, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
async def setup_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_register(client):
    response = await client.post("/api/auth/register", json={"email": "new@example.com", "password": "password", "name": "New Runner"})
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "new@example.com"

@pytest.mark.asyncio
async def test_get_workouts(client):
    response = await client.get("/api/workouts")
    assert response.status_code == 200
    # Startup event seeds 2 workouts
    assert len(response.json()) == 2

@pytest.mark.asyncio
async def test_get_nutrition_tips(client):
    response = await client.get("/api/nutrition-tips")
    assert response.status_code == 200
    # Startup event seeds 2 tips
    assert len(response.json()) == 2

@pytest.mark.asyncio
async def test_get_coach_message(client):
    response = await client.get("/api/coach/message")
    assert response.status_code == 200
    assert "content" in response.json()

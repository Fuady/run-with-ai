import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_login():
    response = client.post("/api/auth/login", json={"email": "runner@example.com", "password": "password"})
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "runner@example.com"
    assert "token" in response.json()

def test_register():
    response = client.post("/api/auth/register", json={"email": "new@example.com", "password": "password", "name": "New Runner"})
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "new@example.com"

def test_get_profile():
    response = client.get("/api/profile/user-123")
    assert response.status_code == 200
    assert response.json()["name"] == "John Doe"

def test_get_workouts():
    response = client.get("/api/workouts")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_get_nutrition_tips():
    response = client.get("/api/nutrition-tips")
    assert response.status_code == 200
    assert len(response.json()) > 0

def test_generate_plan():
    response = client.post("/api/training-plans/generate", json={"userId": "user-123", "goal": "5K"})
    assert response.status_code == 200
    assert response.json()["goal"] == "5K"

def test_get_coach_message():
    response = client.get("/api/coach/message")
    assert response.status_code == 200
    assert "content" in response.json()

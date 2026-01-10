import pytest

@pytest.mark.asyncio
async def test_full_user_workflow(client):
    # 1. Register
    reg_response = await client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "password123",
        "name": "Test User"
    })
    assert reg_response.status_code == 200
    user_data = reg_response.json()["user"]
    user_id = user_data["id"]
    assert user_data["email"] == "test@example.com"
    
    # 2. Login
    login_response = await client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert login_response.status_code == 200
    assert login_response.json()["user"]["id"] == user_id
    
    # 3. Update Profile
    profile_update = {
        "age": 25,
        "height": 180,
        "weight": 75,
        "experienceLevel": "intermediate",
        "weeklyMileage": 20,
        "availableTrainingDays": [0, 2, 4],
        "prs": {"5K": 1200}
    }
    update_response = await client.patch(f"/api/profile/{user_id}", json=profile_update)
    assert update_response.status_code == 200
    assert update_response.json()["profile"]["age"] == 25
    
    # 4. Log Stress
    stress_data = {
        "userId": user_id,
        "date": "2026-01-11",
        "level": 4,
        "sleepQuality": 3,
        "notes": "Feeling tired"
    }
    stress_response = await client.post("/api/stress", json=stress_data)
    assert stress_response.status_code == 200
    assert stress_response.json()["level"] == 4
    
    # 5. Generate Plan
    plan_response = await client.post("/api/training-plans/generate", json={
        "userId": user_id,
        "goal": "Marathon"
    })
    assert plan_response.status_code == 200
    assert plan_response.json()["goal"] == "Marathon"
    
    # 6. Get Nutrition Tips
    tips_response = await client.get("/api/nutrition-tips")
    assert tips_response.status_code == 200
    assert len(tips_response.json()) > 0

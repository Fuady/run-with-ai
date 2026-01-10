from fastapi import FastAPI, HTTPException, Body
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import random

from models import (
    User, UserProfile, AuthResponse, StressEntry, TrainingPlan, 
    Workout, Challenge, LeaderboardEntry, NutritionTip, 
    StrengthRoutine, CoachMessage
)
from database import db

app = FastAPI(title="RunAI API")

# Auth
@app.post("/api/auth/login", response_model=AuthResponse)
async def login(email: str = Body(..., embed=True), password: str = Body(..., embed=True)):
    user = next((u for u in db.users.values() if u.email == email), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return AuthResponse(user=user, token="mock-jwt-token")

@app.post("/api/auth/register", response_model=AuthResponse)
async def register(email: str = Body(...), password: str = Body(...), name: str = Body(...)):
    new_id = f"user-{uuid.uuid4()}"
    new_user = User(
        id=new_id, email=email, name=name,
        profile=UserProfile(
            age=30, height=175, weight=70, experienceLevel="beginner",
            weeklyMileage=0, availableTrainingDays=[1, 3, 5], prs={}
        ),
        subscription="free", createdAt=datetime.now().isoformat()
    )
    db.users[new_id] = new_user
    return AuthResponse(user=new_user, token="mock-jwt-token")

# Profile
@app.get("/api/profile/{userId}", response_model=User)
async def get_profile(userId: str):
    if userId not in db.users:
        raise HTTPException(status_code=404, detail="User not found")
    return db.users[userId]

@app.patch("/api/profile/{userId}", response_model=User)
async def update_profile(userId: str, profile: UserProfile):
    if userId not in db.users:
        raise HTTPException(status_code=404, detail="User not found")
    db.users[userId].profile = profile
    return db.users[userId]

@app.post("/api/profile/{userId}/onboarding", response_model=User)
async def complete_onboarding(userId: str, profile: UserProfile):
    if userId not in db.users:
        raise HTTPException(status_code=404, detail="User not found")
    db.users[userId].profile = profile
    return db.users[userId]

# Stress
@app.post("/api/stress", response_model=StressEntry)
async def log_stress(entry: StressEntry):
    entry.id = f"stress-{uuid.uuid4()}"
    db.stress_entries.append(entry)
    return entry

@app.get("/api/stress/history/{userId}", response_model=List[StressEntry])
async def get_stress_history(userId: str, days: int = 7):
    # Mock history for simplicity
    history = []
    for i in range(days):
        history.append(StressEntry(
            id=f"s-{i}", userId=userId, 
            date=(datetime.now() - timedelta(days=i)).date().isoformat(),
            level=random.randint(1, 5),
            sleepQuality=random.randint(1, 5)
        ))
    return history

# Plans & Workouts
@app.get("/api/training-plans/{userId}", response_model=Optional[TrainingPlan])
async def get_training_plan(userId: str):
    return db.training_plans.get(userId)

@app.post("/api/training-plans/generate", response_model=TrainingPlan)
async def generate_plan(userId: str = Body(...), goal: str = Body(...)):
    plan_id = f"plan-{uuid.uuid4()}"
    plan = TrainingPlan(
        id=plan_id, userId=userId, name=f"{goal} Plan", goal=goal,
        startDate=datetime.now().date().isoformat(),
        endDate=(datetime.now() + timedelta(weeks=12)).date().isoformat(),
        weeks=[
            {"weekNumber": 1, "focus": "Base Building", "workouts": [], "totalMileage": 20}
        ]
    )
    db.training_plans[userId] = plan
    return plan

@app.get("/api/workouts/today/{userId}", response_model=Optional[Workout])
async def get_today_workout(userId: str):
    if not db.workouts:
        return None
    return random.choice(db.workouts)

@app.post("/api/workouts/{workoutId}/complete", response_model=Workout)
async def complete_workout(workoutId: str, data: dict = Body(...)):
    workout = next((w for w in db.workouts if w.id == workoutId), None)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    workout.completed = True
    workout.completedAt = datetime.now().isoformat()
    workout.actualDistance = data.get("distance")
    workout.actualDuration = data.get("duration")
    return workout

@app.get("/api/workouts", response_model=List[Workout])
async def get_workouts():
    return db.workouts

@app.get("/api/strength-routines", response_model=List[StrengthRoutine])
async def get_strength_routines():
    return db.strength_routines

@app.get("/api/nutrition-tips", response_model=List[NutritionTip])
async def get_nutrition_tips(category: Optional[str] = None):
    if category:
        return [t for t in db.nutrition_tips if t.category == category]
    return db.nutrition_tips

@app.get("/api/challenges", response_model=List[Challenge])
async def get_challenges():
    return db.challenges

@app.post("/api/challenges/{challengeId}/join", response_model=Challenge)
async def join_challenge(challengeId: str, userId: str = Body(..., embed=True)):
    challenge = next((c for c in db.challenges if c.id == challengeId), None)
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    challenge.participants += 1
    challenge.userProgress = 0
    return challenge

@app.get("/api/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(type: str = "weekly"):
    return db.leaderboard

@app.get("/api/coach/message", response_model=CoachMessage)
async def get_coach_message(workoutCompleted: bool = False, stressLevel: int = 3):
    messages = [
        {"type": "motivation", "content": "You're doing great! Keep it up."},
        {"type": "tip", "content": "Focus on your breathing during intervals."},
        {"type": "warning", "content": "High stress detected. Take it easy today."}
    ]
    msg = random.choice(messages)
    return CoachMessage(
        id=str(uuid.uuid4()), type=msg["type"], content=msg["content"],
        createdAt=datetime.now().isoformat()
    )

@app.get("/api/progress/stats/{userId}")
async def get_progress_stats(userId: str):
    return {
        "weeklyMileage": 32.5,
        "monthlyMileage": 128.3,
        "totalRuns": 47,
        "averagePace": "5:45/km",
        "streak": 12,
        "weeklyData": [
            {"day": "Mon", "distance": 5.2},
            {"day": "Tue", "distance": 0},
            {"day": "Wed", "distance": 8.1},
            {"day": "Thu", "distance": 4.5},
            {"day": "Fri", "distance": 0},
            {"day": "Sat", "distance": 12.5},
            {"day": "Sun", "distance": 6.2}
        ]
    }

@app.post("/api/subscription/upgrade", response_model=User)
async def upgrade_subscription(userId: str = Body(..., embed=True)):
    if userId not in db.users:
        raise HTTPException(status_code=404, detail="User not found")
    db.users[userId].subscription = "premium"
    return db.users[userId]

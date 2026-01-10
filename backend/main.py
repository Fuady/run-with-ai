from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import random

from models import (
    User as PydanticUser, UserProfile as PydanticUserProfile, 
    AuthResponse, StressEntry as PydanticStressEntry, 
    TrainingPlan as PydanticTrainingPlan, Workout as PydanticWorkout, 
    Challenge as PydanticChallenge, LeaderboardEntry as PydanticLeaderboardEntry, 
    NutritionTip as PydanticNutritionTip, StrengthRoutine as PydanticStrengthRoutine, 
    CoachMessage
)
from models_db import Base, DBUser, DBUserProfile, DBStressEntry, DBWorkout, DBTrainingPlan, DBChallenge, DBNutritionTip, DBStrengthRoutine
from database import engine, get_db

app = FastAPI(title="RunAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(Base.metadata.create_all)
    
    # Optional: Seed initial data if needed
    async with AsyncSession(engine) as session:
        result = await session.execute(select(DBNutritionTip).limit(1))
        if not result.scalars().first():
            # Seed some data
            tips = [
                DBNutritionTip(category="pre-run", title="Carb Loading", content="Eat complex carbs 2-3 hours before."),
                DBNutritionTip(category="hydration", title="Water Intake", content="Drink 500ml before starting.")
            ]
            workouts = [
                DBWorkout(type="easy", title="Recovery Run", description="Keep it light", duration=30, distance=5.0),
                DBWorkout(type="tempo", title="Threshold Session", description="20 mins at tempo", duration=45, distance=8.0)
            ]
            session.add_all(tips + workouts)
            await session.commit()

# Helper to convert DB model to Pydantic
def user_db_to_pydantic(db_user: DBUser) -> PydanticUser:
    profile = db_user.profile
    p_profile = PydanticUserProfile(
        age=profile.age,
        height=profile.height,
        weight=profile.weight,
        experienceLevel=profile.experienceLevel,
        weeklyMileage=profile.weeklyMileage,
        availableTrainingDays=profile.availableTrainingDays,
        injuryHistory=profile.injuryHistory,
        prs=profile.prs or {},
        raceGoal=profile.raceGoal
    )
    return PydanticUser(
        id=db_user.id,
        email=db_user.email,
        name=db_user.name,
        avatar=db_user.avatar,
        profile=p_profile,
        subscription=db_user.subscription,
        createdAt=db_user.createdAt.isoformat()
    )

# Auth
@app.post("/api/auth/login", response_model=AuthResponse)
async def login(email: str = Body(..., embed=True), password: str = Body(..., embed=True), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.email == email))
    user = result.scalars().first()
    if not user:
        # For mock purposes, if user doesn't exist but password is provided, we could auto-register
        # But let's stick to simple logic for now
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Load profile explicitly if needed (or use join in query)
    # Since we are using relationship, it might be lazy-loaded, which is fine in some cases but async needs care
    result = await db.execute(select(DBUser).where(DBUser.id == user.id).outerjoin(DBUser.profile))
    user = result.scalars().first()
    
    return AuthResponse(user=user_db_to_pydantic(user), token="mock-jwt-token")

@app.post("/api/auth/register", response_model=AuthResponse)
async def register(email: str = Body(...), password: str = Body(...), name: str = Body(...), db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(DBUser).where(DBUser.email == email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_id = f"user-{uuid.uuid4()}"
    new_user = DBUser(
        id=new_id, email=email, name=name,
        subscription="free"
    )
    new_profile = DBUserProfile(
        userId=new_id, age=30, height=175, weight=70, experienceLevel="beginner",
        weeklyMileage=0, availableTrainingDays=[1, 3, 5], prs={}
    )
    db.add(new_user)
    db.add(new_profile)
    await db.commit()
    await db.refresh(new_user)
    
    # Re-fetch with profile
    result = await db.execute(select(DBUser).where(DBUser.id == new_id).outerjoin(DBUser.profile))
    new_user = result.scalars().first()
    
    return AuthResponse(user=user_db_to_pydantic(new_user), token="mock-jwt-token")

# Profile
@app.get("/api/profile/{userId}", response_model=PydanticUser)
async def get_profile(userId: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.id == userId).outerjoin(DBUser.profile))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_db_to_pydantic(user)

@app.patch("/api/profile/{userId}", response_model=PydanticUser)
async def update_profile(userId: str, profile: PydanticUserProfile, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUserProfile).where(DBUserProfile.userId == userId))
    db_profile = result.scalars().first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    for var, value in profile.dict().items():
        setattr(db_profile, var, value)
    
    await db.commit()
    
    result = await db.execute(select(DBUser).where(DBUser.id == userId).outerjoin(DBUser.profile))
    user = result.scalars().first()
    return user_db_to_pydantic(user)

@app.post("/api/profile/{userId}/onboarding", response_model=PydanticUser)
async def complete_onboarding(userId: str, profile: PydanticUserProfile, db: AsyncSession = Depends(get_db)):
    return await update_profile(userId, profile, db)

# Stress
@app.post("/api/stress", response_model=PydanticStressEntry)
async def log_stress(entry: PydanticStressEntry, db: AsyncSession = Depends(get_db)):
    db_entry = DBStressEntry(
        userId=entry.userId,
        date=entry.date,
        level=entry.level,
        sleepQuality=entry.sleepQuality,
        notes=entry.notes
    )
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    return PydanticStressEntry(
        id=db_entry.id, userId=db_entry.userId, date=db_entry.date,
        level=db_entry.level, sleepQuality=db_entry.sleepQuality, notes=db_entry.notes
    )

@app.get("/api/stress/history/{userId}", response_model=List[PydanticStressEntry])
async def get_stress_history(userId: str, days: int = 7, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBStressEntry).where(DBStressEntry.userId == userId).limit(days))
    db_entries = result.scalars().all()
    
    # If no entries, generate some mock ones as requested before
    if not db_entries:
        history = []
        for i in range(days):
            history.append(PydanticStressEntry(
                id=f"s-{i}", userId=userId, 
                date=(datetime.now() - timedelta(days=i)).date().isoformat(),
                level=random.randint(1, 5),
                sleepQuality=random.randint(1, 5)
            ))
        return history
        
    return [PydanticStressEntry(id=e.id, userId=e.userId, date=e.date, level=e.level, sleepQuality=e.sleepQuality, notes=e.notes) for e in db_entries]

# Plans & Workouts
@app.get("/api/training-plans/{userId}", response_model=Optional[PydanticTrainingPlan])
async def get_training_plan(userId: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBTrainingPlan).where(DBTrainingPlan.userId == userId))
    p = result.scalars().first()
    if not p:
        return None
    return PydanticTrainingPlan(
        id=p.id, userId=p.userId, name=p.name, goal=p.goal,
        startDate=p.startDate, endDate=p.endDate, weeks=p.weeks
    )

@app.post("/api/training-plans/generate", response_model=PydanticTrainingPlan)
async def generate_plan(userId: str = Body(...), goal: str = Body(...), db: AsyncSession = Depends(get_db)):
    plan_id = str(uuid.uuid4())
    db_plan = DBTrainingPlan(
        id=plan_id, userId=userId, name=f"{goal} Plan", goal=goal,
        startDate=datetime.now().date().isoformat(),
        endDate=(datetime.now() + timedelta(weeks=12)).date().isoformat(),
        weeks=[
            {"weekNumber": 1, "focus": "Base Building", "workouts": [], "totalMileage": 20}
        ]
    )
    db.add(db_plan)
    await db.commit()
    return PydanticTrainingPlan(
        id=db_plan.id, userId=db_plan.userId, name=db_plan.name, goal=db_plan.goal,
        startDate=db_plan.startDate, endDate=db_plan.endDate, weeks=db_plan.weeks
    )

@app.get("/api/workouts/today/{userId}", response_model=Optional[PydanticWorkout])
async def get_today_workout(userId: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBWorkout))
    workouts = result.scalars().all()
    if not workouts:
        return None
    w = random.choice(workouts)
    return PydanticWorkout(
        id=w.id, type=w.type, title=w.title, description=w.description,
        duration=w.duration, distance=w.distance, targetPace=w.targetPace,
        intervals=w.intervals, completed=w.completed, completedAt=w.completedAt.isoformat() if w.completedAt else None,
        actualDistance=w.actualDistance, actualDuration=w.actualDuration
    )

@app.post("/api/workouts/{workoutId}/complete", response_model=PydanticWorkout)
async def complete_workout(workoutId: str, data: dict = Body(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBWorkout).where(DBWorkout.id == workoutId))
    w = result.scalars().first()
    if not w:
        raise HTTPException(status_code=404, detail="Workout not found")
    w.completed = True
    w.completedAt = datetime.utcnow()
    w.actualDistance = data.get("distance")
    w.actualDuration = data.get("duration")
    await db.commit()
    await db.refresh(w)
    return PydanticWorkout(
        id=w.id, type=w.type, title=w.title, description=w.description,
        duration=w.duration, distance=w.distance, targetPace=w.targetPace,
        intervals=w.intervals, completed=w.completed, completedAt=w.completedAt.isoformat() if w.completedAt else None,
        actualDistance=w.actualDistance, actualDuration=w.actualDuration
    )

@app.get("/api/workouts", response_model=List[PydanticWorkout])
async def get_workouts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBWorkout))
    db_ws = result.scalars().all()
    return [PydanticWorkout(
        id=w.id, type=w.type, title=w.title, description=w.description,
        duration=w.duration, distance=w.distance, targetPace=w.targetPace,
        intervals=w.intervals, completed=w.completed, completedAt=w.completedAt.isoformat() if w.completedAt else None,
        actualDistance=w.actualDistance, actualDuration=w.actualDuration
    ) for w in db_ws]

@app.get("/api/strength-routines", response_model=List[PydanticStrengthRoutine])
async def get_strength_routines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBStrengthRoutine))
    db_sr = result.scalars().all()
    return [PydanticStrengthRoutine(
        id=w.id, name=w.name, duration=w.duration, difficulty=w.difficulty,
        exercises=w.exercises, targetAreas=w.targetAreas
    ) for w in db_sr]

@app.get("/api/nutrition-tips", response_model=List[PydanticNutritionTip])
async def get_nutrition_tips(category: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    if category:
        result = await db.execute(select(DBNutritionTip).where(DBNutritionTip.category == category))
    else:
        result = await db.execute(select(DBNutritionTip))
    db_tips = result.scalars().all()
    return [PydanticNutritionTip(id=t.id, category=t.category, title=t.title, content=t.content, timing=t.timing) for t in db_tips]

@app.get("/api/challenges", response_model=List[PydanticChallenge])
async def get_challenges(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBChallenge))
    db_cs = result.scalars().all()
    return [PydanticChallenge(
        id=c.id, title=c.title, description=c.description, type=c.type,
        target=c.target, unit=c.unit, startDate=c.startDate, endDate=c.endDate,
        participants=c.participants, userProgress=0
    ) for c in db_cs]

@app.get("/api/leaderboard", response_model=List[PydanticLeaderboardEntry])
async def get_leaderboard(type: str = "weekly"):
    # Keeping this mocked for now as it's more complex to implement fully
    return [
        PydanticLeaderboardEntry(rank=1, userId="u1", userName="Alice", value=120, unit="km"),
        PydanticLeaderboardEntry(rank=2, userId="u2", userName="Bob", value=115, unit="km")
    ]

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

@app.post("/api/subscription/upgrade", response_model=PydanticUser)
async def upgrade_subscription(userId: str = Body(..., embed=True), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).where(DBUser.id == userId))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.subscription = "premium"
    await db.commit()
    
    result = await db.execute(select(DBUser).where(DBUser.id == userId).outerjoin(DBUser.profile))
    user = result.scalars().first()
    return user_db_to_pydantic(user)

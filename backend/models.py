from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal, Any
from datetime import datetime

class UserProfile(BaseModel):
    age: int
    height: float
    weight: float
    experienceLevel: Literal['beginner', 'intermediate', 'advanced']
    weeklyMileage: float
    availableTrainingDays: List[int]
    injuryHistory: Optional[str] = None
    prs: Dict[str, float] = {}
    raceGoal: Optional[Dict[str, Any]] = None

class User(BaseModel):
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    profile: UserProfile
    subscription: Literal['free', 'premium']
    createdAt: str

class AuthResponse(BaseModel):
    user: User
    token: str

class StressEntry(BaseModel):
    id: str
    userId: str
    date: str
    level: int = Field(ge=1, le=5)
    sleepQuality: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None

class Workout(BaseModel):
    id: str
    type: Literal['easy', 'tempo', 'interval', 'long', 'recovery', 'race']
    title: str
    description: str
    duration: float
    distance: Optional[float] = None
    targetPace: Optional[str] = None
    intervals: Optional[List[Dict[str, Any]]] = None
    completed: bool = False
    completedAt: Optional[str] = None
    actualDistance: Optional[float] = None
    actualDuration: Optional[float] = None

class TrainingWeek(BaseModel):
    weekNumber: int
    focus: str
    workouts: List[Dict[str, Any]]
    totalMileage: float

class TrainingPlan(BaseModel):
    id: str
    userId: str
    name: str
    goal: Literal['5K', '10K', 'Half Marathon', 'Marathon']
    startDate: str
    endDate: str
    weeks: List[TrainingWeek]

class Challenge(BaseModel):
    id: str
    title: str
    description: str
    type: Literal['distance', 'streak', 'time']
    target: float
    unit: str
    startDate: str
    endDate: str
    participants: int
    userProgress: Optional[float] = 0

class LeaderboardEntry(BaseModel):
    rank: int
    userId: str
    userName: str
    avatar: Optional[str] = None
    value: float
    unit: str

class NutritionTip(BaseModel):
    id: str
    category: Literal['pre-run', 'post-run', 'race-day', 'hydration']
    title: str
    content: str
    timing: Optional[str] = None

class StrengthRoutine(BaseModel):
    id: str
    name: str
    duration: float
    difficulty: Literal['easy', 'medium', 'hard']
    exercises: List[Dict[str, Any]]
    targetAreas: List[str]

class CoachMessage(BaseModel):
    id: str
    type: Literal['motivation', 'tip', 'feedback', 'warning']
    content: str
    createdAt: str

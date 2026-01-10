from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, JSON, DateTime, Date
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class DBUser(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    avatar = Column(String, nullable=True)
    subscription = Column(String, default="free") # 'free' | 'premium'
    createdAt = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("DBUserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    stress_entries = relationship("DBStressEntry", back_populates="user", cascade="all, delete-orphan")
    training_plans = relationship("DBTrainingPlan", back_populates="user", cascade="all, delete-orphan")

class DBUserProfile(Base):
    __tablename__ = "user_profiles"
    userId = Column(String, ForeignKey("users.id"), primary_key=True)
    age = Column(Integer)
    height = Column(Float)
    weight = Column(Float)
    experienceLevel = Column(String) # 'beginner' | 'intermediate' | 'advanced'
    weeklyMileage = Column(Float)
    availableTrainingDays = Column(JSON) # List[int]
    injuryHistory = Column(String, nullable=True)
    prs = Column(JSON) # Dict[str, float]
    raceGoal = Column(JSON, nullable=True) # Dict[str, Any]
    
    user = relationship("DBUser", back_populates="profile")

class DBStressEntry(Base) :
    __tablename__ = "stress_entries"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey("users.id"))
    date = Column(String) # Date string
    level = Column(Integer) # 1-5
    sleepQuality = Column(Integer, nullable=True) # 1-5
    notes = Column(String, nullable=True)
    
    user = relationship("DBUser", back_populates="stress_entries")

class DBWorkout(Base):
    __tablename__ = "workouts"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String) # 'easy' | 'tempo' | ...
    title = Column(String)
    description = Column(String)
    duration = Column(Float)
    distance = Column(Float, nullable=True)
    targetPace = Column(String, nullable=True)
    intervals = Column(JSON, nullable=True)
    completed = Column(Boolean, default=False)
    completedAt = Column(DateTime, nullable=True)
    actualDistance = Column(Float, nullable=True)
    actualDuration = Column(Float, nullable=True)

class DBTrainingPlan(Base):
    __tablename__ = "training_plans"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    userId = Column(String, ForeignKey("users.id"))
    name = Column(String)
    goal = Column(String) # '5K' | '10K' | ...
    startDate = Column(String)
    endDate = Column(String)
    weeks = Column(JSON) # List[Dict]
    
    user = relationship("DBUser", back_populates="training_plans")

class DBChallenge(Base):
    __tablename__ = "challenges"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String)
    description = Column(String)
    type = Column(String) # 'distance' | 'streak' | 'time'
    target = Column(Float)
    unit = Column(String)
    startDate = Column(String)
    endDate = Column(String)
    participants = Column(Integer, default=0)

class DBNutritionTip(Base):
    __tablename__ = "nutrition_tips"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    category = Column(String) # 'pre-run' | ...
    title = Column(String)
    content = Column(String)
    timing = Column(String, nullable=True)

class DBStrengthRoutine(Base):
    __tablename__ = "strength_routines"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String)
    duration = Column(Float)
    difficulty = Column(String) # 'easy' | 'medium' | 'hard'
    exercises = Column(JSON)
    targetAreas = Column(JSON)

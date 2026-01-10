from datetime import datetime, timedelta
import random
from models import User, UserProfile, TrainingPlan, Workout, Challenge, LeaderboardEntry, NutritionTip, StrengthRoutine, StressEntry

class MockDatabase:
    def __init__(self):
        self.users = {}
        self.stress_entries = []
        self.training_plans = {}
        self.workouts = []
        self.challenges = []
        self.leaderboard = []
        self.nutrition_tips = []
        self.strength_routines = []
        self._seed_data()

    def _seed_data(self):
        # Seed a default user
        default_profile = UserProfile(
            age=30, height=175.0, weight=70.0,
            experienceLevel='intermediate', weeklyMileage=30.0,
            availableTrainingDays=[1, 3, 5, 6],
            prs={'5K': 1320, '10K': 2800}
        )
        self.users["user-123"] = User(
            id="user-123", email="runner@example.com", name="John Doe",
            profile=default_profile, subscription="free",
            createdAt=datetime.now().isoformat()
        )

        # Seed some workouts
        self.workouts = [
            Workout(id="w1", type="easy", title="Recovery Run", description="Keep it light", duration=30, distance=5.0),
            Workout(id="w2", type="tempo", title="Threshold Session", description="20 mins at tempo", duration=45, distance=8.0),
            Workout(id="w3", type="long", title="Sunday Long Run", description="90 mins easy", duration=90, distance=15.0)
        ]

        # Seed nutrition tips
        self.nutrition_tips = [
            NutritionTip(id="n1", category="pre-run", title="Carb Loading", content="Eat complex carbs 2-3 hours before."),
            NutritionTip(id="n2", category="hydration", title="Water Intake", content="Drink 500ml before starting.")
        ]

        # Seed strength routines
        self.strength_routines = [
            StrengthRoutine(
                id="s1", name="Core Stability", duration=20, difficulty="medium",
                exercises=[{"name": "Plank", "reps": 1, "sets": 3, "description": "Hold for 60s"}],
                targetAreas=["Core", "Abs"]
            )
        ]

        # Seed challenges
        self.challenges = [
            Challenge(
                id="c1", title="May 50K", description="Run 50km in May",
                type="distance", target=50, unit="km",
                startDate="2026-05-01", endDate="2026-05-31",
                participants=1240
            )
        ]

        # Seed leaderboard
        self.leaderboard = [
            LeaderboardEntry(rank=1, userId="u1", userName="Alice", value=120, unit="km"),
            LeaderboardEntry(rank=2, userId="u2", userName="Bob", value=115, unit="km")
        ]

db = MockDatabase()

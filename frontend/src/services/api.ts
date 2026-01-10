// Centralized API service layer
// All backend calls are now implemented using fetch

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  profile: UserProfile;
  subscription: 'free' | 'premium';
  createdAt: string;
}

export interface UserProfile {
  age: number;
  height: number; // cm
  weight: number; // kg
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyMileage: number;
  availableTrainingDays: number[];
  injuryHistory?: string;
  prs: {
    fiveK?: number; // seconds
    tenK?: number;
    halfMarathon?: number;
    marathon?: number;
  };
  raceGoal?: {
    distance: '5K' | '10K' | 'Half Marathon' | 'Marathon';
    targetDate: string;
    targetTime?: number; // seconds
  };
}

export interface StressEntry {
  id: string;
  userId: string;
  date: string;
  level: 1 | 2 | 3 | 4 | 5;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export interface Workout {
  id: string;
  type: 'easy' | 'tempo' | 'interval' | 'long' | 'recovery' | 'race';
  title: string;
  description: string;
  duration: number; // minutes
  distance?: number; // km
  targetPace?: string;
  intervals?: { distance: number; pace: string; rest: string }[];
  completed?: boolean;
  completedAt?: string;
  actualDistance?: number;
  actualDuration?: number;
}

export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  goal: '5K' | '10K' | 'Half Marathon' | 'Marathon';
  startDate: string;
  endDate: string;
  weeks: TrainingWeek[];
}

export interface TrainingWeek {
  weekNumber: number;
  focus: string;
  workouts: { dayOfWeek: number; workout: Workout }[];
  totalMileage: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'distance' | 'streak' | 'time';
  target: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: number;
  userProgress?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  value: number;
  unit: string;
}

export interface NutritionTip {
  id: string;
  category: 'pre-run' | 'post-run' | 'race-day' | 'hydration';
  title: string;
  content: string;
  timing?: string;
}

export interface StrengthRoutine {
  id: string;
  name: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  exercises: { name: string; reps: number; sets: number; description: string }[];
  targetAreas: string[];
}

export interface CoachMessage {
  id: string;
  type: 'motivation' | 'tip' | 'feedback' | 'warning';
  content: string;
  createdAt: string;
}

// API Client
class ApiClient {
  private baseUrl = '/api';

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || 'An error occurred');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; name: string }): Promise<{ user: User; token: string }> {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    // Session is handled client-side in this mock/initial setup
    return;
  }

  // User Profile
  async getProfile(userId: string): Promise<User> {
    return this.request<User>(`/profile/${userId}`);
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<User> {
    return this.request<User>(`/profile/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async completeOnboarding(userId: string, data: UserProfile): Promise<User> {
    return this.request<User>(`/profile/${userId}/onboarding`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Stress & Readiness
  async logStress(data: Omit<StressEntry, 'id'>): Promise<StressEntry> {
    return this.request<StressEntry>('/stress', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStressHistory(userId: string, days: number = 7): Promise<StressEntry[]> {
    return this.request<StressEntry[]>(`/stress/history/${userId}?days=${days}`);
  }

  // Training Plans
  async getTrainingPlan(userId: string): Promise<TrainingPlan | null> {
    return this.request<TrainingPlan | null>(`/training-plans/${userId}`);
  }

  async generateTrainingPlan(userId: string, goal: '5K' | '10K' | 'Half Marathon' | 'Marathon'): Promise<TrainingPlan> {
    return this.request<TrainingPlan>('/training-plans/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, goal }),
    });
  }

  async adjustPlanForStress(planId: string, stressLevel: number): Promise<TrainingPlan> {
    return this.request<TrainingPlan>(`/training-plans/${planId}/adjust`, {
      method: 'PATCH',
      body: JSON.stringify({ stressLevel }),
    });
  }

  // Workouts
  async getTodayWorkout(userId: string): Promise<Workout | null> {
    return this.request<Workout | null>(`/workouts/today/${userId}`);
  }

  async completeWorkout(workoutId: string, data: { distance: number; duration: number }): Promise<Workout> {
    return this.request<Workout>(`/workouts/${workoutId}/complete`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkoutLibrary(): Promise<Workout[]> {
    return this.request<Workout[]>('/workouts');
  }

  // Strength Routines
  async getStrengthRoutines(): Promise<StrengthRoutine[]> {
    return this.request<StrengthRoutine[]>('/strength-routines');
  }

  // Nutrition
  async getNutritionTips(category?: string): Promise<NutritionTip[]> {
    const url = category ? `/nutrition-tips?category=${category}` : '/nutrition-tips';
    return this.request<NutritionTip[]>(url);
  }

  // Community
  async getChallenges(): Promise<Challenge[]> {
    return this.request<Challenge[]>('/challenges');
  }

  async joinChallenge(challengeId: string, userId: string): Promise<Challenge> {
    return this.request<Challenge>(`/challenges/${challengeId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getLeaderboard(type: 'weekly' | 'monthly' | 'allTime'): Promise<LeaderboardEntry[]> {
    return this.request<LeaderboardEntry[]>(`/leaderboard?type=${type}`);
  }

  // AI Coach
  async getCoachMessage(context: { workoutCompleted?: boolean; stressLevel?: number }): Promise<CoachMessage> {
    const params = new URLSearchParams();
    if (context.workoutCompleted !== undefined) params.append('workoutCompleted', context.workoutCompleted.toString());
    if (context.stressLevel !== undefined) params.append('stressLevel', context.stressLevel.toString());
    return this.request<CoachMessage>(`/coach/message?${params.toString()}`);
  }

  // Progress & Analytics
  async getProgressStats(userId: string): Promise<{
    weeklyMileage: number;
    monthlyMileage: number;
    totalRuns: number;
    averagePace: string;
    streak: number;
    weeklyData: { day: string; distance: number }[];
  }> {
    return this.request<any>(`/progress/stats/${userId}`);
  }

  // Subscription
  async upgradeToPremium(userId: string): Promise<User> {
    return this.request<User>('/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }
}

export const api = new ApiClient();

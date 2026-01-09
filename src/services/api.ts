// Centralized API service layer with mock data
// All backend calls are mocked until real backend is implemented

import { mockUsers, mockTrainingPlans, mockWorkouts, mockChallenges, mockLeaderboard, mockNutritionTips, mockStrengthRoutines } from './mockData';

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

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Client
class ApiClient {
  private baseUrl = '/api'; // Will be replaced with actual backend URL

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(500);
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    return { user, token: 'mock-jwt-token' };
  }

  async register(data: { email: string; password: string; name: string }): Promise<{ user: User; token: string }> {
    await delay(500);
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      profile: {
        age: 30,
        height: 175,
        weight: 70,
        experienceLevel: 'beginner',
        weeklyMileage: 0,
        availableTrainingDays: [1, 3, 5],
        prs: {},
      },
      subscription: 'free',
      createdAt: new Date().toISOString(),
    };
    return { user: newUser, token: 'mock-jwt-token' };
  }

  async logout(): Promise<void> {
    await delay(200);
  }

  // User Profile
  async getProfile(userId: string): Promise<User> {
    await delay(300);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<User> {
    await delay(400);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return { ...user, profile: { ...user.profile, ...data } };
  }

  async completeOnboarding(userId: string, data: UserProfile): Promise<User> {
    await delay(500);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return { ...user, profile: data };
  }

  // Stress & Readiness
  async logStress(data: Omit<StressEntry, 'id'>): Promise<StressEntry> {
    await delay(300);
    return { ...data, id: `stress-${Date.now()}` };
  }

  async getStressHistory(userId: string, days: number = 7): Promise<StressEntry[]> {
    await delay(300);
    // Generate mock stress history
    const entries: StressEntry[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      entries.push({
        id: `stress-${i}`,
        userId,
        date: date.toISOString().split('T')[0],
        level: (Math.floor(Math.random() * 3) + 2) as 1 | 2 | 3 | 4 | 5,
        sleepQuality: (Math.floor(Math.random() * 3) + 3) as 1 | 2 | 3 | 4 | 5,
      });
    }
    return entries;
  }

  // Training Plans
  async getTrainingPlan(userId: string): Promise<TrainingPlan | null> {
    await delay(400);
    return mockTrainingPlans.find(p => p.userId === userId) || null;
  }

  async generateTrainingPlan(userId: string, goal: '5K' | '10K' | 'Half Marathon' | 'Marathon'): Promise<TrainingPlan> {
    await delay(1000);
    const plan = mockTrainingPlans.find(p => p.goal === goal);
    if (!plan) throw new Error('Could not generate plan');
    return { ...plan, userId, id: `plan-${Date.now()}` };
  }

  async adjustPlanForStress(planId: string, stressLevel: number): Promise<TrainingPlan> {
    await delay(500);
    const plan = mockTrainingPlans[0];
    // Mock stress adjustment - reduce intensity for high stress
    if (stressLevel >= 4) {
      return {
        ...plan,
        weeks: plan.weeks.map(w => ({
          ...w,
          workouts: w.workouts.map(wo => ({
            ...wo,
            workout: { ...wo.workout, type: 'easy' as const, duration: wo.workout.duration * 0.8 },
          })),
        })),
      };
    }
    return plan;
  }

  // Workouts
  async getTodayWorkout(userId: string): Promise<Workout | null> {
    await delay(300);
    return mockWorkouts[Math.floor(Math.random() * mockWorkouts.length)];
  }

  async completeWorkout(workoutId: string, data: { distance: number; duration: number }): Promise<Workout> {
    await delay(400);
    const workout = mockWorkouts.find(w => w.id === workoutId);
    if (!workout) throw new Error('Workout not found');
    return { ...workout, completed: true, completedAt: new Date().toISOString(), ...data };
  }

  async getWorkoutLibrary(): Promise<Workout[]> {
    await delay(300);
    return mockWorkouts;
  }

  // Strength Routines
  async getStrengthRoutines(): Promise<StrengthRoutine[]> {
    await delay(300);
    return mockStrengthRoutines;
  }

  // Nutrition
  async getNutritionTips(category?: string): Promise<NutritionTip[]> {
    await delay(300);
    if (category) {
      return mockNutritionTips.filter(t => t.category === category);
    }
    return mockNutritionTips;
  }

  // Community
  async getChallenges(): Promise<Challenge[]> {
    await delay(400);
    return mockChallenges;
  }

  async joinChallenge(challengeId: string, userId: string): Promise<Challenge> {
    await delay(300);
    const challenge = mockChallenges.find(c => c.id === challengeId);
    if (!challenge) throw new Error('Challenge not found');
    return { ...challenge, participants: challenge.participants + 1, userProgress: 0 };
  }

  async getLeaderboard(type: 'weekly' | 'monthly' | 'allTime'): Promise<LeaderboardEntry[]> {
    await delay(300);
    return mockLeaderboard;
  }

  // AI Coach
  async getCoachMessage(context: { workoutCompleted?: boolean; stressLevel?: number }): Promise<CoachMessage> {
    await delay(500);
    const messages = [
      { type: 'motivation' as const, content: "Great job getting out there today! Every run makes you stronger. 💪" },
      { type: 'tip' as const, content: "Remember to stay hydrated! Aim for 500ml of water in the hour before your run." },
      { type: 'feedback' as const, content: "Your consistency is paying off. I've noticed your pace improving over the last 2 weeks!" },
      { type: 'warning' as const, content: "Your stress levels have been high. Consider an extra rest day or light yoga session." },
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    return { ...msg, id: `msg-${Date.now()}`, createdAt: new Date().toISOString() };
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
    await delay(400);
    return {
      weeklyMileage: 32.5,
      monthlyMileage: 128.3,
      totalRuns: 47,
      averagePace: "5:45/km",
      streak: 12,
      weeklyData: [
        { day: 'Mon', distance: 5.2 },
        { day: 'Tue', distance: 0 },
        { day: 'Wed', distance: 8.1 },
        { day: 'Thu', distance: 4.5 },
        { day: 'Fri', distance: 0 },
        { day: 'Sat', distance: 12.5 },
        { day: 'Sun', distance: 6.2 },
      ],
    };
  }

  // Subscription
  async upgradeToPremium(userId: string): Promise<User> {
    await delay(500);
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    return { ...user, subscription: 'premium' };
  }
}

export const api = new ApiClient();

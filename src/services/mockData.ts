import type { User, TrainingPlan, Workout, Challenge, LeaderboardEntry, NutritionTip, StrengthRoutine } from './api';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'runner@example.com',
    name: 'Alex Runner',
    avatar: undefined,
    profile: {
      age: 32,
      height: 175,
      weight: 70,
      experienceLevel: 'intermediate',
      weeklyMileage: 35,
      availableTrainingDays: [1, 2, 4, 5, 6],
      prs: {
        fiveK: 1320, // 22:00
        tenK: 2820, // 47:00
        halfMarathon: 6300, // 1:45:00
      },
      raceGoal: {
        distance: 'Half Marathon',
        targetDate: '2025-06-15',
        targetTime: 5700, // 1:35:00
      },
    },
    subscription: 'free',
    createdAt: '2024-01-15T10:00:00Z',
  },
];

export const mockWorkouts: Workout[] = [
  {
    id: 'workout-1',
    type: 'easy',
    title: 'Easy Recovery Run',
    description: 'Keep it conversational. Focus on feeling relaxed and recovering from harder efforts.',
    duration: 35,
    distance: 5,
    targetPace: '6:00-6:30/km',
  },
  {
    id: 'workout-2',
    type: 'tempo',
    title: 'Tempo Run',
    description: 'Comfortably hard effort. You should be able to speak in short sentences.',
    duration: 45,
    distance: 8,
    targetPace: '5:15-5:30/km',
  },
  {
    id: 'workout-3',
    type: 'interval',
    title: '800m Repeats',
    description: 'Classic speed workout to improve your VO2max.',
    duration: 50,
    intervals: [
      { distance: 0.8, pace: '4:00/km', rest: '90 sec jog' },
      { distance: 0.8, pace: '4:00/km', rest: '90 sec jog' },
      { distance: 0.8, pace: '4:00/km', rest: '90 sec jog' },
      { distance: 0.8, pace: '4:00/km', rest: '90 sec jog' },
      { distance: 0.8, pace: '4:00/km', rest: '90 sec jog' },
      { distance: 0.8, pace: '4:00/km', rest: '90 sec jog' },
    ],
  },
  {
    id: 'workout-4',
    type: 'long',
    title: 'Long Run',
    description: 'Building endurance at a comfortable pace. Time on feet is the goal.',
    duration: 90,
    distance: 16,
    targetPace: '6:15-6:45/km',
  },
  {
    id: 'workout-5',
    type: 'recovery',
    title: 'Active Recovery',
    description: 'Very easy jog or walk. Focus on blood flow and recovery.',
    duration: 25,
    distance: 3,
    targetPace: '7:00+/km',
  },
];

const generateWeek = (weekNum: number, focus: string): { dayOfWeek: number; workout: Workout }[] => {
  return [
    { dayOfWeek: 1, workout: { ...mockWorkouts[0], id: `w${weekNum}-1` } },
    { dayOfWeek: 2, workout: { ...mockWorkouts[1], id: `w${weekNum}-2` } },
    { dayOfWeek: 4, workout: { ...mockWorkouts[2], id: `w${weekNum}-3` } },
    { dayOfWeek: 5, workout: { ...mockWorkouts[4], id: `w${weekNum}-4` } },
    { dayOfWeek: 6, workout: { ...mockWorkouts[3], id: `w${weekNum}-5` } },
  ];
};

export const mockTrainingPlans: TrainingPlan[] = [
  {
    id: 'plan-1',
    userId: 'user-1',
    name: 'Half Marathon - Sub 1:35',
    goal: 'Half Marathon',
    startDate: '2025-03-01',
    endDate: '2025-06-15',
    weeks: [
      { weekNumber: 1, focus: 'Base Building', workouts: generateWeek(1, 'Base Building'), totalMileage: 35 },
      { weekNumber: 2, focus: 'Base Building', workouts: generateWeek(2, 'Base Building'), totalMileage: 38 },
      { weekNumber: 3, focus: 'Speed Introduction', workouts: generateWeek(3, 'Speed Introduction'), totalMileage: 40 },
      { weekNumber: 4, focus: 'Recovery Week', workouts: generateWeek(4, 'Recovery Week'), totalMileage: 30 },
      { weekNumber: 5, focus: 'Tempo Focus', workouts: generateWeek(5, 'Tempo Focus'), totalMileage: 42 },
      { weekNumber: 6, focus: 'Tempo Focus', workouts: generateWeek(6, 'Tempo Focus'), totalMileage: 45 },
      { weekNumber: 7, focus: 'Long Run Building', workouts: generateWeek(7, 'Long Run Building'), totalMileage: 48 },
      { weekNumber: 8, focus: 'Recovery Week', workouts: generateWeek(8, 'Recovery Week'), totalMileage: 32 },
    ],
  },
];

export const mockChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'January 100K',
    description: 'Run 100 kilometers this month. Every kilometer counts!',
    type: 'distance',
    target: 100,
    unit: 'km',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    participants: 1234,
    userProgress: 67,
  },
  {
    id: 'challenge-2',
    title: '7-Day Streak',
    description: 'Run every day for 7 days straight. Any distance counts!',
    type: 'streak',
    target: 7,
    unit: 'days',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    participants: 856,
    userProgress: 5,
  },
  {
    id: 'challenge-3',
    title: 'Speed Demon',
    description: 'Log 60 minutes of tempo or interval runs this week.',
    type: 'time',
    target: 60,
    unit: 'min',
    startDate: '2025-01-06',
    endDate: '2025-01-12',
    participants: 423,
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'user-100', userName: 'Sarah K.', value: 156.3, unit: 'km' },
  { rank: 2, userId: 'user-101', userName: 'Mike R.', value: 142.8, unit: 'km' },
  { rank: 3, userId: 'user-102', userName: 'Emma L.', value: 138.5, unit: 'km' },
  { rank: 4, userId: 'user-103', userName: 'David M.', value: 125.2, unit: 'km' },
  { rank: 5, userId: 'user-104', userName: 'Lisa W.', value: 118.9, unit: 'km' },
  { rank: 6, userId: 'user-1', userName: 'You', value: 67.0, unit: 'km' },
  { rank: 7, userId: 'user-105', userName: 'Tom H.', value: 62.4, unit: 'km' },
  { rank: 8, userId: 'user-106', userName: 'Anna P.', value: 58.1, unit: 'km' },
];

export const mockNutritionTips: NutritionTip[] = [
  {
    id: 'nutrition-1',
    category: 'pre-run',
    title: 'Pre-Run Fueling',
    content: 'Eat 2-3 hours before your run. Focus on easily digestible carbs with moderate protein. Avoid high fiber and fat close to your run.',
    timing: '2-3 hours before',
  },
  {
    id: 'nutrition-2',
    category: 'pre-run',
    title: 'Quick Pre-Run Snack',
    content: 'If you need a quick snack 30-60 minutes before, try a banana, toast with honey, or a small energy bar.',
    timing: '30-60 minutes before',
  },
  {
    id: 'nutrition-3',
    category: 'post-run',
    title: 'Recovery Window',
    content: 'Consume protein and carbs within 30 minutes of finishing. Aim for a 3:1 or 4:1 carb-to-protein ratio.',
    timing: 'Within 30 minutes',
  },
  {
    id: 'nutrition-4',
    category: 'post-run',
    title: 'Recovery Meal Ideas',
    content: 'Greek yogurt with berries and granola, chocolate milk, or a turkey sandwich are excellent post-run options.',
  },
  {
    id: 'nutrition-5',
    category: 'race-day',
    title: 'Race Morning',
    content: 'Stick to familiar foods you\'ve tested in training. Eat 3 hours before start time. Avoid experimenting with new foods.',
    timing: '3 hours before race',
  },
  {
    id: 'nutrition-6',
    category: 'hydration',
    title: 'Daily Hydration',
    content: 'Aim for half your body weight in ounces of water daily. Increase during hot weather or intense training periods.',
  },
];

export const mockStrengthRoutines: StrengthRoutine[] = [
  {
    id: 'strength-1',
    name: 'Runner\'s Core Basics',
    duration: 15,
    difficulty: 'easy',
    targetAreas: ['core', 'glutes'],
    exercises: [
      { name: 'Plank', reps: 30, sets: 3, description: 'Hold a forearm plank position, keeping body straight' },
      { name: 'Glute Bridges', reps: 15, sets: 3, description: 'Lift hips toward ceiling, squeeze glutes at top' },
      { name: 'Bird Dogs', reps: 10, sets: 3, description: 'Extend opposite arm and leg while maintaining balance' },
      { name: 'Dead Bug', reps: 10, sets: 3, description: 'Lower opposite arm and leg while keeping core engaged' },
    ],
  },
  {
    id: 'strength-2',
    name: 'Lower Body Power',
    duration: 25,
    difficulty: 'medium',
    targetAreas: ['quads', 'hamstrings', 'glutes'],
    exercises: [
      { name: 'Bodyweight Squats', reps: 15, sets: 3, description: 'Squat down until thighs are parallel to floor' },
      { name: 'Lunges', reps: 12, sets: 3, description: 'Alternate legs, step forward and lower back knee toward floor' },
      { name: 'Single-Leg Deadlift', reps: 10, sets: 3, description: 'Balance on one leg while hinging forward' },
      { name: 'Calf Raises', reps: 20, sets: 3, description: 'Rise up on toes, pause at top, lower slowly' },
      { name: 'Wall Sits', reps: 45, sets: 3, description: 'Hold seated position against wall (seconds)' },
    ],
  },
  {
    id: 'strength-3',
    name: 'Full Body Runner',
    duration: 30,
    difficulty: 'hard',
    targetAreas: ['core', 'legs', 'upper body'],
    exercises: [
      { name: 'Burpees', reps: 10, sets: 3, description: 'Full burpee with push-up and jump' },
      { name: 'Mountain Climbers', reps: 20, sets: 3, description: 'Alternate driving knees toward chest in plank position' },
      { name: 'Jump Squats', reps: 12, sets: 3, description: 'Explosive squat with jump at top' },
      { name: 'Push-ups', reps: 15, sets: 3, description: 'Standard push-up, modify on knees if needed' },
      { name: 'Plank with Shoulder Taps', reps: 20, sets: 3, description: 'In plank, alternate tapping opposite shoulder' },
      { name: 'Split Jumps', reps: 12, sets: 3, description: 'Lunge position, jump and switch legs in air' },
    ],
  },
];

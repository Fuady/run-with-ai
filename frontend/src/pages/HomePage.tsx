import { useState, useEffect } from 'react';
import { Play, Flame, Target, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { StressInput } from '@/components/stress/StressInput';
import { CoachMessage } from '@/components/coach/CoachMessage';
import { useAuth } from '@/contexts/AuthContext';
import { api, Workout, CoachMessage as CoachMessageType } from '@/services/api';

export default function HomePage() {
  const { user } = useAuth();
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null);
  const [coachMessage, setCoachMessage] = useState<CoachMessageType | null>(null);
  const [stats, setStats] = useState({ weeklyMileage: 0, streak: 0, weeklyGoal: 40 });

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      const [workout, message, progressStats] = await Promise.all([
        api.getTodayWorkout(user.id),
        api.getCoachMessage({}),
        api.getProgressStats(user.id),
      ]);
      
      setTodayWorkout(workout);
      setCoachMessage(message);
      setStats({
        weeklyMileage: progressStats.weeklyMileage,
        streak: progressStats.streak,
        weeklyGoal: 40,
      });
    }
    loadData();
  }, [user]);

  const handleStressSubmit = async (stress: number, sleep: number) => {
    if (!user) return;
    await api.logStress({
      userId: user.id,
      date: new Date().toISOString().split('T')[0],
      level: stress as 1 | 2 | 3 | 4 | 5,
      sleepQuality: sleep as 1 | 2 | 3 | 4 | 5,
    });
    // Fetch updated coach message
    const message = await api.getCoachMessage({ stressLevel: stress });
    setCoachMessage(message);
  };

  const progressPercent = Math.min((stats.weeklyMileage / stats.weeklyGoal) * 100, 100);

  return (
    <AppLayout>
      <div className="gradient-hero min-h-[200px] px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <p className="text-sm text-muted-foreground mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold mb-4">
            Hey {user?.name?.split(' ')[0] || 'Runner'}! 👋
          </h1>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card variant="glass">
              <CardContent className="p-3 text-center">
                <Flame className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{stats.streak}</p>
                <p className="text-[10px] text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-3 text-center">
                <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
                <p className="text-lg font-bold">{stats.weeklyMileage}</p>
                <p className="text-[10px] text-muted-foreground">KM This Week</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-3 text-center">
                <Target className="w-5 h-5 text-info mx-auto mb-1" />
                <p className="text-lg font-bold">{Math.round(progressPercent)}%</p>
                <p className="text-[10px] text-muted-foreground">Weekly Goal</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 max-w-lg mx-auto pb-8">
        {/* Stress Input */}
        <StressInput onSubmit={handleStressSubmit} />

        {/* Today's Workout */}
        {todayWorkout && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Today's Workout</h2>
              <Button variant="hero" size="sm" className="gap-1.5">
                <Play className="w-4 h-4" />
                Start
              </Button>
            </div>
            <WorkoutCard workout={todayWorkout} isToday />
          </div>
        )}

        {/* Coach Message */}
        {coachMessage && (
          <div>
            <h2 className="text-lg font-bold mb-3">From Your Coach</h2>
            <CoachMessage message={coachMessage} />
          </div>
        )}

        {/* Weekly Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Weekly Progress</span>
              <span className="text-sm text-muted-foreground">
                {stats.weeklyMileage} / {stats.weeklyGoal} km
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

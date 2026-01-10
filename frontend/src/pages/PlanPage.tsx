import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { useAuth } from '@/contexts/AuthContext';
import { api, TrainingPlan, TrainingWeek } from '@/services/api';
import { cn } from '@/lib/utils';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PlanPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    async function loadPlan() {
      if (!user) return;
      const trainingPlan = await api.getTrainingPlan(user.id);
      setPlan(trainingPlan);
    }
    loadPlan();
  }, [user]);

  const week: TrainingWeek | undefined = plan?.weeks[currentWeek];
  const selectedWorkout = week?.workouts.find(w => w.dayOfWeek === selectedDay);

  const getWorkoutForDay = (day: number) => {
    return week?.workouts.find(w => w.dayOfWeek === day);
  };

  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Training Plan
          </h1>
          {plan && (
            <p className="text-muted-foreground">
              {plan.name} • {plan.goal}
            </p>
          )}
        </div>

        {/* Week Navigation */}
        {plan && (
          <Card variant="elevated" className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
                  disabled={currentWeek === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-center">
                  <CardTitle className="text-lg">Week {week?.weekNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">{week?.focus}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentWeek(Math.min(plan.weeks.length - 1, currentWeek + 1))}
                  disabled={currentWeek === plan.weeks.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Overview */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {dayNames.map((day, index) => {
                  const dayNum = index + 1;
                  const workout = getWorkoutForDay(dayNum);
                  const isSelected = selectedDay === dayNum;
                  const isToday = new Date().getDay() === (dayNum === 7 ? 0 : dayNum);
                  
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(dayNum)}
                      className={cn(
                        "flex flex-col items-center p-2 rounded-lg transition-all duration-200",
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : workout 
                            ? "bg-primary/10 hover:bg-primary/20" 
                            : "bg-muted hover:bg-muted/80",
                        isToday && !isSelected && "ring-2 ring-primary ring-offset-2"
                      )}
                    >
                      <span className="text-[10px] font-medium opacity-70">{day}</span>
                      <span className="text-xs mt-1">
                        {workout ? (
                          <span className={cn(
                            "w-2 h-2 rounded-full block mx-auto",
                            isSelected ? "bg-primary-foreground" : "bg-primary"
                          )} />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Weekly Stats */}
              <div className="flex items-center justify-between text-sm p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Week Total</span>
                <Badge variant="secondary">{week?.totalMileage} km</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Day Workout */}
        {selectedWorkout && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold mb-3">
              {dayNames[selectedDay! - 1]}'s Workout
            </h2>
            <WorkoutCard 
              workout={selectedWorkout.workout}
              onStart={() => console.log('Start workout')}
            />
          </div>
        )}

        {/* Week Workouts List */}
        {!selectedDay && week && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold">This Week's Workouts</h2>
            {week.workouts.map((w) => (
              <WorkoutCard
                key={w.dayOfWeek}
                workout={w.workout}
                showDate
                date={dayNames[w.dayOfWeek - 1]}
                onStart={() => setSelectedDay(w.dayOfWeek)}
              />
            ))}
          </div>
        )}

        {/* No Plan State */}
        {!plan && (
          <Card variant="premium" className="text-center">
            <CardContent className="p-8">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Training Plan Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete your profile to get a personalized training plan.
              </p>
              <Button variant="hero">Create My Plan</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

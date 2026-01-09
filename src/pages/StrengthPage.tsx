import { useState, useEffect } from 'react';
import { Dumbbell, Clock, Flame, ChevronRight, Play } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, StrengthRoutine } from '@/services/api';
import { cn } from '@/lib/utils';

const difficultyConfig = {
  easy: { color: 'bg-success/10 text-success', label: 'Easy' },
  medium: { color: 'bg-warning/10 text-warning', label: 'Medium' },
  hard: { color: 'bg-destructive/10 text-destructive', label: 'Hard' },
};

export default function StrengthPage() {
  const [routines, setRoutines] = useState<StrengthRoutine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<StrengthRoutine | null>(null);

  useEffect(() => {
    async function loadRoutines() {
      const data = await api.getStrengthRoutines();
      setRoutines(data);
    }
    loadRoutines();
  }, []);

  if (selectedRoutine) {
    return (
      <AppLayout>
        <div className="px-4 pt-12 pb-8 max-w-lg mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => setSelectedRoutine(null)}
          >
            ← Back to Routines
          </Button>

          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={difficultyConfig[selectedRoutine.difficulty].color}>
                  {difficultyConfig[selectedRoutine.difficulty].label}
                </Badge>
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {selectedRoutine.duration} min
                </Badge>
              </div>
              <CardTitle className="text-xl">{selectedRoutine.name}</CardTitle>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedRoutine.targetAreas.map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            <h2 className="text-lg font-bold">Exercises</h2>
            {selectedRoutine.exercises.map((exercise, index) => (
              <Card key={index} variant="interactive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <Badge variant="secondary">
                      {exercise.sets} × {exercise.reps}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {exercise.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button variant="hero" className="w-full mt-6">
            <Play className="w-4 h-4" />
            Start Workout
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-8 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            Strength Training
          </h1>
          <p className="text-muted-foreground">
            Build running-specific strength
          </p>
        </div>

        <div className="space-y-4">
          {routines.map((routine) => (
            <Card 
              key={routine.id} 
              variant="interactive"
              className="cursor-pointer"
              onClick={() => setSelectedRoutine(routine)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={difficultyConfig[routine.difficulty].color}>
                        {difficultyConfig[routine.difficulty].label}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{routine.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {routine.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        {routine.exercises.length} exercises
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {routine.targetAreas.map((area) => (
                        <Badge key={area} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

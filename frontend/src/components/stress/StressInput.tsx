import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Brain, Moon } from 'lucide-react';

const stressLevels = [
  { value: 1, emoji: '😌', label: 'Great', color: 'bg-success' },
  { value: 2, emoji: '🙂', label: 'Good', color: 'bg-success/70' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'bg-warning' },
  { value: 4, emoji: '😓', label: 'Tired', color: 'bg-warning/70' },
  { value: 5, emoji: '😫', label: 'Exhausted', color: 'bg-destructive' },
];

const sleepLevels = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'OK' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
];

interface StressInputProps {
  onSubmit: (stress: number, sleep: number) => void;
  defaultStress?: number;
  defaultSleep?: number;
}

export function StressInput({ onSubmit, defaultStress, defaultSleep }: StressInputProps) {
  const [stress, setStress] = useState<number | null>(defaultStress || null);
  const [sleep, setSleep] = useState<number | null>(defaultSleep || null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (stress && sleep) {
      onSubmit(stress, sleep);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Card variant="glass" className="animate-scale-in">
        <CardContent className="p-4 text-center">
          <div className="text-3xl mb-2">✓</div>
          <p className="font-medium text-success">Logged for today!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your plan has been adjusted based on your readiness.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">Stress & Energy Level</p>
          <div className="flex justify-between gap-2">
            {stressLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setStress(level.value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                  stress === level.value 
                    ? "bg-primary/10 ring-2 ring-primary scale-105" 
                    : "hover:bg-muted"
                )}
              >
                <span className="text-2xl">{level.emoji}</span>
                <span className="text-[10px] font-medium text-muted-foreground">{level.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Sleep Quality
          </p>
          <div className="flex gap-2">
            {sleepLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setSleep(level.value)}
                className={cn(
                  "flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all duration-200",
                  sleep === level.value 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={!stress || !sleep}
        >
          Log & Adjust Plan
        </Button>
      </CardContent>
    </Card>
  );
}

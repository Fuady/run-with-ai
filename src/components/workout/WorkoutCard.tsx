import { Clock, MapPin, Zap, Heart, Timer, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Workout } from '@/services/api';

const workoutConfig = {
  easy: { color: 'bg-success/10 text-success border-success/30', icon: Heart, label: 'Easy' },
  tempo: { color: 'bg-warning/10 text-warning border-warning/30', icon: Zap, label: 'Tempo' },
  interval: { color: 'bg-destructive/10 text-destructive border-destructive/30', icon: Timer, label: 'Interval' },
  long: { color: 'bg-info/10 text-info border-info/30', icon: MapPin, label: 'Long Run' },
  recovery: { color: 'bg-muted text-muted-foreground border-muted', icon: Heart, label: 'Recovery' },
  race: { color: 'bg-primary/10 text-primary border-primary/30', icon: Zap, label: 'Race' },
};

interface WorkoutCardProps {
  workout: Workout;
  showDate?: boolean;
  date?: string;
  onStart?: () => void;
  isToday?: boolean;
}

export function WorkoutCard({ workout, showDate, date, onStart, isToday }: WorkoutCardProps) {
  const config = workoutConfig[workout.type];
  const Icon = config.icon;

  return (
    <Card 
      variant={isToday ? "workout" : "interactive"}
      className={cn(
        "animate-fade-in",
        isToday && "border-l-primary"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3 flex-1">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              config.color.split(' ')[0]
            )}>
              <Icon className={cn("w-6 h-6", config.color.split(' ')[1])} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={cn("text-xs", config.color)}>
                  {config.label}
                </Badge>
                {showDate && date && (
                  <span className="text-xs text-muted-foreground">{date}</span>
                )}
              </div>
              <h3 className="font-semibold text-base mb-1 truncate">{workout.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {workout.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{workout.duration} min</span>
                </div>
                {workout.distance && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{workout.distance} km</span>
                  </div>
                )}
                {workout.targetPace && (
                  <span className="text-xs">{workout.targetPace}</span>
                )}
              </div>
            </div>
          </div>
          {onStart && (
            <Button 
              variant={isToday ? "hero" : "ghost"} 
              size="icon"
              onClick={onStart}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
        {workout.intervals && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Intervals:</p>
            <div className="flex flex-wrap gap-2">
              {workout.intervals.slice(0, 3).map((interval, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {interval.distance}km @ {interval.pace}
                </Badge>
              ))}
              {workout.intervals.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{workout.intervals.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

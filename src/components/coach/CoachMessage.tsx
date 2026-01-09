import { Bot, Lightbulb, AlertTriangle, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CoachMessage as CoachMessageType } from '@/services/api';

const messageConfig = {
  motivation: { icon: Trophy, bgClass: 'bg-success/10', iconClass: 'text-success' },
  tip: { icon: Lightbulb, bgClass: 'bg-info/10', iconClass: 'text-info' },
  feedback: { icon: Bot, bgClass: 'bg-primary/10', iconClass: 'text-primary' },
  warning: { icon: AlertTriangle, bgClass: 'bg-warning/10', iconClass: 'text-warning' },
};

interface CoachMessageProps {
  message: CoachMessageType;
}

export function CoachMessage({ message }: CoachMessageProps) {
  const config = messageConfig[message.type];
  const Icon = config.icon;

  return (
    <Card variant="glass" className={cn("animate-slide-up", config.bgClass)}>
      <CardContent className="p-4 flex gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          config.bgClass
        )}>
          <Icon className={cn("w-5 h-5", config.iconClass)} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{message.content}</p>
          <p className="text-xs text-muted-foreground mt-1">AI Coach • Just now</p>
        </div>
      </CardContent>
    </Card>
  );
}

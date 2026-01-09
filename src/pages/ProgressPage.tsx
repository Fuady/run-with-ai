import { useState, useEffect } from 'react';
import { TrendingUp, Award, Zap, Clock, MapPin } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function ProgressPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    weeklyMileage: 0,
    monthlyMileage: 0,
    totalRuns: 0,
    averagePace: "0:00/km",
    streak: 0,
    weeklyData: [] as { day: string; distance: number }[],
  });

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      const data = await api.getProgressStats(user.id);
      setStats(data);
    }
    loadStats();
  }, [user]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const prs = user?.profile?.prs || {};

  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-8 max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Your Progress
          </h1>
          <p className="text-muted-foreground">Track your running journey</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <MapPin className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.weeklyMileage}</p>
              <p className="text-xs text-muted-foreground">KM This Week</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.monthlyMileage}</p>
              <p className="text-xs text-muted-foreground">KM This Month</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-info mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.averagePace}</p>
              <p className="text-xs text-muted-foreground">Avg Pace</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <Award className="w-6 h-6 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.totalRuns}</p>
              <p className="text-xs text-muted-foreground">Total Runs</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Distance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.weeklyData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    hide 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} km`, 'Distance']}
                  />
                  <Bar 
                    dataKey="distance" 
                    fill="hsl(var(--primary))" 
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Personal Records */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" />
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: '5K', value: prs.fiveK },
              { label: '10K', value: prs.tenK },
              { label: 'Half Marathon', value: prs.halfMarathon },
              { label: 'Marathon', value: prs.marathon },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{label}</span>
                {value ? (
                  <Badge variant="secondary" className="font-mono">
                    {formatTime(value)}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Not set</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Running Streak */}
        <Card variant="premium">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-2">🔥</div>
            <p className="text-3xl font-bold mb-1">{stats.streak} Days</p>
            <p className="text-muted-foreground">Running Streak</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

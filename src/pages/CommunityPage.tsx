import { useState, useEffect } from 'react';
import { Trophy, Users, Target, Medal, Crown, Lock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, Challenge, LeaderboardEntry } from '@/services/api';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function CommunityPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function loadData() {
      const [challengesData, leaderboardData] = await Promise.all([
        api.getChallenges(),
        api.getLeaderboard('weekly'),
      ]);
      setChallenges(challengesData);
      setLeaderboard(leaderboardData);
    }
    loadData();
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    if (!user) return;
    const updated = await api.joinChallenge(challengeId, user.id);
    setChallenges(prev => prev.map(c => c.id === challengeId ? updated : c));
  };

  const isPremiumLocked = user?.subscription === 'free';

  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Community
          </h1>
          <p className="text-muted-foreground">Compete, connect, and celebrate</p>
        </div>

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4">
            {challenges.map((challenge) => {
              const progress = challenge.userProgress 
                ? (challenge.userProgress / challenge.target) * 100 
                : 0;
              const isJoined = challenge.userProgress !== undefined;

              return (
                <Card key={challenge.id} variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {challenge.description}
                        </p>
                      </div>
                      {isJoined ? (
                        <Badge variant="secondary">Joined</Badge>
                      ) : (
                        <Button size="sm" onClick={() => handleJoinChallenge(challenge.id)}>
                          Join
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {challenge.participants.toLocaleString()}
                      </span>
                      <span>
                        {challenge.target} {challenge.unit}
                      </span>
                    </div>

                    {isJoined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Your Progress</span>
                          <span className="font-medium">
                            {challenge.userProgress} / {challenge.target} {challenge.unit}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Premium Challenge Teaser */}
            <Card variant="premium" className="relative overflow-hidden">
              {isPremiumLocked && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium">Premium Challenge</p>
                    <Button variant="hero" size="sm" className="mt-3">
                      Upgrade to Unlock
                    </Button>
                  </div>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-warning" />
                  <Badge variant="outline" className="border-warning text-warning">
                    Premium
                  </Badge>
                </div>
                <h3 className="font-bold text-lg">Elite Marathon Prep</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete 200km in 30 days with guided coaching.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>This Week's Top Runners</span>
                  <Badge variant="outline">Distance</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {leaderboard.map((entry) => {
                  const isUser = entry.userId === 'user-1';
                  const isTop3 = entry.rank <= 3;

                  return (
                    <div
                      key={entry.userId}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-all",
                        isUser 
                          ? "bg-primary/10 border border-primary/30" 
                          : isTop3 
                            ? "bg-muted" 
                            : "hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        entry.rank === 1 && "bg-warning text-warning-foreground",
                        entry.rank === 2 && "bg-muted-foreground/30 text-foreground",
                        entry.rank === 3 && "bg-warning/50 text-warning-foreground",
                        entry.rank > 3 && "bg-muted text-muted-foreground"
                      )}>
                        {entry.rank <= 3 ? (
                          <Medal className="w-4 h-4" />
                        ) : (
                          entry.rank
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium",
                          isUser && "text-primary"
                        )}>
                          {entry.userName}
                          {isUser && <span className="ml-1 text-xs">(You)</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.value}</p>
                        <p className="text-xs text-muted-foreground">{entry.unit}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

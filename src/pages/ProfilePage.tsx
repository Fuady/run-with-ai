import { useState } from 'react';
import { 
  User, Settings, Award, Dumbbell, Apple, LogOut, 
  ChevronRight, Crown, Lock, Zap
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: User, label: 'Edit Profile', path: '/profile/edit' },
  { icon: Settings, label: 'Settings', path: '/profile/settings' },
  { icon: Award, label: 'Achievements', path: '/achievements', badge: '12' },
  { icon: Dumbbell, label: 'Strength Routines', path: '/strength' },
  { icon: Apple, label: 'Nutrition Guide', path: '/nutrition' },
];

const premiumFeatures = [
  'Unlimited training plans',
  'Advanced analytics',
  'AI coach personalization',
  'Priority support',
  'Exclusive challenges',
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPremium = user?.subscription === 'premium';
  const experienceLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-8 max-w-lg mx-auto space-y-6">
        {/* Profile Header */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || 'R'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{user?.name || 'Runner'}</h1>
                  {isPremium && (
                    <Badge className="bg-warning text-warning-foreground">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {user?.profile?.experienceLevel && (
                  <Badge variant="secondary" className="mt-2">
                    {experienceLabels[user.profile.experienceLevel]}
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            {user?.profile && (
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <p className="text-xl font-bold">{user.profile.weeklyMileage}</p>
                  <p className="text-xs text-muted-foreground">Avg KM/Week</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{user.profile.availableTrainingDays?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Training Days</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {user.profile.raceGoal?.distance || '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">Goal Race</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Premium Upgrade Card */}
        {!isPremium && (
          <Card variant="premium" className="overflow-hidden">
            <div className="gradient-primary p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-foreground">Upgrade to Premium</h3>
                  <p className="text-sm text-primary-foreground/80">Unlock your full potential</p>
                </div>
              </div>
              
              {showUpgrade ? (
                <div className="space-y-2 mb-4 animate-fade-in">
                  {premiumFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-primary-foreground">
                      <div className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                        ✓
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              ) : null}
              
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={() => setShowUpgrade(!showUpgrade)}
              >
                {showUpgrade ? 'Start Free Trial' : 'See Premium Features'}
              </Button>
            </div>
          </Card>
        )}

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors",
                    index !== menuItems.length - 1 && "border-b border-border"
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant="secondary">{item.badge}</Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        {/* App Info */}
        <p className="text-center text-xs text-muted-foreground">
          AI Running Coach v1.0.0
        </p>
      </div>
    </AppLayout>
  );
}

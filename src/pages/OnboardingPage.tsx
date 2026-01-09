import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ChevronLeft, User, Activity, Target, Calendar,
  Ruler, Weight, Clock, AlertCircle, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const experienceLevels = [
  { value: 'beginner', label: 'Beginner', desc: 'New to running or < 1 year' },
  { value: 'intermediate', label: 'Intermediate', desc: '1-3 years, regular running' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years, competitive experience' },
];

const raceGoals = [
  { value: '5K', label: '5K', icon: '🏃' },
  { value: '10K', label: '10K', icon: '🏃‍♂️' },
  { value: 'Half Marathon', label: 'Half Marathon', icon: '🎽' },
  { value: 'Marathon', label: 'Marathon', icon: '🏅' },
];

const weekDays = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    experienceLevel: '' as 'beginner' | 'intermediate' | 'advanced' | '',
    weeklyMileage: '',
    availableTrainingDays: [] as number[],
    injuryHistory: '',
    raceGoal: '' as '5K' | '10K' | 'Half Marathon' | 'Marathon' | '',
    targetDate: '',
    prs: {
      fiveK: '',
      tenK: '',
      halfMarathon: '',
      marathon: '',
    },
  });

  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const steps = [
    { title: 'About You', icon: User },
    { title: 'Experience', icon: Activity },
    { title: 'Schedule', icon: Calendar },
    { title: 'Goal', icon: Target },
  ];

  const progress = ((step + 1) / steps.length) * 100;

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      availableTrainingDays: prev.availableTrainingDays.includes(day)
        ? prev.availableTrainingDays.filter(d => d !== day)
        : [...prev.availableTrainingDays, day],
    }));
  };

  const handleComplete = async () => {
    const profile = {
      age: parseInt(formData.age) || 30,
      height: parseInt(formData.height) || 175,
      weight: parseInt(formData.weight) || 70,
      experienceLevel: formData.experienceLevel || 'beginner',
      weeklyMileage: parseInt(formData.weeklyMileage) || 20,
      availableTrainingDays: formData.availableTrainingDays.length ? formData.availableTrainingDays : [1, 3, 5],
      injuryHistory: formData.injuryHistory || undefined,
      prs: {
        fiveK: formData.prs.fiveK ? parseInt(formData.prs.fiveK) * 60 : undefined,
        tenK: formData.prs.tenK ? parseInt(formData.prs.tenK) * 60 : undefined,
        halfMarathon: formData.prs.halfMarathon ? parseInt(formData.prs.halfMarathon) * 60 : undefined,
        marathon: formData.prs.marathon ? parseInt(formData.prs.marathon) * 60 : undefined,
      },
      raceGoal: formData.raceGoal ? {
        distance: formData.raceGoal,
        targetDate: formData.targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      } : undefined,
    };

    await completeOnboarding(profile);
    navigate('/home');
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.age && formData.height && formData.weight;
      case 1:
        return formData.experienceLevel && formData.weeklyMileage;
      case 2:
        return formData.availableTrainingDays.length >= 2;
      case 3:
        return true; // Goal is optional
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          {step > 0 ? (
            <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="w-10" />
          )}
          <div className="flex gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    i === step 
                      ? "bg-primary text-primary-foreground" 
                      : i < step 
                        ? "bg-success/20 text-success" 
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
              );
            })}
          </div>
          <div className="w-10" />
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Step Content */}
      <div className="flex-1 px-4 pb-8">
        <Card variant="elevated" className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">{steps[step].title}</CardTitle>
            <CardDescription>
              {step === 0 && "Let's get to know you better"}
              {step === 1 && "Tell us about your running background"}
              {step === 2 && "When can you train?"}
              {step === 3 && "What's your next race goal?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 0: About You */}
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="age"
                      type="number"
                      placeholder="30"
                      className="pl-10"
                      value={formData.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="height"
                        type="number"
                        placeholder="175"
                        className="pl-10"
                        value={formData.height}
                        onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        className="pl-10"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 1: Experience */}
            {step === 1 && (
              <>
                <div className="space-y-3">
                  <Label>Experience Level</Label>
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        experienceLevel: level.value as typeof formData.experienceLevel 
                      }))}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        formData.experienceLevel === level.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <p className="font-medium">{level.label}</p>
                      <p className="text-sm text-muted-foreground">{level.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Current Weekly Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="30"
                    value={formData.weeklyMileage}
                    onChange={(e) => setFormData(prev => ({ ...prev, weeklyMileage: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="injuries">Injury History (optional)</Label>
                  <Textarea
                    id="injuries"
                    placeholder="Any past injuries we should know about?"
                    value={formData.injuryHistory}
                    onChange={(e) => setFormData(prev => ({ ...prev, injuryHistory: e.target.value }))}
                  />
                </div>
              </>
            )}

            {/* Step 2: Schedule */}
            {step === 2 && (
              <>
                <div className="space-y-3">
                  <Label>Available Training Days</Label>
                  <p className="text-sm text-muted-foreground">Select at least 2 days</p>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "p-3 rounded-lg font-medium transition-all",
                          formData.availableTrainingDays.includes(day.value)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Goal */}
            {step === 3 && (
              <>
                <div className="space-y-3">
                  <Label>Race Goal (optional)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {raceGoals.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          raceGoal: goal.value as typeof formData.raceGoal 
                        }))}
                        className={cn(
                          "p-4 rounded-xl border-2 text-center transition-all",
                          formData.raceGoal === goal.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span className="text-2xl mb-1 block">{goal.icon}</span>
                        <span className="font-medium">{goal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {formData.raceGoal && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="targetDate">Target Race Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                    />
                  </div>
                )}
                <div className="p-4 bg-muted rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Don't worry! You can always update your goals later in your profile.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto">
          {step < steps.length - 1 ? (
            <Button
              variant="hero"
              className="w-full"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="hero"
              className="w-full"
              onClick={handleComplete}
            >
              <Zap className="w-4 h-4" />
              Start Training
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

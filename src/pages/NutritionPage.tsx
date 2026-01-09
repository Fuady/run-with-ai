import { useState, useEffect } from 'react';
import { Apple, Coffee, Utensils, Trophy, Droplets } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { api, NutritionTip } from '@/services/api';

const categoryConfig = {
  'pre-run': { icon: Coffee, label: 'Pre-Run', color: 'text-warning' },
  'post-run': { icon: Utensils, label: 'Post-Run', color: 'text-success' },
  'race-day': { icon: Trophy, label: 'Race Day', color: 'text-primary' },
  'hydration': { icon: Droplets, label: 'Hydration', color: 'text-info' },
};

export default function NutritionPage() {
  const [tips, setTips] = useState<NutritionTip[]>([]);
  const [activeTab, setActiveTab] = useState('pre-run');

  useEffect(() => {
    async function loadTips() {
      const data = await api.getNutritionTips();
      setTips(data);
    }
    loadTips();
  }, []);

  const filteredTips = tips.filter(tip => tip.category === activeTab);

  return (
    <AppLayout>
      <div className="px-4 pt-12 pb-8 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Apple className="w-6 h-6 text-primary" />
            Nutrition Guide
          </h1>
          <p className="text-muted-foreground">
            Fuel your runs the right way
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full grid grid-cols-4">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <TabsTrigger key={key} value={key} className="flex flex-col gap-1 py-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{config.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.keys(categoryConfig).map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {tips
                .filter(tip => tip.category === category)
                .map((tip) => {
                  const config = categoryConfig[tip.category as keyof typeof categoryConfig];
                  const Icon = config.icon;
                  
                  return (
                    <Card key={tip.id} variant="elevated">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${config.color}`} />
                            {tip.title}
                          </CardTitle>
                          {tip.timing && (
                            <Badge variant="outline">{tip.timing}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{tip.content}</p>
                      </CardContent>
                    </Card>
                  );
                })}
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Tips Card */}
        <Card variant="premium" className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">💡 Quick Tips</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Never try new foods on race day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Aim for 30-60g carbs per hour for runs over 90 min</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Drink to thirst, not on a schedule</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Include protein within 30 min post-run for recovery</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

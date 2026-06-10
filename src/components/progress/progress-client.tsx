"use client";

import { useState } from "react";
import type { Goal, Profile, WeightEntry } from "@prisma/client";
import { WeightChart } from "./weight-chart";
import { CalorieChart } from "./calorie-chart";
import { WeightLogForm } from "./weight-log-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatWeight, formatCalories } from "@/lib/utils";
import { calculateBMI, getBMICategory } from "@/utils/calorie-calculator";
import { TrendingDown, TrendingUp, Minus, Target, Scale, Flame } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

interface CalorieLog {
  date: string;
  day: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  logged: boolean;
}

interface ProgressClientProps {
  weightEntries: WeightEntry[];
  goal: Goal | null;
  profile: Profile | null;
  calorieLogs: CalorieLog[];
  today: string;
}

export function ProgressClient({
  weightEntries: initialEntries,
  goal,
  profile,
  calorieLogs,
  today,
}: ProgressClientProps) {
  const { t } = useLanguage();
  const [weightEntries, setWeightEntries] = useState(initialEntries);

  const latestWeight = weightEntries[weightEntries.length - 1];
  const firstWeight = weightEntries[0];

  const weightChange = latestWeight && firstWeight
    ? latestWeight.weightKg - firstWeight.weightKg
    : null;

  const bmi = profile?.heightCm && latestWeight
    ? calculateBMI(latestWeight.weightKg, profile.heightCm)
    : null;

  const loggedDays = calorieLogs.filter((d) => d.logged).length;
  const avgCalories = loggedDays > 0
    ? Math.round(calorieLogs.filter((d) => d.logged).reduce((s, d) => s + d.calories, 0) / loggedDays)
    : 0;

  const handleWeightLog = async (weightKg: number, date: string, notes?: string) => {
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg, date, notes }),
      });

      if (!res.ok) throw new Error();
      const { entry } = await res.json();

      setWeightEntries((prev) => {
        const filtered = prev.filter(
          (e) => new Date(e.date).toISOString().split("T")[0] !== date
        );
        return [...filtered, entry].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });

      toast({ title: t("progress.weightLogged"), description: `${weightKg} ${t("progress.weightLoggedDesc")} — ${date}` });
    } catch {
      toast({ title: t("progress.failedToLog"), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0 stagger">
      <div>
        <h1 className="text-2xl font-bold">{t("progress.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("progress.subtitle")}</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 min-[390px]:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <Scale className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">
            {latestWeight ? formatWeight(latestWeight.weightKg) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("progress.currentWeight")}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold">
            {profile?.targetWeightKg ? formatWeight(profile.targetWeightKg) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("progress.targetWeight")}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              weightChange === null ? "bg-muted/20"
              : weightChange < 0 ? "bg-brand-500/10"
              : weightChange > 0 ? "bg-orange-500/10"
              : "bg-muted/20"
            }`}>
              {weightChange === null ? (
                <Minus className="w-4 h-4 text-muted-foreground" />
              ) : weightChange < 0 ? (
                <TrendingDown className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              ) : weightChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-orange-500" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <p className="text-2xl font-bold">
            {weightChange !== null ? (
              <span className={weightChange < 0 ? "text-brand-600 dark:text-brand-400" : weightChange > 0 ? "text-orange-500" : ""}>
                {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
              </span>
            ) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{t("progress.totalChange")}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCalories(avgCalories)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("progress.avgCalories")}</p>
        </Card>
      </div>

      {/* BMI + Streak */}
      <div className="flex flex-wrap gap-3">
        {bmi && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border text-sm">
            <span className="text-muted-foreground">BMI</span>
            <span className="font-semibold">{bmi}</span>
            <Badge variant="outline" className="text-xs">{getBMICategory(bmi)}</Badge>
          </div>
        )}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border text-sm">
          <span className="text-muted-foreground">{t("progress.logged")}</span>
          <span className="font-semibold">{loggedDays}/30 {t("progress.days")}</span>
        </div>
        {goal && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-sm">
            <span className="text-brand-600 dark:text-brand-400">{t("progress.target")}</span>
            <span className="font-semibold text-brand-600 dark:text-brand-400">{formatCalories(goal.dailyCalories)} {t("progress.kcalDay")}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="weight">
            <Card>
              <CardHeader className="pb-4 gap-3 min-[460px]:flex-row min-[460px]:items-center min-[460px]:justify-between">
                <CardTitle>{t("progress.trends")}</CardTitle>
                <TabsList>
                  <TabsTrigger value="weight">{t("progress.weightTab")}</TabsTrigger>
                  <TabsTrigger value="calories">{t("progress.caloriesTab")}</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="weight">
                  {weightEntries.length < 2 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                      {t("progress.logAtLeast2Entries")}
                    </div>
                  ) : (
                    <WeightChart entries={weightEntries} target={profile?.targetWeightKg} />
                  )}
                </TabsContent>
                <TabsContent value="calories">
                  <CalorieChart logs={calorieLogs} target={goal?.dailyCalories} />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>

          {/* Weight history */}
          {weightEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>{t("progress.weightHistory")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-4">
                <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
                  {[...weightEntries].reverse().map((entry) => {
                    const dateStr = new Date(entry.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    return (
                      <div key={entry.id} className="flex items-center justify-between px-4 sm:px-6 py-3">
                        <div>
                          <p className="text-sm font-medium">{dateStr}</p>
                          {entry.notes && (
                            <p className="text-xs text-muted-foreground">{entry.notes}</p>
                          )}
                        </div>
                        <p className="text-sm font-semibold">{formatWeight(entry.weightKg)}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Weight Log Form */}
        <div>
          <WeightLogForm today={today} onLog={handleWeightLog} />
        </div>
      </div>
    </div>
  );
}

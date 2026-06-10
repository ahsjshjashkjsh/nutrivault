"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Droplets, Flame, Plus, Scale, Sparkles, Utensils } from "lucide-react";
import type { Goal, MealEntry, Food, WeightEntry, Profile, User } from "@prisma/client";
import { CalorieRing } from "./calorie-ring";
import { MacroProgress } from "./macro-progress";
import { StatCard } from "./stat-card";
import { WeeklyChart } from "./weekly-chart";
import { RecentMeals } from "./recent-meals";
import { WaterWidget } from "./water-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCalories, formatWeight, percentOf } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

type MealEntryWithFood = MealEntry & { food: Food };

interface DashboardClientProps {
  user: (User & { profile: Profile | null }) | null;
  goal: Goal | null;
  dailyTotals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  meals: {
    BREAKFAST: MealEntryWithFood[];
    LUNCH: MealEntryWithFood[];
    DINNER: MealEntryWithFood[];
    SNACK: MealEntryWithFood[];
  };
  waterMl: number;
  recentWeight: WeightEntry | null;
  last7Days: Array<{
    date: string;
    day: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  }>;
  streakDays: number;
  today: string;
}

export function DashboardClient({
  user,
  goal,
  dailyTotals,
  meals,
  waterMl,
  recentWeight,
  last7Days,
  streakDays,
  today,
}: DashboardClientProps) {
  const { t } = useLanguage();
  const [waterAmount, setWaterAmount] = useState(waterMl);

  const calorieTarget = goal?.dailyCalories || 2000;
  const proteinTarget = goal?.proteinGrams || 150;
  const carbsTarget = goal?.carbsGrams || 200;
  const fatTarget = goal?.fatGrams || 65;
  const waterTarget = goal?.waterMl || 2500;

  const remaining = Math.max(0, calorieTarget - dailyTotals.calories);
  const caloriePercent = percentOf(dailyTotals.calories, calorieTarget);

  const recentEntries = Object.values(meals)
    .flat()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleWaterAdd = async (amountMl: number) => {
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl, date: today }),
      });

      if (!res.ok) throw new Error();
      setWaterAmount((prev) => prev + amountMl);
      toast({ title: `+${amountMl}ml logged`, description: "Water intake updated." });
    } catch {
      toast({ title: "Failed to log water", variant: "destructive" });
    }
  };

  const displayDate = format(new Date(today), "EEEE, MMM d");
  const greeting = getGreeting(t);

  return (
    <div className="space-y-6 pb-20 lg:pb-0 stagger">
      {/* Welcome */}
      <section className="dashboard-welcome relative overflow-hidden rounded-2xl border border-brand-500/15 p-5 sm:p-7">
        <div className="welcome-orb" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-300">
              <Sparkles className="h-3 w-3" />
              {t("dashboard.todayOverview")}
            </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {greeting}, {user?.name?.split(" ")[0] || "there"}
            </h1>
            {streakDays > 0 && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-500"
                title={t("dashboard.streakTooltip")}
              >
                <Flame className="w-3.5 h-3.5" />
                {streakDays} {streakDays === 1 ? t("dashboard.streakDay") : t("dashboard.streakDays")}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {displayDate} · <span className="font-semibold text-foreground">{formatCalories(remaining)} kcal</span> {t("dashboard.remaining").toLowerCase()}
          </p>
          </div>
          <Button asChild size="lg" className="group shadow-lg shadow-brand-500/15">
            <Link href="/diary">
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              {t("dashboard.logMeal")}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Calorie Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Ring */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center">
            <CalorieRing
              consumed={dailyTotals.calories}
              target={calorieTarget}
              percent={caloriePercent}
            />
            <div className="grid grid-cols-3 w-full gap-3 mt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t("dashboard.target")}</p>
                <p className="text-sm font-semibold">{formatCalories(calorieTarget)}</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-xs text-muted-foreground">{t("dashboard.eaten")}</p>
                <p className="text-sm font-semibold text-orange-500">
                  {formatCalories(dailyTotals.calories)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t("dashboard.remaining")}</p>
                <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {formatCalories(remaining)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Macros */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle>{t("dashboard.macrosToday")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <MacroProgress
              label={t("dashboard.protein")}
              consumed={dailyTotals.proteinG}
              target={proteinTarget}
              color="bg-brand-500"
              unit="g"
            />
            <MacroProgress
              label="Carbohydrates"
              consumed={dailyTotals.carbsG}
              target={carbsTarget}
              color="bg-blue-500"
              unit="g"
            />
            <MacroProgress
              label="Fat"
              consumed={dailyTotals.fatG}
              target={fatTarget}
              color="bg-yellow-500"
              unit="g"
            />
          </CardContent>
        </Card>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Calories"
          value={formatCalories(dailyTotals.calories)}
          subtext={t("dashboard.caloriesConsumed")}
          icon={<Utensils className="w-4 h-4" />}
          color="text-orange-500"
          bgColor="bg-orange-500/10"
        />
        <StatCard
          label={t("dashboard.protein")}
          value={`${Math.round(dailyTotals.proteinG)}g`}
          subtext={`${t("dashboard.of")} ${proteinTarget}g ${t("dashboard.targetLabel")}`}
          icon={<span className="text-xs font-bold">P</span>}
          color="text-brand-600 dark:text-brand-400"
          bgColor="bg-brand-500/10"
        />
        <StatCard
          label={t("dashboard.water")}
          value={`${(waterAmount / 1000).toFixed(1)}L`}
          subtext={`${t("dashboard.of")} ${(waterTarget / 1000).toFixed(1)}L ${t("dashboard.goal")}`}
          icon={<Droplets className="w-4 h-4" />}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          label={t("dashboard.weight")}
          value={recentWeight ? formatWeight(recentWeight.weightKg) : "—"}
          subtext={
            user?.profile?.targetWeightKg
              ? `${t("dashboard.goal")} ${formatWeight(user.profile.targetWeightKg)}`
              : t("dashboard.noTargetSet")
          }
          icon={<Scale className="w-4 h-4" />}
          color="text-purple-500"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Weekly Chart + Water */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-4">
            <CardTitle>{t("dashboard.thisWeek")}</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link href="/progress">
                {t("dashboard.viewAll")} <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <WeeklyChart data={last7Days} target={calorieTarget} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <WaterWidget
            current={waterAmount}
            target={waterTarget}
            onAdd={handleWaterAdd}
          />
        </div>
      </div>

      {/* Recent Meals */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4">
          <CardTitle>{t("dashboard.todaysMeals")}</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link href="/diary">
              {t("dashboard.openDiary")} <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0 pb-4">
          <RecentMeals entries={recentEntries} />
        </CardContent>
      </Card>
    </div>
  );
}

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("dashboard.goodMorning");
  if (hour < 17) return t("dashboard.goodAfternoon");
  return t("dashboard.goodEvening");
}

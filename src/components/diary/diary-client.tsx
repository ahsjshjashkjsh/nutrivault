"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronLeft, ChevronRight, Copy, Crown, Droplets, Loader2, Plus, Sparkles } from "lucide-react";
import type { Goal, MealEntry, Food } from "@prisma/client";
import { MealSection } from "./meal-section";
import { FoodSearchModal } from "./food-search-modal";
import { NaturalLanguageEntry } from "./natural-language-entry";
import { PhotoMealAnalysis } from "./photo-meal-analysis";
import { MacroProgress } from "@/components/dashboard/macro-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCalories, percentOf } from "@/lib/utils";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { format, addDays, subDays, parseISO } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { WATER_QUICK_ADD } from "@/constants";
import { useLanguage } from "@/contexts/language-context";
import type { AIMealFood } from "@/lib/nutrition-agent";

type MealEntryWithFood = MealEntry & { food: Food };
type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

interface DiaryClientProps {
  date: string;
  today: string;
  meals: Record<MealType, MealEntryWithFood[]>;
  totals: { calories: number; proteinG: number; carbsG: number; fatG: number };
  goal: Goal | null;
  waterMl: number;
  isPremium: boolean;
}

export function DiaryClient({ date, today, meals, totals, goal, waterMl: initialWater, isPremium }: DiaryClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [mealData, setMealData] = useState(meals);
  const [currentTotals, setCurrentTotals] = useState(totals);
  const [waterMl, setWaterMl] = useState(initialWater);
  const [searchModal, setSearchModal] = useState<{
    open: boolean;
    mealType: MealType;
  }>({ open: false, mealType: "BREAKFAST" });
  const [nlpModal, setNlpModal] = useState<{
    open: boolean;
    mealType: MealType;
  }>({ open: false, mealType: "BREAKFAST" });
  const [photoModal, setPhotoModal] = useState<{
    open: boolean;
    mealType: MealType;
  }>({ open: false, mealType: "LUNCH" });
  const [copying, setCopying] = useState(false);

  const calorieTarget = goal?.dailyCalories || 2000;
  const proteinTarget = goal?.proteinGrams || 150;
  const carbsTarget = goal?.carbsGrams || 200;
  const fatTarget = goal?.fatGrams || 65;
  const waterTarget = goal?.waterMl || 2500;

  const caloriePercent = percentOf(currentTotals.calories, calorieTarget);
  const remaining = Math.max(0, calorieTarget - currentTotals.calories);

  const navigateDate = (direction: "prev" | "next") => {
    const parsed = parseISO(date);
    const newDate = direction === "prev" ? subDays(parsed, 1) : addDays(parsed, 1);
    const newDateStr = format(newDate, "yyyy-MM-dd");
    if (newDateStr <= today) {
      router.push(`/diary?date=${newDateStr}`);
    }
  };

  const openSearchModal = (mealType: MealType) => {
    setSearchModal({ open: true, mealType });
  };

  const openNlpModal = (mealType: MealType) => {
    setNlpModal({ open: true, mealType });
  };

  const openPhotoModal = (mealType: MealType = "LUNCH") => {
    setPhotoModal({ open: true, mealType });
  };

  const handleAddEntry = async (
    mealType: MealType,
    foodId: string,
    servings: number,
    servingSize: number,
    servingUnit: string
  ) => {
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId, mealType, date, servings, servingSize, servingUnit }),
      });

      if (!res.ok) throw new Error();

      const { entry } = await res.json();

      setMealData((prev) => ({
        ...prev,
        [mealType]: [...prev[mealType], entry],
      }));

      setCurrentTotals((prev) => ({
        calories: prev.calories + entry.calories,
        proteinG: prev.proteinG + entry.proteinG,
        carbsG: prev.carbsG + entry.carbsG,
        fatG: prev.fatG + entry.fatG,
      }));

      setSearchModal((prev) => ({ ...prev, open: false }));
      toast({ title: t("diary.foodAdded"), description: entry.food.name });
    } catch {
      toast({ title: t("diary.failedToAdd"), variant: "destructive" });
    }
  };

  // Handle AI-analyzed items — foods already have real DB IDs from the analysis API
  const handleAddAIItems = async (items: AIMealFood[], mealType: MealType) => {
    let addedCount = 0;

    for (const item of items) {
      try {
        const diaryRes = await fetch("/api/diary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            foodId: item.foodId,
            mealType,
            date,
            servings: item.servings > 0 ? item.servings : 1,
            servingSize: item.servingSize,
            servingUnit: item.servingUnit,
          }),
        });

        if (diaryRes.ok) {
          const { entry } = await diaryRes.json();
          setMealData((prev) => ({
            ...prev,
            [mealType]: [...prev[mealType], entry],
          }));
          setCurrentTotals((prev) => ({
            calories: prev.calories + entry.calories,
            proteinG: prev.proteinG + entry.proteinG,
            carbsG: prev.carbsG + entry.carbsG,
            fatG: prev.fatG + entry.fatG,
          }));
          addedCount++;
        }
      } catch {
        // Skip items that fail individually
      }
    }

    if (addedCount > 0) {
      toast({
        title: t("diary.foodAdded"),
        description: `${addedCount} item${addedCount > 1 ? "s" : ""} added`,
      });
    } else {
      toast({
        title: t("diary.failedToAdd"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (mealType: MealType, entryId: string) => {
    try {
      const entry = mealData[mealType].find((e) => e.id === entryId);
      if (!entry) return;

      const res = await fetch(`/api/meals/${entryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();

      setMealData((prev) => ({
        ...prev,
        [mealType]: prev[mealType].filter((e) => e.id !== entryId),
      }));

      setCurrentTotals((prev) => ({
        calories: Math.max(0, prev.calories - entry.calories),
        proteinG: Math.max(0, prev.proteinG - entry.proteinG),
        carbsG: Math.max(0, prev.carbsG - entry.carbsG),
        fatG: Math.max(0, prev.fatG - entry.fatG),
      }));

      toast({ title: t("diary.entryRemoved") });
    } catch {
      toast({ title: t("diary.failedToDelete"), variant: "destructive" });
    }
  };

  const handleCopyYesterday = async () => {
    setCopying(true);
    try {
      const res = await fetch("/api/diary/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });

      if (res.status === 404) {
        toast({ title: t("diary.nothingToCopy"), variant: "destructive" });
        return;
      }
      if (!res.ok) throw new Error();

      const { entries } = (await res.json()) as { entries: MealEntryWithFood[] };

      setMealData((prev) => {
        const next = { ...prev };
        for (const entry of entries) {
          const type = entry.mealType as MealType;
          next[type] = [...next[type], entry];
        }
        return next;
      });

      setCurrentTotals((prev) =>
        entries.reduce(
          (acc, e) => ({
            calories: acc.calories + e.calories,
            proteinG: acc.proteinG + e.proteinG,
            carbsG: acc.carbsG + e.carbsG,
            fatG: acc.fatG + e.fatG,
          }),
          prev
        )
      );

      toast({
        title: t("diary.copiedFromYesterday"),
        description: `${entries.length} ${entries.length === 1 ? t("diary.itemCopied") : t("diary.itemsCopied")}`,
      });
    } catch {
      toast({ title: t("diary.failedToCopy"), variant: "destructive" });
    } finally {
      setCopying(false);
    }
  };

  const handleWaterAdd = async (amountMl: number) => {
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl, date }),
      });
      if (!res.ok) throw new Error();
      setWaterMl((prev) => prev + amountMl);
      toast({ title: `+${amountMl}${t("diary.mlWaterLogged")}` });
    } catch {
      toast({ title: t("diary.failedWater"), variant: "destructive" });
    }
  };

  const displayDate = date === today
    ? t("diary.today")
    : format(parseISO(date), "EEEE, MMM d");

  const isFuture = date > today;

  return (
    <div className="space-y-6 pb-20 lg:pb-0 stagger">
      {/* Date Navigator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("diary.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{displayDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyYesterday}
            disabled={copying}
            title={t("diary.copyYesterdayHint")}
          >
            {copying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{t("diary.copyYesterday")}</span>
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => navigateDate("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/diary?date=${today}`)}
            disabled={date === today}
          >
            {t("diary.today")}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => navigateDate("next")}
            disabled={isFuture}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center p-6">
          <CalorieRing
            consumed={currentTotals.calories}
            target={calorieTarget}
            percent={caloriePercent}
          />
          <div className="grid grid-cols-3 w-full gap-2 mt-4 text-center text-xs">
            <div>
              <p className="text-muted-foreground">{t("diary.target")}</p>
              <p className="font-semibold">{formatCalories(calorieTarget)}</p>
            </div>
            <div className="border-x border-border">
              <p className="text-muted-foreground">{t("diary.eaten")}</p>
              <p className="font-semibold text-orange-500">{formatCalories(currentTotals.calories)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("diary.left")}</p>
              <p className="font-semibold text-brand-600 dark:text-brand-400">{formatCalories(remaining)}</p>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6 space-y-5">
          <MacroProgress label={t("diary.protein")} consumed={currentTotals.proteinG} target={proteinTarget} color="bg-brand-500" unit="g" />
          <MacroProgress label={t("diary.carbohydrates")} consumed={currentTotals.carbsG} target={carbsTarget} color="bg-blue-500" unit="g" />
          <MacroProgress label={t("diary.fat")} consumed={currentTotals.fatG} target={fatTarget} color="bg-yellow-500" unit="g" />
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <Droplets className="w-4 h-4" />
              <span>{(waterMl / 1000).toFixed(1)}L / {(waterTarget / 1000).toFixed(1)}L water</span>
            </div>
            <div className="flex gap-1">
              {WATER_QUICK_ADD.slice(0, 3).map((ml) => (
                <Button key={ml} variant="muted" size="sm" className="text-xs h-7 px-2" onClick={() => handleWaterAdd(ml)}>
                  +{ml}ml
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Entry Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* NLP Quick Entry */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-brand-500/20 bg-brand-500/5 flex-1">
          <Sparkles className="w-5 h-5 text-brand-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t("diary.nlp.title")}</p>
            <p className="text-xs text-muted-foreground truncate">{t("diary.nlp.placeholder")}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex-shrink-0 border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 hover:border-brand-500"
            onClick={() => setNlpModal({ open: true, mealType: "LUNCH" })}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("diary.nlp.button")}
          </Button>
        </div>

        {/* Photo Analysis Quick Entry */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card sm:w-64 flex-shrink-0">
          <Camera className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium">Photo analysis</p>
              {!isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {isPremium ? "Snap a photo of your meal" : "Premium feature"}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex-shrink-0"
            onClick={() => openPhotoModal("LUNCH")}
          >
            <Camera className="w-3.5 h-3.5" />
            Photo
          </Button>
        </div>
      </div>

      {/* Meal Sections */}
      <div className="space-y-4">
        {(["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as MealType[]).map((mealType) => (
          <MealSection
            key={mealType}
            mealType={mealType}
            entries={mealData[mealType]}
            onAddFood={() => openSearchModal(mealType)}
            onAddNlp={() => openNlpModal(mealType)}
            onDeleteEntry={(id) => handleDeleteEntry(mealType, id)}
          />
        ))}
      </div>

      {/* Food Search Modal */}
      <FoodSearchModal
        open={searchModal.open}
        mealType={searchModal.mealType}
        date={date}
        onClose={() => setSearchModal((prev) => ({ ...prev, open: false }))}
        onAddEntry={handleAddEntry}
      />

      {/* NLP Entry Modal */}
      <NaturalLanguageEntry
        open={nlpModal.open}
        mealType={nlpModal.mealType}
        date={date}
        onClose={() => setNlpModal((prev) => ({ ...prev, open: false }))}
        onAddAIItems={handleAddAIItems}
      />

      {/* Photo Meal Analysis Modal */}
      <PhotoMealAnalysis
        open={photoModal.open}
        mealType={photoModal.mealType}
        date={date}
        isPremium={isPremium}
        onClose={() => setPhotoModal((prev) => ({ ...prev, open: false }))}
        onAddAIItems={handleAddAIItems}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, Sparkles } from "lucide-react";
import type { MealEntry, Food } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { formatCalories } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage } from "@/contexts/language-context";

type MealEntryWithFood = MealEntry & { food: Food };
type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

const MEAL_ICONS: Record<MealType, string> = {
  BREAKFAST: "☀️",
  LUNCH: "🕛",
  DINNER: "🌙",
  SNACK: "🍎",
};

interface MealSectionProps {
  mealType: MealType;
  entries: MealEntryWithFood[];
  onAddFood: () => void;
  onAddNlp?: () => void;
  onDeleteEntry: (id: string) => void;
}

export function MealSection({ mealType, entries, onAddFood, onAddNlp, onDeleteEntry }: MealSectionProps) {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const mealLabel = t(`diary.mealType.${mealType.toLowerCase()}`);

  const total = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
      carbsG: acc.carbsG + e.carbsG,
      fatG: acc.fatG + e.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const itemCount = entries.length;
  const itemLabel = itemCount === 1 ? t("diary.item") : t("diary.items");

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 sm:px-5 py-4 border-b border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
        >
          <span className="text-lg">{MEAL_ICONS[mealType]}</span>
          <div>
            <p className="font-semibold text-sm">{mealLabel}</p>
            <p className="text-xs text-muted-foreground">
              {itemCount === 0
                ? t("diary.noFoodsLogged")
                : `${itemCount} ${itemLabel} · ${formatCalories(total.calories)} kcal`}
            </p>
          </div>
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground ml-auto" />
          )}
        </button>
        <div className="flex items-center gap-1 ml-2">
          {onAddNlp && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={onAddNlp}
              className="text-brand-500 hover:text-brand-600 hover:bg-brand-500/10"
              title={t("diary.nlp.button")}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onAddFood}
            className="text-brand-600 dark:text-brand-400 hover:text-brand-500 hover:bg-brand-500/10"
            title={t("diary.addFood")}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Entries */}
      {!collapsed && (
        <div>
          {entries.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={t("diary.nothingLoggedYet")}
                description={`${t("diary.tapToAdd")} ${mealLabel.toLowerCase()}.`}
                compact
              />
            </div>
          ) : (
            <>
              <div className="divide-y divide-border/50">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-3 hover:bg-secondary/50 group transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.food.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.servings} × {entry.servingSize}{entry.servingUnit}
                        {entry.food.brand ? ` · ${entry.food.brand}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right text-xs text-muted-foreground hidden sm:block">
                        <span>P: {Math.round(entry.proteinG)}g</span>
                        <span className="mx-1">·</span>
                        <span>C: {Math.round(entry.carbsG)}g</span>
                        <span className="mx-1">·</span>
                        <span>F: {Math.round(entry.fatG)}g</span>
                      </div>
                      <span className="text-sm font-semibold w-16 text-right">
                        {formatCalories(entry.calories)} kcal
                      </span>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meal total */}
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between px-3.5 sm:px-5 py-3 bg-muted/20 border-t border-border/50">
                <span className="text-xs text-muted-foreground font-medium">
                  {t("diary.mealTotal")}
                </span>
                <div className="flex w-full items-center justify-between gap-3 text-xs font-semibold sm:w-auto sm:justify-start">
                  <span className="text-muted-foreground truncate">
                    P: {Math.round(total.proteinG)}g · C: {Math.round(total.carbsG)}g · F: {Math.round(total.fatG)}g
                  </span>
                  <span>{formatCalories(total.calories)} kcal</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

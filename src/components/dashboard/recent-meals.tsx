import type { MealEntry, Food } from "@prisma/client";
import { formatCalories, getMealTypeLabel } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { Utensils } from "lucide-react";

type MealEntryWithFood = MealEntry & { food: Food };

interface RecentMealsProps {
  entries: MealEntryWithFood[];
}

export function RecentMeals({ entries }: RecentMealsProps) {
  if (entries.length === 0) {
    return (
      <div className="px-6">
        <EmptyState
          icon={<Utensils className="w-8 h-8" />}
          title="No meals logged yet"
          description="Head to the diary to log your first meal today."
          compact
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between px-4 sm:px-6 py-3 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-600 dark:text-brand-400 text-xs font-bold">
                {getMealTypeLabel(entry.mealType).charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{entry.food.name}</p>
              <p className="text-xs text-muted-foreground">
                {getMealTypeLabel(entry.mealType)} · {entry.servings}×{entry.servingSize}{entry.servingUnit}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <p className="text-sm font-semibold">{formatCalories(entry.calories)} kcal</p>
            <p className="text-xs text-muted-foreground">
              P: {Math.round(entry.proteinG)}g
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

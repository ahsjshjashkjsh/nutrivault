"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

interface MealTypeSelectProps {
  value: MealType;
  onChange: (mealType: MealType) => void;
}

export function MealTypeSelect({ value, onChange }: MealTypeSelectProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <Label>{t("diary.chooseMealType")}</Label>
      <Select value={value} onValueChange={(next) => onChange(next as MealType)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MEAL_TYPES.map((mealType) => (
            <SelectItem key={mealType} value={mealType}>
              {t(`diary.mealType.${mealType.toLowerCase()}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

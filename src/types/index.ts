import type { User, Profile, Goal, Food, MealEntry, WeightEntry, WaterLog } from "@prisma/client";

// ─── Extended Types ───────────────────────────────────────────────────────────

export type UserWithProfile = User & {
  profile: Profile | null;
  goals: Goal[];
};

export type MealEntryWithFood = MealEntry & {
  food: Food;
};

// ─── Daily Summary ────────────────────────────────────────────────────────────

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  meals: {
    BREAKFAST: MealEntryWithFood[];
    LUNCH: MealEntryWithFood[];
    DINNER: MealEntryWithFood[];
    SNACK: MealEntryWithFood[];
  };
}

export interface DailyProgress {
  calories: { consumed: number; target: number; remaining: number };
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
  water: { consumed: number; target: number };
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export interface WeeklyChartData {
  day: string;
  date: string;
  calories: number;
  target: number;
}

export interface WeightChartData {
  date: string;
  weight: number;
}

// ─── Food Search ──────────────────────────────────────────────────────────────

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: number;
  servingUnit: string;
  source?: string;
}

// ─── OpenFoodFacts ────────────────────────────────────────────────────────────

export interface OFFProduct {
  product_name: string;
  brands?: string;
  nutriments: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
  serving_size?: string;
  code?: string;
}

// ─── Session Extension ────────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

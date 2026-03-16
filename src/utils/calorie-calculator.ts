/**
 * Calorie & Macro Calculator
 * Uses Mifflin-St Jeor equation for BMR
 */

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHTLY_ACTIVE"
  | "MODERATELY_ACTIVE"
  | "VERY_ACTIVE"
  | "EXTREMELY_ACTIVE";
export type GoalType =
  | "LOSE_WEIGHT"
  | "MAINTAIN_WEIGHT"
  | "GAIN_WEIGHT"
  | "BUILD_MUSCLE";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTREMELY_ACTIVE: 1.9,
};

const GOAL_CALORIE_ADJUSTMENTS: Record<GoalType, number> = {
  LOSE_WEIGHT: -500,
  MAINTAIN_WEIGHT: 0,
  GAIN_WEIGHT: 300,
  BUILD_MUSCLE: 250,
};

export interface UserMetrics {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
}

export interface NutritionTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "MALE") return base + 5;
  if (gender === "FEMALE") return base - 161;
  return base - 78; // OTHER: average
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Calculate daily calorie target based on goal
 */
export function calculateDailyCalories(metrics: UserMetrics): number {
  const bmr = calculateBMR(
    metrics.weightKg,
    metrics.heightCm,
    metrics.age,
    metrics.gender
  );
  const tdee = calculateTDEE(bmr, metrics.activityLevel);
  const adjustment = GOAL_CALORIE_ADJUSTMENTS[metrics.goalType];
  return Math.round(Math.max(1200, tdee + adjustment));
}

/**
 * Calculate macro targets based on calorie goal and goal type
 * Returns grams of protein, carbs, fat
 */
export function calculateMacroTargets(
  calories: number,
  goalType: GoalType
): { proteinG: number; carbsG: number; fatG: number } {
  // Macro split percentages by goal
  const splits: Record<GoalType, { protein: number; carbs: number; fat: number }> = {
    LOSE_WEIGHT: { protein: 0.40, carbs: 0.30, fat: 0.30 },
    MAINTAIN_WEIGHT: { protein: 0.30, carbs: 0.45, fat: 0.25 },
    GAIN_WEIGHT: { protein: 0.25, carbs: 0.50, fat: 0.25 },
    BUILD_MUSCLE: { protein: 0.35, carbs: 0.45, fat: 0.20 },
  };

  const split = splits[goalType];

  return {
    proteinG: Math.round((calories * split.protein) / 4), // 4 cal/g
    carbsG: Math.round((calories * split.carbs) / 4),     // 4 cal/g
    fatG: Math.round((calories * split.fat) / 9),         // 9 cal/g
  };
}

/**
 * Calculate all nutrition targets for a user
 */
export function calculateNutritionTargets(metrics: UserMetrics): NutritionTargets {
  const calories = calculateDailyCalories(metrics);
  const macros = calculateMacroTargets(calories, metrics.goalType);
  return { calories, ...macros };
}

/**
 * Estimate weeks to reach goal weight
 */
export function estimateWeeksToGoal(
  currentWeight: number,
  targetWeight: number,
  dailyCalorieDeficit: number
): number {
  const weightDiff = Math.abs(targetWeight - currentWeight);
  const weeklyWeightChange = (Math.abs(dailyCalorieDeficit) * 7) / 7700; // ~7700 cal per kg
  if (weeklyWeightChange === 0) return 0;
  return Math.round(weightDiff / weeklyWeightChange);
}

/**
 * Calculate BMI
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Get BMI category label
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

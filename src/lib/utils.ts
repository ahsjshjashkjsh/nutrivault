import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCalories(cal: number): string {
  return Math.round(cal).toLocaleString();
}

export function formatMacro(grams: number): string {
  return Math.round(grams * 10) / 10 + "g";
}

export function formatWeight(kg: number, unit: "kg" | "lbs" = "kg"): string {
  if (unit === "lbs") {
    return (kg * 2.20462).toFixed(1) + " lbs";
  }
  return kg.toFixed(1) + " kg";
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return "text-red-400";
  if (percentage >= 80) return "text-yellow-400";
  return "text-brand-500";
}

export function getProgressBarColor(percentage: number): string {
  if (percentage >= 100) return "bg-red-500";
  if (percentage >= 80) return "bg-yellow-500";
  return "bg-brand-500";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getMealTypeLabel(mealType: string): string {
  const labels: Record<string, string> = {
    BREAKFAST: "Breakfast",
    LUNCH: "Lunch",
    DINNER: "Dinner",
    SNACK: "Snacks",
  };
  return labels[mealType] ?? mealType;
}

export function getActivityLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    SEDENTARY: "Sedentary (little or no exercise)",
    LIGHTLY_ACTIVE: "Lightly Active (1–3 days/week)",
    MODERATELY_ACTIVE: "Moderately Active (3–5 days/week)",
    VERY_ACTIVE: "Very Active (6–7 days/week)",
    EXTREMELY_ACTIVE: "Extremely Active (twice/day, hard exercise)",
  };
  return labels[level] ?? level;
}

export function getGoalTypeLabel(goal: string): string {
  const labels: Record<string, string> = {
    LOSE_WEIGHT: "Lose Weight",
    MAINTAIN_WEIGHT: "Maintain Weight",
    GAIN_WEIGHT: "Gain Weight",
    BUILD_MUSCLE: "Build Muscle",
  };
  return labels[goal] ?? goal;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function percentOf(part: number, total: number): number {
  if (total === 0) return 0;
  return clamp((part / total) * 100, 0, 100);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const APP_NAME = "NutriVault";
export const APP_TAGLINE = "Track. Fuel. Thrive.";
export const APP_DESCRIPTION =
  "The premium nutrition tracker that helps you reach your goals with precision and clarity.";

export const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;

export const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks",
};

export const MEAL_ICONS: Record<string, string> = {
  BREAKFAST: "sunrise",
  LUNCH: "sun",
  DINNER: "moon",
  SNACK: "cookie",
};

export const ACTIVITY_LEVELS = [
  { value: "SEDENTARY", label: "Sedentary", description: "Little or no exercise" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly Active", description: "1–3 days/week" },
  { value: "MODERATELY_ACTIVE", label: "Moderately Active", description: "3–5 days/week" },
  { value: "VERY_ACTIVE", label: "Very Active", description: "6–7 days/week" },
  { value: "EXTREMELY_ACTIVE", label: "Extremely Active", description: "Twice/day, hard exercise" },
] as const;

export const GOAL_TYPES = [
  {
    value: "LOSE_WEIGHT",
    label: "Lose Weight",
    description: "Burn fat and reduce body weight",
    icon: "trending-down",
    color: "text-blue-400",
  },
  {
    value: "MAINTAIN_WEIGHT",
    label: "Maintain Weight",
    description: "Stay at your current weight",
    icon: "minus",
    color: "text-green-400",
  },
  {
    value: "GAIN_WEIGHT",
    label: "Gain Weight",
    description: "Healthy weight gain",
    icon: "trending-up",
    color: "text-orange-400",
  },
  {
    value: "BUILD_MUSCLE",
    label: "Build Muscle",
    description: "Increase lean muscle mass",
    icon: "zap",
    color: "text-purple-400",
  },
] as const;

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Prefer not to say" },
];

export const SERVING_UNITS = ["g", "ml", "oz", "cup", "tbsp", "tsp", "piece", "slice", "serving"];

export const WATER_QUICK_ADD = [150, 250, 350, 500];

export const DEFAULT_WATER_GOAL_ML = 2500;

export const MACRO_COLORS = {
  protein: "#22c55e",
  carbs: "#3b82f6",
  fat: "#f59e0b",
} as const;

export const CHART_COLORS = {
  primary: "#22c55e",
  secondary: "#3b82f6",
  muted: "#475569",
  grid: "#1e293b",
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/diary", label: "Food Diary", icon: "book-open" },
  { href: "/progress", label: "Progress", icon: "bar-chart-2" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

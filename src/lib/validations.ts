import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Onboarding ──────────────────────────────────────────────────────────────

export const onboardingSchema = z.object({
  age: z.coerce.number().min(13, "Must be at least 13").max(120, "Please enter a valid age"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    required_error: "Please select a gender",
  }),
  heightCm: z.coerce
    .number()
    .min(100, "Height must be at least 100 cm")
    .max(250, "Please enter a valid height"),
  currentWeightKg: z.coerce
    .number()
    .min(20, "Weight must be at least 20 kg")
    .max(500, "Please enter a valid weight"),
  targetWeightKg: z.coerce
    .number()
    .min(20, "Target weight must be at least 20 kg")
    .max(500, "Please enter a valid target weight"),
  activityLevel: z.enum(
    ["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE", "EXTREMELY_ACTIVE"],
    { required_error: "Please select an activity level" }
  ),
  goalType: z.enum(["LOSE_WEIGHT", "MAINTAIN_WEIGHT", "GAIN_WEIGHT", "BUILD_MUSCLE"], {
    required_error: "Please select a goal",
  }),
});

// ─── Profile ─────────────────────────────────────────────────────────────────

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  age: z.coerce.number().min(13).max(120).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  heightCm: z.coerce.number().min(100).max(250).optional(),
  currentWeightKg: z.coerce.number().min(20).max(500).optional(),
  targetWeightKg: z.coerce.number().min(20).max(500).optional(),
  activityLevel: z
    .enum(["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE", "EXTREMELY_ACTIVE"])
    .optional(),
  goalType: z
    .enum(["LOSE_WEIGHT", "MAINTAIN_WEIGHT", "GAIN_WEIGHT", "BUILD_MUSCLE"])
    .optional(),
});

// ─── Meal Entry ───────────────────────────────────────────────────────────────

export const mealEntrySchema = z.object({
  foodId: z.string().min(1, "Food is required"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  date: z.string().min(1, "Date is required"),
  servings: z.coerce.number().min(0.1, "Servings must be greater than 0").max(100),
  servingSize: z.coerce.number().min(0.1, "Serving size must be greater than 0"),
  servingUnit: z.string().min(1, "Serving unit is required"),
});

export const mealEntryUpdateSchema = z.object({
  servings: z.coerce.number().min(0.1, "Servings must be greater than 0").max(100).optional(),
  servingSize: z.coerce.number().min(0.1, "Serving size must be greater than 0").max(10000).optional(),
});

// ─── Custom Food ──────────────────────────────────────────────────────────────

export const customFoodSchema = z.object({
  name: z.string().min(1, "Food name is required").max(100),
  brand: z.string().max(100).optional(),
  calories: z.coerce.number().min(0, "Calories must be positive").max(10000),
  proteinG: z.coerce.number().min(0).max(1000),
  carbsG: z.coerce.number().min(0).max(1000),
  fatG: z.coerce.number().min(0).max(1000),
  fiberG: z.coerce.number().min(0).max(1000).optional(),
  sugarG: z.coerce.number().min(0).max(1000).optional(),
  servingSize: z.coerce.number().min(0.1, "Serving size must be greater than 0"),
  servingUnit: z.string().min(1, "Serving unit is required"),
});

// ─── Weight Entry ─────────────────────────────────────────────────────────────

export const weightEntrySchema = z.object({
  weightKg: z.coerce
    .number()
    .min(20, "Weight must be at least 20 kg")
    .max(500, "Please enter a valid weight"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(500).optional(),
});

// ─── Water Log ────────────────────────────────────────────────────────────────

export const waterLogSchema = z.object({
  amountMl: z.coerce
    .number()
    .min(50, "Amount must be at least 50 ml")
    .max(5000, "Please enter a valid amount"),
  date: z.string().min(1, "Date is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type MealEntryInput = z.infer<typeof mealEntrySchema>;
export type CustomFoodInput = z.infer<typeof customFoodSchema>;
export type WeightEntryInput = z.infer<typeof weightEntrySchema>;
export type WaterLogInput = z.infer<typeof waterLogSchema>;

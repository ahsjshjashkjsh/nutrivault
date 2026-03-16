/**
 * AI-backed nutrition target calculator.
 * Calls OpenAI to calculate personalized targets using the user's full profile.
 * Falls back to the local Mifflin-St Jeor calculation when OpenAI is unavailable.
 */

import {
  calculateNutritionTargets,
  calculateBMR,
  calculateTDEE,
  type UserMetrics,
  type NutritionTargets,
} from "@/utils/calorie-calculator";

// ── Public types ─────────────────────────────────────────────────────────────

export interface ExtendedMetrics extends UserMetrics {
  targetWeightKg?: number;
}

export interface AICalorieTargets extends NutritionTargets {
  maintenanceCalories: number;
  explanation: string;
  source: "ai" | "local";
}

// ── Label maps ───────────────────────────────────────────────────────────────

const ACTIVITY_LABELS: Record<string, string> = {
  SEDENTARY: "sedentary (little or no exercise)",
  LIGHTLY_ACTIVE: "lightly active (1–3 exercise days/week)",
  MODERATELY_ACTIVE: "moderately active (3–5 exercise days/week)",
  VERY_ACTIVE: "very active (6–7 exercise days/week)",
  EXTREMELY_ACTIVE: "extremely active (twice/day, hard exercise)",
};

const GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: "lose weight (fat loss, calorie deficit)",
  MAINTAIN_WEIGHT: "maintain current weight",
  GAIN_WEIGHT: "gain weight (healthy bulk)",
  BUILD_MUSCLE: "build muscle (lean bulk, prioritize protein)",
};

// ── Main export ───────────────────────────────────────────────────────────────

export async function calculateCalorieTargetsWithAI(
  metrics: ExtendedMetrics
): Promise<AICalorieTargets> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return localFallback(metrics);
  }

  try {
    const prompt = buildPrompt(metrics);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(content);
    return validateAndNormalize(parsed, metrics);
  } catch (error) {
    console.warn("[calorie-ai] OpenAI failed, using local fallback:", error);
    return localFallback(metrics);
  }
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(metrics: ExtendedMetrics): string {
  const genderLabel = metrics.gender === "MALE" ? "male" : metrics.gender === "FEMALE" ? "female" : "other";

  return `You are a registered dietitian. Calculate precise daily nutrition targets for this person.

USER PROFILE:
- Age: ${metrics.age} years
- Gender: ${genderLabel}
- Height: ${metrics.heightCm} cm
- Current weight: ${metrics.weightKg} kg${metrics.targetWeightKg ? `\n- Target weight: ${metrics.targetWeightKg} kg` : ""}
- Activity level: ${ACTIVITY_LABELS[metrics.activityLevel] || metrics.activityLevel}
- Goal: ${GOAL_LABELS[metrics.goalType] || metrics.goalType}

INSTRUCTIONS:
1. Calculate BMR using Mifflin-St Jeor equation
2. Multiply by the correct activity factor for TDEE (maintenance calories)
3. Apply a goal-appropriate calorie adjustment:
   - Lose weight: subtract 300–500 kcal (limit to −500 max)
   - Maintain: 0 adjustment
   - Gain weight: add 200–300 kcal
   - Build muscle: add 200–250 kcal (protein-focused)
4. Minimum daily calories: 1200 kcal for females, 1500 kcal for males
5. Calculate macro targets in grams based on the adjusted calories and goal
6. Write a short, friendly 1–2 sentence explanation mentioning the key numbers

RETURN ONLY VALID JSON (no markdown, no extra keys):
{
  "maintenanceCalories": number,
  "dailyCalories": number,
  "proteinG": number,
  "carbsG": number,
  "fatG": number,
  "explanation": "string"
}`;
}

// ── Response validator ────────────────────────────────────────────────────────

function validateAndNormalize(
  parsed: Record<string, unknown>,
  metrics: ExtendedMetrics
): AICalorieTargets {
  const dailyCalories = Number(parsed.dailyCalories);
  const proteinG = Number(parsed.proteinG);
  const carbsG = Number(parsed.carbsG);
  const fatG = Number(parsed.fatG);
  const maintenanceCalories = Number(parsed.maintenanceCalories);

  const minCalories = metrics.gender === "FEMALE" ? 1200 : 1500;

  if (
    !isFinite(dailyCalories) || dailyCalories < minCalories || dailyCalories > 8000 ||
    !isFinite(proteinG)      || proteinG < 20  || proteinG > 500 ||
    !isFinite(carbsG)        || carbsG < 0     || carbsG > 1000  ||
    !isFinite(fatG)          || fatG < 10      || fatG > 500     ||
    !isFinite(maintenanceCalories) || maintenanceCalories < 800
  ) {
    throw new Error("AI returned out-of-range nutrition values");
  }

  return {
    calories: Math.round(dailyCalories),
    proteinG: Math.round(proteinG),
    carbsG: Math.round(carbsG),
    fatG: Math.round(fatG),
    maintenanceCalories: Math.round(maintenanceCalories),
    explanation:
      typeof parsed.explanation === "string" && parsed.explanation.length > 0
        ? parsed.explanation
        : "",
    source: "ai",
  };
}

// ── Local fallback ────────────────────────────────────────────────────────────

function localFallback(metrics: ExtendedMetrics): AICalorieTargets {
  const targets = calculateNutritionTargets(metrics);
  const bmr = calculateBMR(metrics.weightKg, metrics.heightCm, metrics.age, metrics.gender);
  const maintenanceCalories = Math.round(calculateTDEE(bmr, metrics.activityLevel));

  const goalPhrases: Record<string, string> = {
    LOSE_WEIGHT: "a 500 kcal daily deficit to support fat loss",
    MAINTAIN_WEIGHT: "your current maintenance level",
    GAIN_WEIGHT: "a 300 kcal daily surplus for healthy weight gain",
    BUILD_MUSCLE: "a 250 kcal surplus with high protein to support muscle growth",
  };

  const phrase = goalPhrases[metrics.goalType] || "your selected goal";
  const explanation = `Your daily target of ${targets.calories.toLocaleString()} kcal is based on your Basal Metabolic Rate (${Math.round(bmr).toLocaleString()} kcal), adjusted for your activity level (maintenance: ${maintenanceCalories.toLocaleString()} kcal), and ${phrase}.`;

  return {
    ...targets,
    maintenanceCalories,
    explanation,
    source: "local",
  };
}

/**
 * NutriVault Nutrition Agent
 *
 * Provides intelligent meal analysis:
 *  - analyzeMealWithAI: calls OpenAI, auto-creates missing foods in DB, returns food IDs
 *  - analyzeMeal: local parser fallback (no API key needed)
 *  - generateNutritionResponse: chat response generator (local)
 */

import { parseMealDescription, getTotalNutrition, type ParsedFoodItem } from "./food-parser";
import { prisma } from "./prisma";

// ── Public types ───────────────────────────────────────────────────────────────

export interface NutritionAnalysis {
  items: ParsedFoodItem[];
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  confidence: "high" | "medium" | "low";
  notes: string[];
  tips: string[];
}

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIMealFood {
  name: string;
  brand?: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG?: number;
  fiberG?: number;
  servingSize: number;
  servingUnit: string;
  servings: number;
  foodId: string;   // real DB id (existing or newly created)
  isNew: boolean;   // true if AI auto-created this food
  isEstimated: boolean;
}

export interface AIMealAnalysis {
  foods: AIMealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes: string;
  confidence: number; // 0–1
  source: "ai" | "local";
}

// ── OpenAI helper ──────────────────────────────────────────────────────────────

interface OpenAIFood {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  fiber?: number;
  serving: string;     // e.g. "1 large egg (50g)"
  servingGrams: number; // numeric grams for that serving
}

interface OpenAIResponse {
  foods: OpenAIFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes: string;
  confidence: number;
}

async function callOpenAI(mealDescription: string): Promise<OpenAIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const systemPrompt = `You are an expert nutritionist. Given a meal description, return a JSON object with realistic nutrition estimates.

RULES:
- Use standard nutrition databases (USDA, generic values)
- Estimate realistic portion sizes when not specified
- For each food, provide per-serving values (not per 100g)
- servingGrams must be the weight in grams of that serving (e.g., 1 large egg = 50g)
- confidence should be 0.0–1.0 (lower if quantities are vague)
- notes should contain any important assumptions made

RETURN ONLY VALID JSON, no markdown, no explanations.

JSON structure:
{
  "foods": [
    {
      "name": "string (common food name)",
      "brand": "string or null",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "sugar": number or null,
      "fiber": number or null,
      "serving": "string description e.g. '2 large eggs'",
      "servingGrams": number
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "notes": "string",
  "confidence": number
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this meal: "${mealDescription}"` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`OpenAI API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  return JSON.parse(content) as OpenAIResponse;
}

// ── DB: find or create food ────────────────────────────────────────────────────

async function findOrCreateFood(
  food: OpenAIFood,
  userId: string
): Promise<{ id: string; isNew: boolean }> {
  // Try exact name match (case-insensitive) in public + user foods
  const existing = await prisma.food.findFirst({
    where: {
      OR: [{ isPublic: true }, { createdBy: userId }],
      name: { equals: food.name, mode: "insensitive" },
    },
    orderBy: { createdAt: "asc" },
  });

  if (existing) return { id: existing.id, isNew: false };

  // Not found — create it as an AI-generated food
  const created = await prisma.food.create({
    data: {
      name: food.name,
      brand: food.brand || null,
      calories: Math.max(0, Math.round(food.calories * 10) / 10),
      proteinG: Math.max(0, Math.round(food.protein * 10) / 10),
      carbsG: Math.max(0, Math.round(food.carbs * 10) / 10),
      fatG: Math.max(0, Math.round(food.fat * 10) / 10),
      sugarG: food.sugar != null ? Math.max(0, Math.round(food.sugar * 10) / 10) : null,
      fiberG: food.fiber != null ? Math.max(0, Math.round(food.fiber * 10) / 10) : null,
      servingSize: food.servingGrams > 0 ? food.servingGrams : 100,
      servingUnit: "g",
      isPublic: false,
      source: "ai",
      createdBy: userId,
    },
  });

  return { id: created.id, isNew: true };
}

// ── Main: analyze with AI + auto-create foods ──────────────────────────────────

export async function analyzeMealWithAI(
  description: string,
  userId: string
): Promise<AIMealAnalysis> {
  // Try OpenAI first
  try {
    const aiResult = await callOpenAI(description);

    const foods: AIMealFood[] = [];

    for (const item of aiResult.foods) {
      if (!item.name) continue;

      const { id, isNew } = await findOrCreateFood(item, userId);

      foods.push({
        name: item.name,
        brand: item.brand || undefined,
        calories: Math.round(item.calories),
        proteinG: Math.round(item.protein * 10) / 10,
        carbsG: Math.round(item.carbs * 10) / 10,
        fatG: Math.round(item.fat * 10) / 10,
        sugarG: item.sugar != null ? Math.round(item.sugar * 10) / 10 : undefined,
        fiberG: item.fiber != null ? Math.round(item.fiber * 10) / 10 : undefined,
        servingSize: item.servingGrams > 0 ? item.servingGrams : 100,
        servingUnit: "g",
        servings: 1,
        foodId: id,
        isNew,
        isEstimated: true,
      });
    }

    return {
      foods,
      totalCalories: Math.round(aiResult.totalCalories),
      totalProtein: Math.round(aiResult.totalProtein * 10) / 10,
      totalCarbs: Math.round(aiResult.totalCarbs * 10) / 10,
      totalFat: Math.round(aiResult.totalFat * 10) / 10,
      notes: aiResult.notes || "",
      confidence: Math.min(1, Math.max(0, aiResult.confidence ?? 0.7)),
      source: "ai",
    };
  } catch (error) {
    console.warn("[nutrition-agent] OpenAI unavailable, falling back to local parser:", error);

    // Fallback: local parser
    return analyzeMealLocal(description, userId);
  }
}

// ── Local fallback ──────────────────────────────────────────────────────────────

async function analyzeMealLocal(
  description: string,
  userId: string
): Promise<AIMealAnalysis> {
  const parsed = parseMealDescription(description);
  const totals = getTotalNutrition(parsed);

  const foods: AIMealFood[] = [];

  for (const item of parsed) {
    // Try to find a matching food in DB
    const dbFood = await prisma.food.findFirst({
      where: {
        OR: [{ isPublic: true }, { createdBy: userId }],
        name: { contains: item.name, mode: "insensitive" },
      },
    });

    let foodId: string;
    let isNew = false;

    if (dbFood) {
      foodId = dbFood.id;
    } else {
      // Create a placeholder food from parser values
      const created = await prisma.food.create({
        data: {
          name: item.name,
          calories: Math.max(0, item.calories),
          proteinG: Math.max(0, item.proteinG),
          carbsG: Math.max(0, item.carbsG),
          fatG: Math.max(0, item.fatG),
          servingSize: item.servingGrams > 0 ? item.servingGrams : 100,
          servingUnit: "g",
          isPublic: false,
          source: "ai",
          createdBy: userId,
        },
      });
      foodId = created.id;
      isNew = true;
    }

    foods.push({
      name: item.name,
      calories: item.calories,
      proteinG: item.proteinG,
      carbsG: item.carbsG,
      fatG: item.fatG,
      servingSize: item.servingGrams > 0 ? item.servingGrams : 100,
      servingUnit: "g",
      servings: 1,
      foodId,
      isNew,
      isEstimated: true,
    });
  }

  return {
    foods,
    totalCalories: Math.round(totals.calories),
    totalProtein: Math.round(totals.proteinG * 10) / 10,
    totalCarbs: Math.round(totals.carbsG * 10) / 10,
    totalFat: Math.round(totals.fatG * 10) / 10,
    notes: "Estimated using offline food database",
    confidence: 0.5,
    source: "local",
  };
}

// ── Health assessment ──────────────────────────────────────────────────────────

function assessMealBalance(
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number
): { score: number; labels: string[] } {
  const labels: string[] = [];
  let score = 50;

  const totalMacroKcal = proteinG * 4 + carbsG * 4 + fatG * 9;
  if (totalMacroKcal > 0) {
    const proteinPct = (proteinG * 4) / totalMacroKcal;
    const carbsPct = (carbsG * 4) / totalMacroKcal;
    const fatPct = (fatG * 9) / totalMacroKcal;

    if (proteinPct >= 0.25) { score += 15; labels.push("high-protein"); }
    if (proteinPct < 0.1) { score -= 10; labels.push("low-protein"); }
    if (carbsPct >= 0.4 && carbsPct <= 0.6) { score += 10; labels.push("balanced-carbs"); }
    if (carbsPct > 0.7) { score -= 5; labels.push("high-carb"); }
    if (fatPct <= 0.35) { score += 5; }
    if (fatPct > 0.5) { score -= 10; labels.push("high-fat"); }
  }

  if (calories < 150) labels.push("very-light");
  if (calories >= 150 && calories < 400) labels.push("light");
  if (calories >= 400 && calories < 700) labels.push("moderate");
  if (calories >= 700 && calories < 1000) labels.push("filling");
  if (calories >= 1000) labels.push("very-filling");

  return { score: Math.max(0, Math.min(100, score)), labels };
}

// ── Local analyze (used by chat) ───────────────────────────────────────────────

export function analyzeMeal(description: string): NutritionAnalysis {
  const items = parseMealDescription(description);
  const totals = getTotalNutrition(items);
  const { labels } = assessMealBalance(
    totals.calories,
    totals.proteinG,
    totals.carbsG,
    totals.fatG
  );

  const notes: string[] = [];
  const tips: string[] = [];

  const confidence: NutritionAnalysis["confidence"] =
    items.length === 0 ? "low" : "medium";

  if (totals.proteinG < 15)
    tips.push("💡 Low protein. Consider adding chicken, eggs, Greek yogurt, or legumes.");
  if (totals.proteinG >= 30)
    tips.push("✅ Great protein content — supports muscle maintenance and satiety.");
  if (totals.carbsG > 80)
    tips.push("💡 High carbs — ideal before a workout for energy.");
  if (totals.fatG > 40)
    tips.push("💡 High fat content. Prefer healthy fats like avocado, nuts, or olive oil.");
  if (totals.calories < 200 && items.length > 0)
    tips.push("💡 Very light meal. You may want to add more to meet your daily targets.");
  if (totals.calories > 900)
    tips.push("💡 Calorie-dense meal. Keep track of your remaining daily budget.");
  if (labels.includes("high-protein") && labels.includes("balanced-carbs"))
    tips.push("✅ Well-balanced macros — great for recovery or steady energy.");

  return { items, totals, confidence, notes, tips };
}

// ── Chat response generator ────────────────────────────────────────────────────

export function generateNutritionResponse(userMessage: string, history: AgentMessage[] = []): string {
  const msg = userMessage.toLowerCase().trim();

  if (/^(hi|hello|hey|hola|bonjour|ciao|hallo|salve|buongiorno|buonasera)[\s!?.,]*$/.test(msg)) {
    return "Hello! I'm your nutrition assistant. I can:\n\n• **Analyze meals** — \"Analyze: 2 eggs, toast and coffee\"\n• **Estimate calories** — \"Calories in a banana\"\n• **Give nutrition tips** — \"How to increase protein?\"\n• **Suggest meals** — \"High-protein breakfast ideas\"\n\nWhat would you like to know?";
  }

  const analyzeMatch =
    msg.match(/^(?:analyze|analyse)[:\s]+(.+)/i) ||
    msg.match(/^(?:how (?:many )?(?:calories?|kcal)(?:.+)?in )\s*(.+)/i) ||
    msg.match(/^calories?\s+(?:in|for|of)\s+(.+)/i) ||
    msg.match(/^(?:macros?\s+(?:for|in|of))\s+(.+)/i);

  if (analyzeMatch) {
    const foodDesc = analyzeMatch[analyzeMatch.length - 1];
    const analysis = analyzeMeal(foodDesc);

    if (analysis.items.length === 0) {
      return `I couldn't identify specific foods in "${foodDesc}".\n\nTry being more specific. For example:\n• "2 eggs, toast with butter, coffee"\n• "150g chicken breast with 200g rice and salad"\n• "1 apple and a bowl of oatmeal"`;
    }

    const lines = analysis.items.map(
      (item) =>
        `• **${item.displayName}**: ~${item.calories} kcal (P: ${item.proteinG}g | C: ${item.carbsG}g | F: ${item.fatG}g)`
    );

    let response = `**Meal Analysis** _(estimated values)_\n\n${lines.join("\n")}\n\n`;
    response += `**Total:** ~${analysis.totals.calories} kcal\n`;
    response += `Protein: ${Math.round(analysis.totals.proteinG)}g | Carbs: ${Math.round(analysis.totals.carbsG)}g | Fat: ${Math.round(analysis.totals.fatG)}g\n\n`;

    if (analysis.tips.length > 0) {
      response += analysis.tips.join("\n");
    }

    return response;
  }

  if (/is (?:this|my|the|it) (?:meal |food |dish )?healthy/.test(msg) || /healthy\?/.test(msg)) {
    return "To assess if a meal is healthy, I need to know what it contains.\n\nTry:\n\"Is 2 eggs, toast with butter and coffee healthy?\"\n\nI'll give you a full macro breakdown and health tips.";
  }

  const whatIsMatch = msg.match(/what(?:'s| is) (?:in |the nutrition of |the calories? in )?(.+)/);
  if (whatIsMatch) {
    const foodDesc = whatIsMatch[1];
    const analysis = analyzeMeal(foodDesc);
    if (analysis.items.length > 0) {
      const lines = analysis.items.map((i) => `• **${i.displayName}**: ~${i.calories} kcal`);
      return `**Nutritional estimate for: ${foodDesc}**\n\n${lines.join("\n")}\n\nTotal: ~${analysis.totals.calories} kcal | P: ${Math.round(analysis.totals.proteinG)}g | C: ${Math.round(analysis.totals.carbsG)}g | F: ${Math.round(analysis.totals.fatG)}g\n\n_Values are estimates based on typical serving sizes._`;
    }
  }

  if (/increase (?:my )?protein|more protein|high.?protein|protein intake|protein goal|boost protein/.test(msg)) {
    return "**How to increase protein intake:**\n\n• Add eggs or egg whites to meals (~6g per egg)\n• Include chicken breast, turkey, or fish at main meals\n• Swap regular yogurt for Greek yogurt (~9g per 150g)\n• Add a protein shake as a snack (20–30g per serving)\n• Include legumes: lentils, chickpeas, black beans (~9g per 130g)\n• Sprinkle nuts or seeds on salads and yogurt\n\n**Highest protein foods per 100g:**\n• Chicken breast: 31g\n• Tuna: 25g\n• Turkey breast: 29g\n• Eggs: 13g\n• Greek yogurt: 9g\n• Lentils: 9g\n• Cottage cheese: 11g";
  }

  if (/after (?:training|workout|exercise|gym|run)|post.?workout|post.?exercise/.test(msg)) {
    return "**Post-workout nutrition:**\n\nEat within 30–60 minutes after training.\n\n**Goals:**\n• Protein: 20–40g to repair muscle\n• Carbs: to replenish glycogen\n• Low fat: slows digestion — keep minimal\n\n**Good choices:**\n• Chicken breast + rice + vegetables (~520 kcal)\n• Protein shake + banana (~350 kcal)\n• Greek yogurt + granola + berries (~350 kcal)\n• Eggs on whole wheat toast (~380 kcal)\n• Cottage cheese + fruit (~280 kcal)\n\n🏋️ Both protein AND carbs are needed for optimal recovery.";
  }

  if (/before (?:training|workout|exercise|gym)|pre.?workout/.test(msg)) {
    return "**Pre-workout nutrition:**\n\nEat 1–2 hours before training.\n\n**Focus on:**\n• Complex carbs for sustained energy\n• Moderate protein\n• Low fat and low fiber (avoid digestive issues)\n\n**Good choices:**\n• Oatmeal with banana (~400 kcal)\n• Rice cakes with peanut butter (~300 kcal)\n• Chicken breast with sweet potato (~430 kcal)\n• Toast with eggs (~360 kcal)";
  }

  if (/lose weight|weight loss|cut calories|calorie deficit|slim|diet/.test(msg)) {
    return "**Tips for sustainable weight loss:**\n\n• Create a moderate deficit of 300–500 kcal/day\n• Prioritize protein (keeps you full, preserves muscle)\n• Fill half your plate with vegetables\n• Limit ultra-processed foods, sugary drinks, alcohol\n• Stay well hydrated — thirst is often mistaken for hunger\n• Avoid skipping meals — eat smaller, regular meals\n\n**Best foods for fat loss:**\n• Vegetables, lean protein (chicken, fish, eggs)\n• Legumes, Greek yogurt, cottage cheese\n\n⚠️ Avoid extreme restriction — aim for long-term habits.";
  }

  if (/build muscle|gain muscle|bulking|muscle mass|hypertrophy/.test(msg)) {
    return "**Nutrition for muscle gain:**\n\n• Eat in a slight surplus: 200–300 kcal above maintenance\n• Protein: 1.6–2.2g per kg of body weight daily\n• Don't skip carbs — they fuel training and recovery\n• Spread protein across 4–5 meals per day\n\n**Best muscle-building foods:**\n• Chicken breast, lean beef, eggs, salmon\n• Rice, pasta, oats, sweet potato\n• Greek yogurt, cottage cheese\n• Nuts, olive oil (for healthy fats)";
  }

  if (/how much water|water intake|hydration|drink water|daily water/.test(msg)) {
    return "**Daily water intake:**\n\n• General recommendation: 2–3 liters per day\n• Athletes and active people: 3–4 liters\n• Increase in hot weather or high-intensity exercise\n\n**Practical tips:**\n• Start your day with a large glass of water\n• Drink a glass before each meal\n• Use NutriVault's water tracker to log intake\n• Herbal tea and water-rich foods (cucumber, watermelon) also count";
  }

  if (/what are macros|explain macros|macronutrients|what(?:'s| is) protein|what(?:'s| is) carb/.test(msg)) {
    return "**Macronutrients (Macros):**\n\n**Protein** — 4 kcal/g\nBuilds and repairs muscle. Sources: meat, fish, eggs, dairy, legumes.\n\n**Carbohydrates** — 4 kcal/g\nPrimary energy source. Sources: grains, fruits, vegetables, legumes.\n\n**Fat** — 9 kcal/g\nHormone production, cell health, vitamin absorption. Sources: oils, nuts, avocado, fatty fish.\n\n**Typical balanced ratios:**\n• Protein: 25–35% of calories\n• Carbohydrates: 40–55%\n• Fat: 20–35%";
  }

  if (/improve (?:this |my |the )?meal|make (?:this |my )?meal (?:better|healthier)|how can i (?:make|improve)/.test(msg)) {
    return "To help you improve a meal, tell me what's in it. For example:\n\n\"How can I improve: pasta with tomato sauce and cheese?\"\n\nI'll analyze it and suggest specific improvements to the nutrition profile.";
  }

  if (/breakfast|morning meal/.test(msg) && /suggest|idea|what to eat|recommend|option/.test(msg)) {
    return "**Healthy breakfast ideas:**\n\n🥣 **High protein:**\n• Greek yogurt with granola and berries (~350 kcal, 20g protein)\n• 3 scrambled eggs with whole wheat toast (~450 kcal, 28g protein)\n• Cottage cheese with fruit (~280 kcal, 22g protein)\n\n⚡ **High energy:**\n• Oatmeal with banana and peanut butter (~450 kcal)\n• Whole grain cereal with milk and berries (~380 kcal)\n\n⏱️ **Quick:**\n• 2 boiled eggs + coffee (~180 kcal)\n• Protein shake + banana (~350 kcal)";
  }

  if (/(lunch|dinner|supper)/.test(msg) && /(?:idea|suggest|recommend|what to eat|option)/.test(msg)) {
    return "**Balanced meal ideas:**\n\n🍗 **High protein:**\n• Grilled chicken + rice + broccoli (~520 kcal, 45g protein)\n• Salmon fillet + sweet potato + salad (~580 kcal, 38g protein)\n• Turkey wrap with vegetables (~450 kcal, 36g protein)\n\n🥗 **Lighter options:**\n• Large mixed salad with tuna (~320 kcal, 28g protein)\n• Lentil soup with whole grain bread (~380 kcal)\n• Greek salad with grilled chicken (~350 kcal)\n\nAim for protein + complex carbs + vegetables at each main meal.";
  }

  if (/snack/.test(msg) && /suggest|idea|what to eat|recommend|option|healthy/.test(msg)) {
    return "**Healthy snack ideas:**\n\n• Greek yogurt + berries (~180 kcal, 10g protein)\n• Apple + peanut butter (~250 kcal)\n• Hard-boiled eggs (~150 kcal, 12g protein)\n• Almonds (30g) (~170 kcal, 6g protein)\n• Rice cake + cottage cheese (~200 kcal, 14g protein)\n• Protein bar (~200–350 kcal, 20g protein)\n\nAim for snacks with both protein and fiber to stay full.";
  }

  const genericAnalysis = analyzeMeal(msg);
  if (genericAnalysis.items.length > 0) {
    const totals = genericAnalysis.totals;
    const lines = genericAnalysis.items.map(
      (item) => `• **${item.displayName}**: ~${item.calories} kcal`
    );
    let response = `**Estimated nutrition:**\n\n${lines.join("\n")}\n\nTotal: ~${totals.calories} kcal | P: ${Math.round(totals.proteinG)}g | C: ${Math.round(totals.carbsG)}g | F: ${Math.round(totals.fatG)}g`;
    if (genericAnalysis.tips.length > 0) {
      response += `\n\n${genericAnalysis.tips[0]}`;
    }
    response += `\n\n_Values are estimates. Add foods to your diary for accurate tracking._`;
    return response;
  }

  const improveMatch = msg.match(/(?:improve|better|healthier)(?:[:\s]+)?(.+)/);
  if (improveMatch) {
    const foodDesc = improveMatch[1];
    const analysis = analyzeMeal(foodDesc);
    if (analysis.items.length > 0) {
      const suggestions: string[] = [];
      if (analysis.totals.proteinG < 20) suggestions.push("• Add a protein source: chicken, eggs, or Greek yogurt");
      if (analysis.totals.fatG > 30) suggestions.push("• Reduce added fats/oils or use smaller portions");
      if (analysis.totals.carbsG > 60) suggestions.push("• Consider swapping refined carbs for whole grains");
      suggestions.push("• Add more vegetables for fiber and micronutrients");

      return `**How to improve this meal:**\n\nCurrent: ~${analysis.totals.calories} kcal (P: ${Math.round(analysis.totals.proteinG)}g | C: ${Math.round(analysis.totals.carbsG)}g | F: ${Math.round(analysis.totals.fatG)}g)\n\n**Suggestions:**\n${suggestions.join("\n")}`;
    }
  }

  return "I can help you with:\n\n• **Meal analysis** — \"Analyze: 2 eggs and toast\"\n• **Calorie lookup** — \"Calories in a banana\"\n• **Nutrition tips** — \"How to increase protein?\"\n• **Meal ideas** — \"Suggest a high-protein breakfast\"\n• **Meal improvement** — \"How can I improve pasta with cheese?\"\n• **Health goals** — \"Tips for weight loss\"\n\nWhat would you like to know?";
}

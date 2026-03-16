import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface VisionFood {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  fiber?: number;
  serving: string;
  servingGrams: number;
}

interface VisionResponse {
  foods: VisionFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes: string;
  confidence: number;
}

async function findOrCreateFood(
  food: VisionFood,
  userId: string
): Promise<{ id: string; isNew: boolean }> {
  const existing = await prisma.food.findFirst({
    where: {
      OR: [{ isPublic: true }, { createdBy: userId }],
      name: { equals: food.name },
    },
    orderBy: { createdAt: "asc" },
  });

  if (existing) return { id: existing.id, isNew: false };

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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify premium access from the database (never trust client)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });

    if (!user?.isPremium) {
      return NextResponse.json(
        { error: "Premium subscription required for photo meal analysis." },
        { status: 403 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured. Please try manual entry." },
        { status: 503 }
      );
    }

    // Parse multipart form
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image is too large. Please use an image under 10 MB." },
        { status: 400 }
      );
    }

    // Convert to base64 for OpenAI
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageFile.type;

    // Use a vision-capable model; fall back gracefully if env var is not a vision model
    const model = process.env.OPENAI_MODEL || "gpt-4o";

    const openAIRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `You are an expert nutritionist and food recognition AI. Analyze the food visible in the image and provide accurate nutrition estimates.

RULES:
- Identify every visible food and drink item
- Estimate realistic portion sizes based on visual cues (plate size, utensils, context)
- Use standard nutrition database values (USDA, typical recipes)
- Provide per-serving values for what is shown — not per 100g
- servingGrams must be the estimated weight in grams of the visible portion
- confidence should be 0.0–1.0 (lower when the image is unclear or portions are ambiguous)
- notes should mention any assumptions made (e.g., "assumed standard slice weight")

RETURN ONLY VALID JSON, no markdown, no explanations.

JSON structure:
{
  "foods": [
    {
      "name": "string (common food name, lowercase)",
      "brand": "string or null",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "sugar": number or null,
      "fiber": number or null,
      "serving": "string e.g. '1 medium slice (120g)'",
      "servingGrams": number
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "notes": "string",
  "confidence": number
}`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: "high",
                },
              },
              {
                type: "text",
                text: "Analyze the food in this image and estimate the nutrition values.",
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!openAIRes.ok) {
      const errText = await openAIRes.text().catch(() => "");
      console.error("[PHOTO-MEAL-ANALYSIS] OpenAI error:", openAIRes.status, errText);
      return NextResponse.json(
        { error: "AI analysis failed. Please try again or use manual entry." },
        { status: 500 }
      );
    }

    const openAIData = await openAIRes.json();
    const content = openAIData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    const analysis: VisionResponse = JSON.parse(content);

    if (!Array.isArray(analysis.foods) || analysis.foods.length === 0) {
      return NextResponse.json(
        { error: "No food detected in the image. Try a clearer or closer photo." },
        { status: 422 }
      );
    }

    // Persist foods to DB and build response
    const foods = [];
    for (const item of analysis.foods) {
      if (!item.name) continue;
      const { id, isNew } = await findOrCreateFood(item, session.user.id);
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

    return NextResponse.json({
      foods,
      totalCalories: Math.round(analysis.totalCalories),
      totalProtein: Math.round(analysis.totalProtein * 10) / 10,
      totalCarbs: Math.round(analysis.totalCarbs * 10) / 10,
      totalFat: Math.round(analysis.totalFat * 10) / 10,
      notes: analysis.notes || "Estimated from photo",
      confidence: Math.min(1, Math.max(0, analysis.confidence ?? 0.7)),
      source: "ai" as const,
    });
  } catch (error) {
    console.error("[PHOTO-MEAL-ANALYSIS]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or use manual entry." },
      { status: 500 }
    );
  }
}

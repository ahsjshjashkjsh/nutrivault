import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzeMealWithAI } from "@/lib/nutrition-agent";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Each call costs OpenAI tokens — cap per user
    const limit = rateLimit(`meal-analysis:${session.user.id}`, 20, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many analyses. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const meal = body?.meal as string | undefined;

    if (!meal || typeof meal !== "string" || !meal.trim()) {
      return NextResponse.json({ error: "Meal description is required" }, { status: 400 });
    }

    if (meal.length > 600) {
      return NextResponse.json(
        { error: "Description is too long (max 600 characters)." },
        { status: 400 }
      );
    }

    const result = await analyzeMealWithAI(meal.trim(), session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[MEAL-ANALYSIS]", error);
    return NextResponse.json(
      { error: "Failed to analyze meal. Please try again or use manual entry." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzeMealWithAI } from "@/lib/nutrition-agent";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const meal = body?.meal as string | undefined;

    if (!meal || typeof meal !== "string" || !meal.trim()) {
      return NextResponse.json({ error: "Meal description is required" }, { status: 400 });
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

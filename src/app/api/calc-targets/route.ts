import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { calculateCalorieTargetsWithAI } from "@/lib/calorie-ai";

const calcSchema = z.object({
  age: z.number().int().min(13).max(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(20).max(500),
  targetWeightKg: z.number().min(20).max(500).optional(),
  activityLevel: z.enum([
    "SEDENTARY",
    "LIGHTLY_ACTIVE",
    "MODERATELY_ACTIVE",
    "VERY_ACTIVE",
    "EXTREMELY_ACTIVE",
  ]),
  goalType: z.enum([
    "LOSE_WEIGHT",
    "MAINTAIN_WEIGHT",
    "GAIN_WEIGHT",
    "BUILD_MUSCLE",
  ]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = calcSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const targets = await calculateCalorieTargetsWithAI(parsed.data);

    return NextResponse.json(targets);
  } catch (error) {
    console.error("[CALC-TARGETS]", error);
    return NextResponse.json(
      { error: "Failed to calculate targets." },
      { status: 500 }
    );
  }
}

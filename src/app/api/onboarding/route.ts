import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";
import { calculateCalorieTargetsWithAI } from "@/lib/calorie-ai";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Calculate nutrition targets (AI-backed, with local fallback)
    const targets = await calculateCalorieTargetsWithAI({
      age: data.age,
      gender: data.gender,
      heightCm: data.heightCm,
      weightKg: data.currentWeightKg,
      targetWeightKg: data.targetWeightKg,
      activityLevel: data.activityLevel,
      goalType: data.goalType,
    });

    // Update profile
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        age: data.age,
        gender: data.gender,
        heightCm: data.heightCm,
        currentWeightKg: data.currentWeightKg,
        targetWeightKg: data.targetWeightKg,
        activityLevel: data.activityLevel,
        onboardingDone: true,
      },
      create: {
        userId: session.user.id,
        age: data.age,
        gender: data.gender,
        heightCm: data.heightCm,
        currentWeightKg: data.currentWeightKg,
        targetWeightKg: data.targetWeightKg,
        activityLevel: data.activityLevel,
        onboardingDone: true,
      },
    });

    // Deactivate old goals and create new one
    await prisma.goal.updateMany({
      where: { userId: session.user.id, isActive: true },
      data: { isActive: false },
    });

    await prisma.goal.create({
      data: {
        userId: session.user.id,
        goalType: data.goalType,
        dailyCalories: targets.calories,
        proteinGrams: targets.proteinG,
        carbsGrams: targets.carbsG,
        fatGrams: targets.fatG,
        isActive: true,
      },
    });

    // Log initial weight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.weightEntry.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      update: { weightKg: data.currentWeightKg },
      create: {
        userId: session.user.id,
        weightKg: data.currentWeightKg,
        date: today,
      },
    });

    return NextResponse.json({
      message: "Onboarding complete",
      targets: {
        calories: targets.calories,
        proteinG: targets.proteinG,
        carbsG: targets.carbsG,
        fatG: targets.fatG,
        maintenanceCalories: targets.maintenanceCalories,
        explanation: targets.explanation,
        source: targets.source,
      },
    });
  } catch (error) {
    console.error("[ONBOARDING]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

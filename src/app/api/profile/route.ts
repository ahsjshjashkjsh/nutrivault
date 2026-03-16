import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations";
import { calculateCalorieTargetsWithAI } from "@/lib/calorie-ai";
import type { Gender, ActivityLevel, GoalType } from "@/utils/calorie-calculator";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        goals: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[PROFILE GET]", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, goalType, ...profileData } = parsed.data;

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Update profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: profileData,
      create: {
        userId: session.user.id,
        ...profileData,
      },
    });

    // Recalculate goals if relevant fields changed
    if (goalType || Object.keys(profileData).some((k) =>
      ["age", "gender", "heightCm", "currentWeightKg", "activityLevel"].includes(k)
    )) {
      const profile = updatedProfile;
      const currentGoal = await prisma.goal.findFirst({
        where: { userId: session.user.id, isActive: true },
        orderBy: { createdAt: "desc" },
      });

      const resolvedGoalType = goalType || currentGoal?.goalType || "MAINTAIN_WEIGHT";

      if (
        profile.age &&
        profile.gender &&
        profile.heightCm &&
        profile.currentWeightKg &&
        profile.activityLevel
      ) {
        const targets = await calculateCalorieTargetsWithAI({
          age: profile.age,
          gender: profile.gender as Gender,
          heightCm: profile.heightCm,
          weightKg: profile.currentWeightKg,
          targetWeightKg: profile.targetWeightKg ?? undefined,
          activityLevel: profile.activityLevel as ActivityLevel,
          goalType: resolvedGoalType as GoalType,
        });

        await prisma.goal.updateMany({
          where: { userId: session.user.id, isActive: true },
          data: { isActive: false },
        });

        await prisma.goal.create({
          data: {
            userId: session.user.id,
            goalType: resolvedGoalType,
            dailyCalories: targets.calories,
            proteinGrams: targets.proteinG,
            carbsGrams: targets.carbsG,
            fatGrams: targets.fatG,
            isActive: true,
          },
        });
      }
    }

    return NextResponse.json({ message: "Profile updated", profile: updatedProfile });
  } catch (error) {
    console.error("[PROFILE PATCH]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

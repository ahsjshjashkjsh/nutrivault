import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mealEntrySchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const entries = await prisma.mealEntry.findMany({
      where: {
        userId: session.user.id,
        date,
      },
      include: {
        food: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Aggregate totals
    const totals = entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.calories,
        proteinG: acc.proteinG + entry.proteinG,
        carbsG: acc.carbsG + entry.carbsG,
        fatG: acc.fatG + entry.fatG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );

    // Group by meal type
    const meals = {
      BREAKFAST: entries.filter((e) => e.mealType === "BREAKFAST"),
      LUNCH: entries.filter((e) => e.mealType === "LUNCH"),
      DINNER: entries.filter((e) => e.mealType === "DINNER"),
      SNACK: entries.filter((e) => e.mealType === "SNACK"),
    };

    // Water total for the day
    const waterLogs = await prisma.waterLog.findMany({
      where: { userId: session.user.id, date },
    });
    const waterMl = waterLogs.reduce((sum, log) => sum + log.amountMl, 0);

    return NextResponse.json({ entries, meals, totals, waterMl });
  } catch (error) {
    console.error("[DIARY GET]", error);
    return NextResponse.json({ error: "Failed to fetch diary" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = mealEntrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { foodId, mealType, date, servings, servingSize, servingUnit } = parsed.data;

    // Fetch food
    const food = await prisma.food.findUnique({ where: { id: foodId } });
    if (!food) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    // Calculate nutrition for this entry
    const multiplier = (servings * servingSize) / food.servingSize;
    const calories = food.calories * multiplier;
    const proteinG = food.proteinG * multiplier;
    const carbsG = food.carbsG * multiplier;
    const fatG = food.fatG * multiplier;

    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    const entry = await prisma.mealEntry.create({
      data: {
        userId: session.user.id,
        foodId,
        mealType,
        date: entryDate,
        servings,
        servingSize,
        servingUnit,
        calories: Math.round(calories * 10) / 10,
        proteinG: Math.round(proteinG * 10) / 10,
        carbsG: Math.round(carbsG * 10) / 10,
        fatG: Math.round(fatG * 10) / 10,
      },
      include: { food: true },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("[DIARY POST]", error);
    return NextResponse.json({ error: "Failed to add meal entry" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayUTC, subDaysUTC } from "@/lib/dates";
import { z } from "zod";

const copySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in yyyy-MM-dd format"),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]).optional(),
});

/**
 * Copies all meal entries (optionally a single meal) from the previous day
 * into the given date.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = copySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const targetDate = dayUTC(parsed.data.date);
    const sourceDate = subDaysUTC(targetDate, 1);

    const sourceEntries = await prisma.mealEntry.findMany({
      where: {
        userId: session.user.id,
        date: sourceDate,
        ...(parsed.data.mealType ? { mealType: parsed.data.mealType } : {}),
      },
    });

    if (sourceEntries.length === 0) {
      return NextResponse.json(
        { error: "Nothing to copy from the previous day" },
        { status: 404 }
      );
    }

    const created = await prisma.$transaction(
      sourceEntries.map((e) =>
        prisma.mealEntry.create({
          data: {
            userId: e.userId,
            foodId: e.foodId,
            mealType: e.mealType,
            date: targetDate,
            servings: e.servings,
            servingSize: e.servingSize,
            servingUnit: e.servingUnit,
            calories: e.calories,
            proteinG: e.proteinG,
            carbsG: e.carbsG,
            fatG: e.fatG,
          },
          include: { food: true },
        })
      )
    );

    return NextResponse.json({ entries: created }, { status: 201 });
  } catch (error) {
    console.error("[DIARY COPY]", error);
    return NextResponse.json({ error: "Failed to copy entries" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mealEntryUpdateSchema } from "@/lib/validations";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const entry = await prisma.mealEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.mealEntry.delete({ where: { id } });

    return NextResponse.json({ message: "Entry deleted" });
  } catch (error) {
    console.error("[MEAL DELETE]", error);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = mealEntryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const entry = await prisma.mealEntry.findUnique({
      where: { id },
      include: { food: true },
    });

    if (!entry || entry.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const servings = parsed.data.servings ?? entry.servings;
    const servingSize = parsed.data.servingSize ?? entry.servingSize;

    const multiplier = (servings * servingSize) / entry.food.servingSize;

    const updated = await prisma.mealEntry.update({
      where: { id },
      data: {
        servings,
        servingSize,
        calories: Math.round(entry.food.calories * multiplier * 10) / 10,
        proteinG: Math.round(entry.food.proteinG * multiplier * 10) / 10,
        carbsG: Math.round(entry.food.carbsG * multiplier * 10) / 10,
        fatG: Math.round(entry.food.fatG * multiplier * 10) / 10,
      },
      include: { food: true },
    });

    return NextResponse.json({ entry: updated });
  } catch (error) {
    console.error("[MEAL PATCH]", error);
    return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
  }
}

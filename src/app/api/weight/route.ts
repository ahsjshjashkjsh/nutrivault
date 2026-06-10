import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { weightEntrySchema } from "@/lib/validations";
import { dayUTC } from "@/lib/dates";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "90"), 365);

    const entries = await prisma.weightEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[WEIGHT GET]", error);
    return NextResponse.json({ error: "Failed to fetch weight entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = weightEntrySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { weightKg, date, notes } = parsed.data;
    const entryDate = dayUTC(date);

    const entry = await prisma.weightEntry.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: entryDate,
        },
      },
      update: { weightKg, notes },
      create: {
        userId: session.user.id,
        weightKg,
        date: entryDate,
        notes,
      },
    });

    // Update profile's current weight (upsert: profile may not exist yet)
    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { currentWeightKg: weightKg },
      create: { userId: session.user.id, currentWeightKg: weightKg },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("[WEIGHT POST]", error);
    return NextResponse.json({ error: "Failed to log weight" }, { status: 500 });
  }
}

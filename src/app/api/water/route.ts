import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { waterLogSchema } from "@/lib/validations";
import { dayUTC } from "@/lib/dates";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = waterLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { amountMl, date } = parsed.data;
    const logDate = dayUTC(date);

    const log = await prisma.waterLog.create({
      data: {
        userId: session.user.id,
        amountMl,
        date: logDate,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("[WATER POST]", error);
    return NextResponse.json({ error: "Failed to log water" }, { status: 500 });
  }
}

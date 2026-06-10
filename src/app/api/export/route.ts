import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))];
  // BOM so Excel opens it as UTF-8
  return "﻿" + lines.join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = new URL(request.url).searchParams.get("type") || "meals";
    const userId = session.user.id;
    const stamp = format(new Date(), "yyyy-MM-dd");

    let csv: string;
    let filename: string;

    if (type === "weight") {
      const entries = await prisma.weightEntry.findMany({
        where: { userId },
        orderBy: { date: "asc" },
      });
      csv = toCsv(
        ["date", "weight_kg", "notes"],
        entries.map((e) => [format(e.date, "yyyy-MM-dd"), e.weightKg, e.notes])
      );
      filename = `nutrivault-weight-${stamp}.csv`;
    } else {
      const entries = await prisma.mealEntry.findMany({
        where: { userId },
        include: { food: { select: { name: true, brand: true } } },
        orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      });
      csv = toCsv(
        [
          "date",
          "meal_type",
          "food",
          "brand",
          "servings",
          "serving_size",
          "serving_unit",
          "calories",
          "protein_g",
          "carbs_g",
          "fat_g",
        ],
        entries.map((e) => [
          format(e.date, "yyyy-MM-dd"),
          e.mealType,
          e.food.name,
          e.food.brand,
          e.servings,
          e.servingSize,
          e.servingUnit,
          e.calories,
          e.proteinG,
          e.carbsG,
          e.fatG,
        ])
      );
      filename = `nutrivault-meals-${stamp}.csv`;
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[EXPORT]", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}

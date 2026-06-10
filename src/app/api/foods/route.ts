import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customFoodSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (!query.trim()) {
      // Return recently used foods
      const recentFoodIds = await prisma.mealEntry.findMany({
        where: { userId: session.user.id },
        select: { foodId: true },
        distinct: ["foodId"],
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      const foodIds = recentFoodIds.map((e) => e.foodId);

      const foods = await prisma.food.findMany({
        where: {
          OR: [
            { id: { in: foodIds } },
            { isPublic: true },
          ],
        },
        take: limit,
        orderBy: { name: "asc" },
      });

      return NextResponse.json({ foods, source: "local" });
    }

    // Search local database first (case-insensitive, includes user and AI foods)
    const localFoods = await prisma.food.findMany({
      where: {
        AND: [
          {
            OR: [
              { isPublic: true },
              { createdBy: session.user.id },
            ],
          },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [
        // Prioritize exact matches, then alphabetical
        { name: "asc" },
      ],
    });

    // If few local results, try OpenFoodFacts
    let offFoods: typeof localFoods = [];
    if (localFoods.length < 5 && process.env.OPENFOODFACTS_API_URL) {
      try {
        const offUrl = `${process.env.OPENFOODFACTS_API_URL}/search?search_terms=${encodeURIComponent(query)}&fields=product_name,brands,nutriments,serving_size,code&page_size=10&json=1`;
        const offRes = await fetch(offUrl, {
          next: { revalidate: 3600 },
          headers: { "User-Agent": "NutriVault/1.0" },
        });

        if (offRes.ok) {
          const offData = await offRes.json();
          const products = offData.products || [];

          offFoods = products
            .filter(
              (p: { product_name?: string; nutriments?: { "energy-kcal_100g"?: number } }) =>
                p.product_name && p.nutriments?.["energy-kcal_100g"]
            )
            .map((p: {
              product_name: string;
              brands?: string;
              nutriments: {
                "energy-kcal_100g"?: number;
                proteins_100g?: number;
                carbohydrates_100g?: number;
                fat_100g?: number;
                fiber_100g?: number;
              };
              code?: string;
            }) => ({
              id: `off-${p.code || Math.random()}`,
              name: p.product_name,
              brand: p.brands || null,
              calories: Math.round(p.nutriments["energy-kcal_100g"] || 0),
              proteinG: Math.round((p.nutriments.proteins_100g || 0) * 10) / 10,
              carbsG: Math.round((p.nutriments.carbohydrates_100g || 0) * 10) / 10,
              fatG: Math.round((p.nutriments.fat_100g || 0) * 10) / 10,
              fiberG: p.nutriments.fiber_100g
                ? Math.round(p.nutriments.fiber_100g * 10) / 10
                : null,
              servingSize: 100,
              servingUnit: "g",
              barcode: p.code || null,
              isPublic: true,
              source: "openfoodfacts",
              createdBy: null,
              sugarG: null,
              sodiumMg: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));
        }
      } catch (error) {
        console.warn("[FOODS] OpenFoodFacts search failed:", error);
      }
    }

    const allFoods = [...localFoods, ...offFoods].slice(0, limit);
    return NextResponse.json({ foods: allFoods, source: "combined" });
  } catch (error) {
    console.error("[FOODS GET]", error);
    return NextResponse.json({ error: "Failed to search foods" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = customFoodSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const food = await prisma.food.create({
      data: {
        ...parsed.data,
        createdBy: session.user.id,
        isPublic: false,
        source: "user",
      },
    });

    return NextResponse.json({ food }, { status: 201 });
  } catch (error) {
    console.error("[FOODS POST]", error);
    return NextResponse.json({ error: "Failed to create food" }, { status: 500 });
  }
}

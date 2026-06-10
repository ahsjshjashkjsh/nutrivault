/**
 * One-off fix: ~53 seed foods stored per-100g nutrition values while their
 * servingSize is not 100 (e.g. Butter: 717 kcal @ 14 g). The app treats values
 * as per-serving, so these foods logged wildly wrong calories.
 *
 * This script:
 *  1. Parses the ORIGINAL values from prisma/seed.ts
 *  2. Updates matching foods in the database (idempotent: only rows whose
 *     calories still equal the original per-100g value are touched)
 *  3. Recomputes cached nutrition on existing meal entries for those foods
 *  4. Rewrites prisma/seed.ts with the corrected per-serving values
 *
 * Run with: npx tsx scripts/fix-food-portions.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Foods whose seed values are per-100g/100ml but servingSize ≠ 100.
// Verified one by one against USDA/label data.
const WRONG_FOODS = [
  // Breads & baked
  "Whole Wheat Bread", "White Bread", "Tortilla (wheat)", "Croissant",
  "Pretzels", "Rye Bread", "Baguette", "Crêpe (plain)",
  "Waffles (plain)", "Pancakes (plain)",
  // Dairy & fats
  "Cheddar Cheese", "Parmesan (grated)", "Butter", "Cream Cheese",
  "Heavy Cream", "Olive Oil", "Coconut Oil",
  // Nuts & seeds
  "Almonds", "Walnuts", "Peanut Butter (natural)", "Cashews", "Peanuts",
  "Sunflower Seeds", "Sesame Seeds", "Flaxseeds",
  // Produce
  "Lemon", "Garlic",
  // Cured meats
  "Prosciutto Crudo", "Chorizo", "Jamón Serrano",
  // Condiments & sauces
  "Pesto (Genovese)", "Ketchup", "Mayonnaise", "Mustard", "Soy Sauce",
  "Hummus", "Balsamic Vinegar",
  // Breakfast cereals
  "Muesli", "Cornflakes", "Granola (honey)",
  // Snacks
  "Dark Chocolate (70%)", "Chips (potato)", "Popcorn (plain)", "Nutella",
  // Beverages
  "Coca-Cola", "Red Bull", "Fanta Orange", "Sprite", "Beer (lager)",
  "Red Wine", "White Wine",
  // Desserts
  "Cheesecake (slice)", "Apple Pie (slice)",
];

const NUMERIC_FIELDS = ["calories", "proteinG", "carbsG", "fatG", "fiberG", "sugarG"] as const;

interface ParsedFood {
  name: string;
  line: number;
  servingSize: number;
  values: Record<string, number>;
}

function parseSeed(seedSource: string): Map<string, ParsedFood> {
  const foods = new Map<string, ParsedFood>();
  const lines = seedSource.split("\n");

  lines.forEach((line, i) => {
    const nameMatch = line.match(/\{ name: "((?:[^"\\]|\\.)*)"/);
    if (!nameMatch) return;
    const name = nameMatch[1].replace(/\\'/g, "'");
    if (!WRONG_FOODS.includes(name)) return;

    const sizeMatch = line.match(/servingSize: ([\d.]+)/);
    if (!sizeMatch) return;

    const values: Record<string, number> = {};
    for (const field of NUMERIC_FIELDS) {
      const m = line.match(new RegExp(`${field}: ([\\d.]+)`));
      if (m) values[field] = parseFloat(m[1]);
    }

    foods.set(name, { name, line: i, servingSize: parseFloat(sizeMatch[1]), values });
  });

  return foods;
}

function scale(value: number, factor: number, isCalories: boolean): number {
  const scaled = value * factor;
  return isCalories ? Math.round(scaled) : Math.round(scaled * 10) / 10;
}

async function main() {
  const seedPath = path.join(__dirname, "..", "prisma", "seed.ts");
  const seedSource = fs.readFileSync(seedPath, "utf8");
  const parsed = parseSeed(seedSource);

  // Guard against double-running: after the fix, Butter is ~100 kcal (was 717).
  // Re-scaling already-fixed values would corrupt them.
  const butter = parsed.get("Butter");
  if (butter && butter.values.calories < 200) {
    console.error("ABORT: seed.ts values look already fixed (Butter < 200 kcal). This script must run only once.");
    process.exit(1);
  }

  const missing = WRONG_FOODS.filter((n) => !parsed.has(n));
  if (missing.length > 0) {
    console.warn("WARNING — not found in seed.ts:", missing);
  }
  console.log(`Parsed ${parsed.size}/${WRONG_FOODS.length} foods from seed.ts\n`);

  // ── 1. Fix database rows + recompute meal entries ─────────────────────────
  let dbFixed = 0;
  let entriesFixed = 0;
  let alreadyFixed = 0;

  for (const food of parsed.values()) {
    const factor = food.servingSize / 100;

    // Idempotency: only touch rows whose calories still match the wrong value
    const row = await prisma.food.findFirst({
      where: {
        name: food.name,
        source: "seed",
        calories: { gte: food.values.calories - 0.5, lte: food.values.calories + 0.5 },
      },
    });

    if (!row) {
      alreadyFixed++;
      continue;
    }

    const data: Record<string, number> = {};
    for (const field of NUMERIC_FIELDS) {
      if (food.values[field] !== undefined) {
        data[field] = scale(food.values[field], factor, field === "calories");
      }
    }

    const updated = await prisma.food.update({ where: { id: row.id }, data });
    dbFixed++;
    console.log(
      `DB  ✓ ${food.name}: ${food.values.calories} → ${updated.calories} kcal (per ${food.servingSize}g/ml)`
    );

    // Recompute cached nutrition on existing meal entries for this food
    const entries = await prisma.mealEntry.findMany({ where: { foodId: row.id } });
    for (const entry of entries) {
      const multiplier = (entry.servings * entry.servingSize) / updated.servingSize;
      await prisma.mealEntry.update({
        where: { id: entry.id },
        data: {
          calories: Math.round(updated.calories * multiplier * 10) / 10,
          proteinG: Math.round(updated.proteinG * multiplier * 10) / 10,
          carbsG: Math.round(updated.carbsG * multiplier * 10) / 10,
          fatG: Math.round(updated.fatG * multiplier * 10) / 10,
        },
      });
      entriesFixed++;
    }
  }

  // ── 2. Rewrite seed.ts with corrected values ──────────────────────────────
  const lines = seedSource.split("\n");
  let fileFixed = 0;

  for (const food of parsed.values()) {
    const factor = food.servingSize / 100;
    let line = lines[food.line];

    for (const field of NUMERIC_FIELDS) {
      if (food.values[field] === undefined) continue;
      const fixed = scale(food.values[field], factor, field === "calories");
      line = line.replace(
        new RegExp(`${field}: [\\d.]+`),
        `${field}: ${fixed}`
      );
    }

    lines[food.line] = line;
    fileFixed++;
  }

  fs.writeFileSync(seedPath, lines.join("\n"));

  console.log(`\nDone.`);
  console.log(`  Database foods fixed:   ${dbFixed} (${alreadyFixed} already fixed/not found)`);
  console.log(`  Meal entries recomputed: ${entriesFixed}`);
  console.log(`  seed.ts lines updated:   ${fileFixed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

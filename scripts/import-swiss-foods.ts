/**
 * Imports popular Swiss retail products (Migros, Coop & co.) from
 * Open Food Facts into the Food table, so users find them instantly
 * without hitting the external API at search time.
 *
 * Values are official label data per 100g/100ml from OFF.
 * Idempotent: products are deduped by barcode (skipDuplicates).
 *
 * Run with: npx tsx scripts/import-swiss-foods.ts
 * (on machines with TLS interception: NODE_TLS_REJECT_UNAUTHORIZED=0)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEARCH_URL = "https://search.openfoodfacts.org/search";
const USER_AGENT = "NutriVault/1.0 (rullochristian@gmail.com)";

// Swiss retailer house brands + iconic Swiss food brands.
// [brand query, pages of 100 to fetch]
const BRANDS: Array<[string, number]> = [
  // Migros family
  ["migros", 4],
  ["m-classic", 3],
  ["m-budget", 2],
  ["migros bio", 2],
  ["anna's best", 1],
  ["frey", 1],
  ["farmer", 1],
  ["cornatur", 1],
  ["léger", 1],
  // Coop family
  ["coop", 4],
  ["naturaplan", 3],
  ["qualité & prix", 2],
  ["prix garantie", 2],
  ["betty bossi", 1],
  ["karma", 1],
  // Iconic Swiss brands
  ["emmi", 2],
  ["zweifel", 1],
  ["rivella", 1],
  ["ovomaltine", 1],
  ["thomy", 1],
  ["kambly", 1],
  ["ricola", 1],
];

const BEVERAGE_TAGS = ["en:beverages", "en:waters", "en:sodas", "en:juices", "en:milks", "en:plant-milks"];

interface OffHit {
  code?: string;
  product_name?: string;
  product_name_de?: string;
  product_name_fr?: string;
  brands?: string | string[];
  categories_tags?: string[];
  nutriments?: Record<string, number>;
}

interface FoodRow {
  name: string;
  brand: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
  servingSize: number;
  servingUnit: string;
  barcode: string;
  isPublic: boolean;
  source: string;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function mapHit(hit: OffHit): FoodRow | null {
  const code = hit.code;
  const name = (hit.product_name_de || hit.product_name || hit.product_name_fr || "").trim();
  const n = hit.nutriments;
  if (!code || name.length < 3 || !n) return null;

  // Energy: prefer kcal, fall back to kJ
  let kcal = n["energy-kcal_100g"];
  if (kcal === undefined && n["energy-kj_100g"] !== undefined) {
    kcal = n["energy-kj_100g"] / 4.184;
  }
  const protein = n["proteins_100g"];
  const carbs = n["carbohydrates_100g"];
  const fat = n["fat_100g"];

  if (kcal === undefined || protein === undefined || carbs === undefined || fat === undefined) {
    return null;
  }

  // Sanity: label data per 100g must be physically plausible
  if (kcal < 0 || kcal > 950) return null;
  if (protein < 0 || protein > 100 || carbs < 0 || carbs > 100 || fat < 0 || fat > 100) return null;
  if (protein + carbs + fat > 105) return null;

  const isBeverage = (hit.categories_tags || []).some((t) => BEVERAGE_TAGS.includes(t));

  return {
    name: name.slice(0, 100),
    brand: hit.brands
      ? (Array.isArray(hit.brands) ? hit.brands[0] : hit.brands.split(",")[0]).trim().slice(0, 60)
      : null,
    calories: Math.round(kcal),
    proteinG: round1(protein),
    carbsG: round1(carbs),
    fatG: round1(fat),
    fiberG: n["fiber_100g"] !== undefined ? round1(n["fiber_100g"]) : null,
    sugarG: n["sugars_100g"] !== undefined ? round1(n["sugars_100g"]) : null,
    sodiumMg: n["sodium_100g"] !== undefined ? Math.round(n["sodium_100g"] * 1000) : null,
    servingSize: 100,
    servingUnit: isBeverage ? "ml" : "g",
    barcode: code,
    isPublic: true,
    source: "openfoodfacts",
  };
}

async function fetchBrandPage(brand: string, page: number): Promise<OffHit[]> {
  const q = encodeURIComponent(`brands:"${brand}"`);
  const fields = "code,product_name,product_name_de,product_name_fr,brands,categories_tags,nutriments";
  const url = `${SEARCH_URL}?q=${q}&page_size=100&page=${page}&sort_by=-unique_scans_n&fields=${fields}`;

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    console.warn(`  ! ${brand} page ${page}: HTTP ${res.status}`);
    return [];
  }
  const data = await res.json();
  return data.hits || [];
}

async function main() {
  const byBarcode = new Map<string, FoodRow>();
  let fetched = 0;

  for (const [brand, pages] of BRANDS) {
    let kept = 0;
    for (let page = 1; page <= pages; page++) {
      const hits = await fetchBrandPage(brand, page);
      fetched += hits.length;
      for (const hit of hits) {
        const row = mapHit(hit);
        if (row && !byBarcode.has(row.barcode)) {
          byBarcode.set(row.barcode, row);
          kept++;
        }
      }
      if (hits.length < 100) break; // no more pages
      await new Promise((r) => setTimeout(r, 300)); // be nice to OFF
    }
    console.log(`${brand}: +${kept} products`);
  }

  const rows = [...byBarcode.values()];
  console.log(`\nFetched ${fetched} hits → ${rows.length} unique valid products. Inserting...`);

  // skipDuplicates: products already in DB (same barcode) are left untouched
  const result = await prisma.food.createMany({
    data: rows,
    skipDuplicates: true,
  });

  const total = await prisma.food.count();
  console.log(`Inserted ${result.count} new foods (${rows.length - result.count} already existed).`);
  console.log(`Food table now has ${total} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

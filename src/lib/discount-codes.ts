/**
 * Discount codes for NutriVault Premium.
 * Add new codes here — matching is case-insensitive.
 *
 * Format:
 *   code (string)     → the promo code
 *   discountPercent   → 0–100 (100 = fully free)
 *   description       → shown to user on success
 */

export interface DiscountCode {
  code: string;
  discountPercent: number;
  description: string;
}

// ─── Defined discount codes ───────────────────────────────────────────────────
// Add or edit codes here. The matching is case-insensitive at runtime.
export const DISCOUNT_CODES: DiscountCode[] = [
  {
    code: "Napoli1926",
    discountPercent: 100,
    description: "Full discount — Premium for free",
  },
  // Example: partial discount
  // { code: "SAVE50", discountPercent: 50, description: "50% off Premium" },
];

// ─── Pricing constants ────────────────────────────────────────────────────────
export const PREMIUM_PRICE_MONTHLY = 9.99;
export const PREMIUM_PRICE_YEARLY = 79.99;
export const PREMIUM_CURRENCY = "CHF ";

// ─── Validation function ──────────────────────────────────────────────────────
export interface DiscountResult {
  valid: boolean;
  code: DiscountCode | null;
  finalMonthly: number;
  finalYearly: number;
}

export function validateDiscountCode(input: string): DiscountResult {
  const normalized = input.trim().toLowerCase();
  const match = DISCOUNT_CODES.find((c) => c.code.toLowerCase() === normalized);

  if (!match) {
    return {
      valid: false,
      code: null,
      finalMonthly: PREMIUM_PRICE_MONTHLY,
      finalYearly: PREMIUM_PRICE_YEARLY,
    };
  }

  const factor = 1 - match.discountPercent / 100;
  return {
    valid: true,
    code: match,
    finalMonthly: Math.round(PREMIUM_PRICE_MONTHLY * factor * 100) / 100,
    finalYearly: Math.round(PREMIUM_PRICE_YEARLY * factor * 100) / 100,
  };
}

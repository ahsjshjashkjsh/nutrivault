import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateDiscountCode } from "@/lib/discount-codes";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Max 10 code attempts per user per hour — prevents brute-forcing promo codes
    const limit = rateLimit(`promo:${session.user.id}`, 10, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const code = typeof body?.code === "string" ? body.code.trim() : null;

    if (!code) {
      return NextResponse.json({ error: "Discount code is required." }, { status: 400 });
    }

    // Server-side validation — never trust client
    const result = validateDiscountCode(code);

    if (!result.valid) {
      return NextResponse.json(
        { error: "This promo code is not valid. Please check and try again." },
        { status: 400 }
      );
    }

    // Only 100% discount codes activate premium for free
    if (result.finalMonthly !== 0) {
      return NextResponse.json(
        {
          error: "This code provides a discount but does not unlock free premium.",
          discountPercent: result.code!.discountPercent,
        },
        { status: 400 }
      );
    }

    // Persist premium status — this survives logout/login
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isPremium: true },
    });

    return NextResponse.json({
      success: true,
      discountPercent: result.code!.discountPercent,
    });
  } catch (error) {
    console.error("[ACTIVATE-PREMIUM]", error);
    return NextResponse.json(
      { error: "Failed to activate premium. Please try again." },
      { status: 500 }
    );
  }
}

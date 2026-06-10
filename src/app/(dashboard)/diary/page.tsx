import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DiaryClient } from "@/components/diary/diary-client";
import { dayUTC, todayKey } from "@/lib/dates";

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const today = todayKey();
  const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(params.date || "") ? params.date! : today;

  const date = dayUTC(dateStr);

  const [entries, goal, waterLogs, userRecord] = await Promise.all([
    prisma.mealEntry.findMany({
      where: { userId: session.user.id, date },
      include: { food: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.goal.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.waterLog.findMany({
      where: { userId: session.user.id, date },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    }),
  ]);

  const meals = {
    BREAKFAST: entries.filter((e) => e.mealType === "BREAKFAST"),
    LUNCH: entries.filter((e) => e.mealType === "LUNCH"),
    DINNER: entries.filter((e) => e.mealType === "DINNER"),
    SNACK: entries.filter((e) => e.mealType === "SNACK"),
  };

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
      carbsG: acc.carbsG + e.carbsG,
      fatG: acc.fatG + e.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const waterMl = waterLogs.reduce((sum, log) => sum + log.amountMl, 0);

  return (
    <DiaryClient
      date={dateStr}
      today={today}
      meals={meals}
      totals={totals}
      goal={goal}
      waterMl={waterMl}
      isPremium={userRecord?.isPremium ?? false}
    />
  );
}

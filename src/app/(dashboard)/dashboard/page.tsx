import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { computeStreak } from "@/lib/streak";
import { dayUTC, dateKey, subDaysUTC, todayKey } from "@/lib/dates";

async function getDashboardData(userId: string, today: Date) {
  const todayStr = dateKey(today);

  const [user, goal, todayEntries, todayWater, recentWeight, last7Days, streakEntries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    }),
    prisma.goal.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mealEntry.findMany({
      where: { userId, date: today },
      include: { food: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.waterLog.findMany({
      where: { userId, date: today },
    }),
    prisma.weightEntry.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    // Last 7 days for the weekly chart
    Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = subDaysUTC(today, 6 - i);
        return prisma.mealEntry.aggregate({
          where: { userId, date: d },
          _sum: { calories: true, proteinG: true, carbsG: true, fatG: true },
        }).then((agg) => ({
          date: dateKey(d),
          day: format(dayUTC(dateKey(d)), "EEE"),
          calories: Math.round(agg._sum.calories || 0),
          proteinG: Math.round(agg._sum.proteinG || 0),
          carbsG: Math.round(agg._sum.carbsG || 0),
          fatG: Math.round(agg._sum.fatG || 0),
        }));
      })
    ),
    // Distinct logged dates over the past year, for streak computation
    prisma.mealEntry.findMany({
      where: { userId, date: { gte: subDaysUTC(today, 365) } },
      select: { date: true },
      distinct: ["date"],
    }),
  ]);

  const loggedDates = new Set(streakEntries.map((e) => dateKey(e.date)));
  const streakDays = computeStreak(loggedDates, today);

  const dailyTotals = todayEntries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      proteinG: acc.proteinG + entry.proteinG,
      carbsG: acc.carbsG + entry.carbsG,
      fatG: acc.fatG + entry.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  const waterMl = todayWater.reduce((sum, log) => sum + log.amountMl, 0);

  const meals = {
    BREAKFAST: todayEntries.filter((e) => e.mealType === "BREAKFAST"),
    LUNCH: todayEntries.filter((e) => e.mealType === "LUNCH"),
    DINNER: todayEntries.filter((e) => e.mealType === "DINNER"),
    SNACK: todayEntries.filter((e) => e.mealType === "SNACK"),
  };

  return {
    user,
    goal,
    dailyTotals,
    meals,
    waterMl,
    recentWeight,
    last7Days,
    streakDays,
    today: todayStr,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // "Today" in the app timezone, stored as UTC midnight
  const today = dayUTC(todayKey());

  const data = await getDashboardData(session.user.id, today);

  return <DashboardClient {...data} />;
}

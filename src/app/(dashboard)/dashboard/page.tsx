import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays } from "date-fns";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

async function getDashboardData(userId: string, today: Date) {
  const todayStr = format(today, "yyyy-MM-dd");

  const [user, goal, todayEntries, todayWater, recentWeight, last7Days] = await Promise.all([
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
        const d = subDays(today, 6 - i);
        d.setHours(0, 0, 0, 0);
        return prisma.mealEntry.aggregate({
          where: { userId, date: d },
          _sum: { calories: true, proteinG: true, carbsG: true, fatG: true },
        }).then((agg) => ({
          date: format(d, "yyyy-MM-dd"),
          day: format(d, "EEE"),
          calories: Math.round(agg._sum.calories || 0),
          proteinG: Math.round(agg._sum.proteinG || 0),
          carbsG: Math.round(agg._sum.carbsG || 0),
          fatG: Math.round(agg._sum.fatG || 0),
        }));
      })
    ),
  ]);

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
    today: todayStr,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data = await getDashboardData(session.user.id, today);

  return <DashboardClient {...data} />;
}

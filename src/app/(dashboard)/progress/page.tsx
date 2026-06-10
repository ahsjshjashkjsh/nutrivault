import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProgressClient } from "@/components/progress/progress-client";
import { format } from "date-fns";
import { dayUTC, dateKey, subDaysUTC, todayKey } from "@/lib/dates";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const today = dayUTC(todayKey());

  const [weightEntries, goal, profile, last30Days] = await Promise.all([
    prisma.weightEntry.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 90,
    }),
    prisma.goal.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.profile.findUnique({ where: { userId } }),
    Promise.all(
      Array.from({ length: 30 }, (_, i) => {
        const d = subDaysUTC(today, 29 - i);
        return prisma.mealEntry.aggregate({
          where: { userId, date: d },
          _sum: { calories: true, proteinG: true, carbsG: true, fatG: true },
        }).then((agg) => ({
          date: dateKey(d),
          day: format(dayUTC(dateKey(d)), "MMM d"),
          calories: Math.round(agg._sum.calories || 0),
          proteinG: Math.round(agg._sum.proteinG || 0),
          carbsG: Math.round(agg._sum.carbsG || 0),
          fatG: Math.round(agg._sum.fatG || 0),
          logged: (agg._sum.calories || 0) > 0,
        }));
      })
    ),
  ]);

  const todayStr = dateKey(today);

  return (
    <ProgressClient
      weightEntries={weightEntries}
      goal={goal}
      profile={profile}
      calorieLogs={last30Days}
      today={todayStr}
    />
  );
}

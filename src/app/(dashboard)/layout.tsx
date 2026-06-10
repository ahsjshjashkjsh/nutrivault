import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { NutritionAssistant } from "@/components/chat/nutrition-assistant";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check onboarding
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile?.onboardingDone) {
    redirect("/onboarding");
  }

  return (
    <div className="dashboard-shell min-h-screen bg-background flex">
      <div className="app-ambient app-ambient-one" />
      <div className="app-ambient app-ambient-two" />
      <Sidebar />
      <div className="relative z-10 flex-1 flex flex-col min-h-screen lg:ml-72">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-auto">
          <div className="page-container">{children}</div>
        </main>
      </div>
      <NutritionAssistant />
    </div>
  );
}

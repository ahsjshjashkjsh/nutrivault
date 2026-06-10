"use client";

import { format } from "date-fns";
import { Bell } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const today = format(new Date(), "EEEE, MMMM d");

  return (
    <header className="app-header sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="hidden sm:block h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_12px_hsl(var(--primary)/0.8)]" />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Today</p>
          <p className="text-sm font-medium">{today}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <button className="app-icon-button relative w-9 h-9 flex items-center justify-center">
          <Bell className="w-4 h-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-400 ring-2 ring-card" />
        </button>
        <div className="app-profile flex items-center gap-2.5 rounded-xl p-1.5 pr-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              {getInitials(user.name || user.email || "U")}
            </span>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium leading-none text-foreground">{user.name || "User"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

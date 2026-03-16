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
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm lg:px-8">
      <div>
        <p className="text-xs text-muted-foreground">{today}</p>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
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

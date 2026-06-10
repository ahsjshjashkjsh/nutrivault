"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart2,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  Leaf,
  LogOut,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/constants";
import { useLanguage } from "@/contexts/language-context";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard },
    { href: "/diary", label: t("sidebar.foodDiary"), icon: BookOpen },
    { href: "/progress", label: t("sidebar.progress"), icon: BarChart2 },
    { href: "/settings", label: t("sidebar.settings"), icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="app-sidebar hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="brand-mark w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-tight">{APP_NAME}</span>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Nutrition OS</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            Workspace
          </p>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "nav-item",
                  isActive ? "nav-item-active" : "nav-item-inactive"
                )}
              >
                <span className="nav-icon">
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                </span>
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="nav-arrow w-3.5 h-3.5" />
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4">
          <div className="mb-3 rounded-xl border border-brand-500/15 bg-brand-500/[0.06] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
              Daily tracking active
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Small entries build a clearer health picture.
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="nav-item nav-item-inactive w-full text-left text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            {t("sidebar.signOut")}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="app-mobile-nav lg:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-300",
                  isActive
                    ? "text-brand-600 dark:text-brand-400 bg-brand-500/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

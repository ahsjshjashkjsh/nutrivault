"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLanguage } from "@/contexts/language-context";
import { APP_NAME } from "@/constants";

export function LandingNav() {
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">{APP_NAME}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.features")}
            </Link>
            <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.howItWorks")}
            </Link>
            <Link href="/#free" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("nav.free") || "Free"}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{t("nav.signIn")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">{t("nav.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

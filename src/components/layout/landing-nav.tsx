"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLanguage } from "@/contexts/language-context";
import { APP_NAME } from "@/constants";

export function LandingNav() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/#features", label: t("nav.features") },
    { href: "/#how-it-works", label: t("nav.howItWorks") },
    { href: "/#free", label: t("nav.free") || "Free" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">{APP_NAME}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block"><LanguageSwitcher /></div>
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
              <Link href="/login">{t("nav.signIn")}</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/register">{t("nav.getStarted")}</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/70 text-foreground transition-colors hover:bg-secondary"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden animate-scale-in border-t border-border/60 py-3">
            <div className="grid gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
              <Button asChild variant="outline">
                <Link href="/login">{t("nav.signIn")}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t("nav.getStarted")}</Link>
              </Button>
            </div>
            <div className="mt-2"><LanguageSwitcher /></div>
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import {
  BarChart2,
  CheckCircle2,
  ChevronRight,
  Flame,
  LineChart,
  Sparkles,
  Target,
  TrendingDown,
  Utensils,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/layout/landing-nav";
import { LandingFooter } from "@/components/layout/landing-footer";
import { useLanguage } from "@/contexts/language-context";

export default function LandingPage() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Flame,
      titleKey: "features.calorieTracking",
      descKey: "features.calorieDesc",
      color: "text-orange-400",
      bg: "bg-orange-400/10",
    },
    {
      icon: Target,
      titleKey: "features.macroMonitoring",
      descKey: "features.macroDesc",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-500/10",
    },
    {
      icon: LineChart,
      titleKey: "features.progressCharts",
      descKey: "features.progressDesc",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      icon: Utensils,
      titleKey: "features.smartFoodDiary",
      descKey: "features.foodDiaryDesc",
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      icon: Zap,
      titleKey: "features.goalEngine",
      descKey: "features.goalDesc",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      icon: BarChart2,
      titleKey: "features.weeklyInsights",
      descKey: "features.weeklyDesc",
      color: "text-pink-400",
      bg: "bg-pink-400/10",
    },
  ];

  const steps = [
    { step: "01", titleKey: "howItWorks.step1Title", descKey: "howItWorks.step1Desc" },
    { step: "02", titleKey: "howItWorks.step2Title", descKey: "howItWorks.step2Desc" },
    { step: "03", titleKey: "howItWorks.step3Title", descKey: "howItWorks.step3Desc" },
    { step: "04", titleKey: "howItWorks.step4Title", descKey: "howItWorks.step4Desc" },
  ];

  const freeFeatures = [
    "free.feature1",
    "free.feature2",
    "free.feature3",
    "free.feature4",
    "free.feature5",
    "free.feature6",
    "free.feature7",
    "free.feature8",
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            {t("hero.badge")}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            {t("hero.heading1")}{" "}
            <span className="gradient-text">{t("hero.heading2")}</span>{" "}
            <br className="hidden sm:block" />
            {t("hero.heading3")}
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero.subheading")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="px-8 py-6 text-base font-semibold glow-green">
              <Link href="/register">
                {t("hero.startFree")} <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-6 text-base">
              <Link href="/login">{t("hero.signIn")}</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            {t("hero.noCardRequired")}
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10 pointer-events-none" />
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hero.dailyTarget")}</p>
                  <p className="text-3xl font-bold text-foreground">2,100 <span className="text-sm font-normal text-muted-foreground">kcal</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t("hero.remaining")}</p>
                  <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">843</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { labelKey: "hero.protein", value: "142g", target: "175g", color: "bg-brand-500", pct: 81 },
                  { labelKey: "hero.carbs", value: "198g", target: "245g", color: "bg-blue-500", pct: 80 },
                  { labelKey: "hero.fat", value: "48g", target: "70g", color: "bg-yellow-500", pct: 69 },
                ].map((m) => (
                  <div key={m.labelKey} className="bg-muted/30 rounded-xl p-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs text-muted-foreground">{t(m.labelKey)}</span>
                      <span className="text-sm font-semibold text-foreground">{m.value}</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">of {m.target}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-3 pt-2">
                {[
                  { key: "hero.breakfast", kcal: 412 },
                  { key: "hero.lunch", kcal: 587 },
                  { key: "hero.dinner", kcal: 0 },
                  { key: "hero.snacks", kcal: 258 },
                ].map((meal) => (
                  <div key={meal.key} className="bg-muted/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">{t(meal.key)}</p>
                    <p className="text-sm font-semibold mt-1 text-foreground">{meal.kcal} kcal</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t("features.heading")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("features.subheading")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.titleKey}
                className="p-6 rounded-2xl bg-card border border-border hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t("howItWorks.heading")}</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t("howItWorks.subheading")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-border -z-10" />
                )}
                <div className="flex flex-col items-start">
                  <div className="text-brand-500 font-mono text-sm font-bold mb-3">{step.step}</div>
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-base mb-2 text-foreground">{t(step.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(step.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "50,000+", labelKey: "stats.activeUsers" },
              { value: "2M+", labelKey: "stats.mealsTracked" },
              { value: "500+", labelKey: "stats.foodsInDatabase" },
              { value: "4.9/5", labelKey: "stats.averageRating" },
            ].map((stat) => (
              <div key={stat.labelKey}>
                <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free for Everyone */}
      <section id="free" className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">{t("free.heading")}</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t("free.subheading")}
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-brand-500/30 bg-brand-500/5">
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-6">
              {t("free.whatsIncluded")}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {freeFeatures.map((key) => (
                <li key={key} className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className="w-full py-5 font-semibold glow-green"
            >
              <Link href="/register">
                {t("free.cta")} <ChevronRight className="ml-1 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-brand-500/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <TrendingDown className="w-12 h-12 text-brand-600 dark:text-brand-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            {t("cta.heading")}
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            {t("cta.subheading")}
          </p>
          <Button asChild size="lg" className="px-10 py-6 text-base font-semibold glow-green">
            <Link href="/register">
              {t("cta.createFreeAccount")} <ChevronRight className="ml-1 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

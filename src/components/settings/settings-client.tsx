"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2, Settings, User, Target, LogOut,
  CheckCircle2, Zap, Tag, Lock, Crown, Camera,
  Download, Scale, Utensils,
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { User as PrismaUser, Profile, Goal } from "@prisma/client";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ACTIVITY_LEVELS,
  GOAL_TYPES,
  GENDER_OPTIONS,
} from "@/constants";
import {
  formatCalories,
  cn,
} from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import {
  validateDiscountCode,
  PREMIUM_PRICE_MONTHLY,
  PREMIUM_PRICE_YEARLY,
  PREMIUM_CURRENCY,
} from "@/lib/discount-codes";

type UserWithProfileAndGoals = PrismaUser & {
  profile: Profile | null;
  goals: Goal[];
};

interface SettingsClientProps {
  user: UserWithProfileAndGoals;
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [discountResult, setDiscountResult] = useState<ReturnType<typeof validateDiscountCode> | null>(null);
  const [activating, setActivating] = useState(false);
  const [isPremium, setIsPremium] = useState(user.isPremium);
  const activeGoal = user.goals[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name || "",
      age: user.profile?.age || undefined,
      gender: (user.profile?.gender as ProfileUpdateInput["gender"]) || "MALE",
      heightCm: user.profile?.heightCm || undefined,
      currentWeightKg: user.profile?.currentWeightKg || undefined,
      targetWeightKg: user.profile?.targetWeightKg || undefined,
      activityLevel:
        (user.profile?.activityLevel as ProfileUpdateInput["activityLevel"]) ||
        "MODERATELY_ACTIVE",
      goalType:
        (activeGoal?.goalType as ProfileUpdateInput["goalType"]) ||
        "MAINTAIN_WEIGHT",
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: ProfileUpdateInput) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        toast({ title: t("settings.updateFailed"), description: error.error, variant: "destructive" });
        return;
      }

      toast({ title: t("settings.profileUpdated"), description: t("settings.profileUpdatedDesc") });
    } catch {
      toast({ title: t("settings.somethingWentWrong"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyCode = async () => {
    if (!discountInput.trim()) return;

    // Client-side pre-check for immediate UI feedback
    const localResult = validateDiscountCode(discountInput);
    setDiscountResult(localResult);

    if (!localResult.valid) {
      toast({
        title: t("settings.invalidCode"),
        description: t("settings.invalidCodeDesc"),
        variant: "destructive",
      });
      return;
    }

    // For 100% discount: activate premium on the backend
    if (localResult.finalMonthly === 0) {
      setActivating(true);
      try {
        const res = await fetch("/api/activate-premium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: discountInput.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast({
            title: t("settings.invalidCode"),
            description: data.error || t("settings.invalidCodeDesc"),
            variant: "destructive",
          });
          setDiscountResult(null);
          return;
        }

        // Premium activated — update local state immediately
        setIsPremium(true);
        setDiscountInput("");
        setDiscountResult(null);
        toast({
          title: t("premium.activated"),
          description: t("premium.activatedDesc"),
        });
      } catch {
        toast({
          title: t("settings.somethingWentWrong"),
          variant: "destructive",
        });
      } finally {
        setActivating(false);
      }
    } else {
      // Partial discount — just show the pricing, no backend call
      toast({
        title: t("settings.validCode"),
        description: `${localResult.code!.discountPercent}% ${t("settings.validCodeDesc")}`,
      });
    }
  };

  const FREE_FEATURES = [
    "Calorie & macro tracking",
    "Food diary (breakfast, lunch, dinner, snacks)",
    "Weight logging & progress charts",
    "Food database & custom foods",
    "Goal engine & daily targets",
    "Water tracking",
    "Weekly insights",
    "Nutrition assistant",
  ];

  const PREMIUM_FEATURES = [
    { label: "Photo meal analysis (AI)", icon: Camera },
    { label: "Advanced analytics & reports", icon: Zap },
    { label: "Meal planning & schedules", icon: Zap },
    { label: "Fasting tracker", icon: Zap },
    { label: "Data export (CSV/PDF)", icon: Zap },
    { label: "Custom recipe builder", icon: Zap },
    { label: "Priority support", icon: Zap },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("settings.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">
              <User className="w-3.5 h-3.5" />
              {t("settings.profile")}
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="w-3.5 h-3.5" />
              {t("settings.goals")}
            </TabsTrigger>
            <TabsTrigger value="account">
              <Settings className="w-3.5 h-3.5" />
              {t("settings.account")}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.personalInfo")}</CardTitle>
                <CardDescription>{t("settings.personalInfoDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("settings.fullName")}</Label>
                    <Input placeholder={t("settings.yourName")} {...register("name")} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("settings.age")}</Label>
                    <Input type="number" placeholder="25" min="13" max="120" {...register("age")} />
                    {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>{t("settings.gender")}</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {GENDER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue("gender", opt.value as ProfileUpdateInput["gender"])}
                        className={cn(
                          "p-2.5 rounded-lg border text-sm font-medium transition-all",
                          watchedValues.gender === opt.value
                            ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400"
                            : "border-border hover:border-border/80 hover:bg-secondary"
                        )}
                      >
                        {t(`gender.${opt.value}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>{t("settings.height")}</Label>
                    <Input type="number" placeholder="175" {...register("heightCm")} />
                    {errors.heightCm && <p className="text-xs text-destructive">{errors.heightCm.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("settings.currentWeight")}</Label>
                    <Input type="number" step="0.1" placeholder="70" {...register("currentWeightKg")} />
                    {errors.currentWeightKg && <p className="text-xs text-destructive">{errors.currentWeightKg.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("settings.targetWeight")}</Label>
                    <Input type="number" step="0.1" placeholder="65" {...register("targetWeightKg")} />
                    {errors.targetWeightKg && <p className="text-xs text-destructive">{errors.targetWeightKg.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.activityGoal")}</CardTitle>
                <CardDescription>
                  {t("settings.activityGoalDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeGoal && (
                  <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 flex flex-wrap gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-xs text-muted-foreground">{t("settings.dailyCalories")}</p>
                      <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{formatCalories(activeGoal.dailyCalories)}</p>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-muted-foreground">{t("settings.protein")}</p>
                      <p className="text-xl font-bold">{activeGoal.proteinGrams}g</p>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-muted-foreground">{t("settings.carbs")}</p>
                      <p className="text-xl font-bold">{activeGoal.carbsGrams}g</p>
                    </div>
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-muted-foreground">{t("settings.fat")}</p>
                      <p className="text-xl font-bold">{activeGoal.fatGrams}g</p>
                    </div>
                    <Badge variant="default" className="self-center">
                      {t(`goalTypes.${activeGoal.goalType}`)}
                    </Badge>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{t("settings.activityLevel")}</Label>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setValue("activityLevel", level.value as ProfileUpdateInput["activityLevel"])}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          watchedValues.activityLevel === level.value
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-border hover:border-border/80 hover:bg-secondary"
                        )}
                      >
                        <div className={cn(
                          "w-3.5 h-3.5 rounded-full border-2 flex-shrink-0",
                          watchedValues.activityLevel === level.value
                            ? "border-brand-500 bg-brand-500"
                            : "border-muted-foreground"
                        )} />
                        <div>
                          <p className="text-sm font-medium">{t(`activityLevels.${level.value}`)}</p>
                          <p className="text-xs text-muted-foreground">{t(`activityLevels.${level.value}_desc`)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.goalType")}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {GOAL_TYPES.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => setValue("goalType", goal.value as ProfileUpdateInput["goalType"])}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all",
                          watchedValues.goalType === goal.value
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-border hover:border-border/80 hover:bg-secondary"
                        )}
                      >
                        <p className={cn("text-sm font-semibold", goal.color)}>{t(`goalTypes.${goal.value}`)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t(`goalTypes.${goal.value}_desc`)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4">
            {/* Account Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.accountDetails")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border">
                  <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                    <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name || "No name set"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── EXPORT DATA ──────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t("settings.exportData")}
                </CardTitle>
                <CardDescription>{t("settings.exportDataDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-3">
                <Button asChild variant="outline" size="sm">
                  <a href="/api/export?type=meals" download>
                    <Utensils className="w-3.5 h-3.5" />
                    {t("settings.exportMeals")}
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="/api/export?type=weight" download>
                    <Scale className="w-3.5 h-3.5" />
                    {t("settings.exportWeight")}
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* ── FREE PLAN ─────────────────────────────────────── */}
            <Card className="border-brand-500/20 bg-brand-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" />
                    {t("settings.freePlan")}
                  </CardTitle>
                  {!isPremium && (
                    <Badge className="bg-brand-500 text-white text-xs">{t("settings.currentPlan")}</Badge>
                  )}
                </div>
                <CardDescription>{t("settings.freePlanDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FREE_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* ── PREMIUM PLAN ─────────────────────────────────── */}
            <Card className={cn(
              "border-yellow-500/20",
              isPremium ? "bg-yellow-500/5 border-yellow-400/40" : "bg-yellow-500/5"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    {t("settings.premiumPlan")}
                  </CardTitle>
                  {isPremium ? (
                    <Badge className="bg-yellow-500 text-white text-xs">
                      {t("settings.currentPlan")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-yellow-500/50 text-yellow-600 dark:text-yellow-400 text-xs">
                      {t("settings.premiumComingSoon")}
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {isPremium
                    ? t("premium.activatedDesc")
                    : t("settings.premiumFuture")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Feature list */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PREMIUM_FEATURES.map(({ label }) => (
                    <li key={label} className={cn(
                      "flex items-center gap-2 text-sm",
                      isPremium ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {isPremium ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                      )}
                      {label}
                    </li>
                  ))}
                </ul>

                {/* Pricing or activated state */}
                {!isPremium && (
                  <>
                    {!discountResult?.valid && (
                      <div className="flex gap-4 text-sm">
                        <div className="p-3 rounded-lg border border-border bg-card text-center flex-1">
                          <p className="text-xs text-muted-foreground mb-0.5">Monthly</p>
                          <p className="font-bold">{PREMIUM_CURRENCY}{PREMIUM_PRICE_MONTHLY}/mo</p>
                        </div>
                        <div className="p-3 rounded-lg border border-border bg-card text-center flex-1">
                          <p className="text-xs text-muted-foreground mb-0.5">Yearly</p>
                          <p className="font-bold">{PREMIUM_CURRENCY}{PREMIUM_PRICE_YEARLY}/yr</p>
                          <p className="text-[10px] text-brand-500">Save 33%</p>
                        </div>
                      </div>
                    )}

                    {/* Partial discount result */}
                    {discountResult?.valid && discountResult.finalMonthly > 0 && discountResult.code && (
                      <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-sm">
                        <div className="flex gap-4">
                          <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground">Monthly</p>
                            <p className="font-bold">{PREMIUM_CURRENCY}{discountResult.finalMonthly}/mo</p>
                            <p className="text-xs text-brand-500">{discountResult.code.discountPercent}% off</p>
                          </div>
                          <div className="text-center flex-1">
                            <p className="text-xs text-muted-foreground">Yearly</p>
                            <p className="font-bold">{PREMIUM_CURRENCY}{discountResult.finalYearly}/yr</p>
                            <p className="text-xs text-brand-500">{discountResult.code.discountPercent}% off</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Discount code input */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        {t("settings.discountCode")}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t("settings.discountCodePlaceholder")}
                          value={discountInput}
                          onChange={(e) => {
                            setDiscountInput(e.target.value);
                            if (discountResult) setDiscountResult(null);
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCode()}
                          className={cn(
                            discountResult?.valid === true && "border-brand-500",
                            discountResult?.valid === false && "border-destructive"
                          )}
                          disabled={activating}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCode}
                          disabled={!discountInput.trim() || activating}
                        >
                          {activating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            t("settings.applyCode")
                          )}
                        </Button>
                      </div>
                      {discountResult?.valid === false && (
                        <p className="text-xs text-destructive">{t("settings.invalidCodeDesc")}</p>
                      )}
                      {discountResult?.valid === true && discountResult.finalMonthly > 0 && (
                        <p className="text-xs text-brand-500">
                          ✓ {t("settings.validCode")} — {discountResult.code!.discountPercent}% {t("settings.validCodeDesc")}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Already premium */}
                {isPremium && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-700 dark:text-yellow-400">
                    <Crown className="w-4 h-4 flex-shrink-0" />
                    <span>Premium is active — all premium features are unlocked.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">{t("settings.dangerZone")}</CardTitle>
                <CardDescription>{t("settings.dangerZoneDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="w-4 h-4" />
                  {t("settings.signOutAllDevices")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save button */}
        <div className="mt-6">
          <Button type="submit" className="glow-green" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("settings.saving")}
              </>
            ) : (
              t("settings.saveChanges")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

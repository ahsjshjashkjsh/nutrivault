"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf, Loader2, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACTIVITY_LEVELS, GOAL_TYPES, GENDER_OPTIONS, APP_NAME } from "@/constants";
import { calculateNutritionTargets } from "@/utils/calorie-calculator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

interface CalcTargetsResult {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  maintenanceCalories: number;
  explanation: string;
  source: "ai" | "local";
}

interface OnboardingClientProps {
  userName: string;
}

const STEPS = ["basics", "body", "goal", "review"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingClient({ userName }: OnboardingClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("basics");
  const [loading, setLoading] = useState(false);
  const [fetchingTargets, setFetchingTargets] = useState(false);
  const [aiTargets, setAiTargets] = useState<CalcTargetsResult | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      activityLevel: "MODERATELY_ACTIVE",
      goalType: "MAINTAIN_WEIGHT",
      gender: "MALE",
    },
  });

  const watchedValues = watch();

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const nextStep = async () => {
    const fieldsToValidate: (keyof OnboardingInput)[] =
      step === "basics"
        ? ["age", "gender"]
        : step === "body"
        ? ["heightCm", "currentWeightKg", "targetWeightKg"]
        : step === "goal"
        ? ["activityLevel", "goalType"]
        : [];

    const valid = await trigger(fieldsToValidate);
    if (!valid) return;

    // When advancing to the review step, fetch AI-calculated targets
    if (step === "goal") {
      const v = getValues();
      if (v.age && v.gender && v.heightCm && v.currentWeightKg && v.activityLevel && v.goalType) {
        setFetchingTargets(true);
        try {
          const res = await fetch("/api/calc-targets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              age: Number(v.age),
              gender: v.gender,
              heightCm: Number(v.heightCm),
              weightKg: Number(v.currentWeightKg),
              targetWeightKg: v.targetWeightKg ? Number(v.targetWeightKg) : undefined,
              activityLevel: v.activityLevel,
              goalType: v.goalType,
            }),
          });
          if (res.ok) {
            const data: CalcTargetsResult = await res.json();
            setAiTargets(data);
          }
        } catch {
          // Ignore; review step will fall back to local estimate
        } finally {
          setFetchingTargets(false);
        }
      }
    }

    setStep(STEPS[stepIndex + 1]);
  };

  const onSubmit = async (data: OnboardingInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        toast({ title: t("onboarding.setupFailed"), description: error.error, variant: "destructive" });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast({ title: t("common.somethingWentWrong"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const targets =
    watchedValues.age &&
    watchedValues.gender &&
    watchedValues.heightCm &&
    watchedValues.currentWeightKg &&
    watchedValues.activityLevel &&
    watchedValues.goalType
      ? calculateNutritionTargets({
          age: Number(watchedValues.age),
          gender: watchedValues.gender,
          heightCm: Number(watchedValues.heightCm),
          weightKg: Number(watchedValues.currentWeightKg),
          activityLevel: watchedValues.activityLevel,
          goalType: watchedValues.goalType,
        })
      : null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-xl">{APP_NAME}</span>
      </div>

      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-muted-foreground">
              {t("onboarding.step")} {stepIndex + 1} {t("onboarding.of")} {STEPS.length}
            </p>
            <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step: Basics */}
          {step === "basics" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold mb-1">Hi {userName.split(" ")[0]}! 👋</h1>
                <p className="text-muted-foreground">
                  {t("onboarding.subtitle")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="age">{t("settings.age")}</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    min="13"
                    max="120"
                    {...register("age")}
                  />
                  {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>{t("settings.gender")}</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {GENDER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue("gender", opt.value as OnboardingInput["gender"])}
                        className={cn(
                          "p-3 rounded-xl border text-sm font-medium transition-all",
                          watchedValues.gender === opt.value
                            ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400"
                            : "border-border hover:border-border/80"
                        )}
                      >
                        {t(`gender.${opt.value}`)}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step: Body */}
          {step === "body" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold mb-1">{t("onboarding.yourBodyStats")}</h1>
                <p className="text-muted-foreground">
                  {t("onboarding.bodyStatsDesc")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="heightCm">{t("settings.height")}</Label>
                  <Input
                    id="heightCm"
                    type="number"
                    placeholder="175"
                    min="100"
                    max="250"
                    {...register("heightCm")}
                  />
                  {errors.heightCm && <p className="text-xs text-destructive">{errors.heightCm.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currentWeightKg">{t("settings.currentWeight")}</Label>
                  <Input
                    id="currentWeightKg"
                    type="number"
                    step="0.1"
                    placeholder="70"
                    {...register("currentWeightKg")}
                  />
                  {errors.currentWeightKg && <p className="text-xs text-destructive">{errors.currentWeightKg.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="targetWeightKg">{t("settings.targetWeight")}</Label>
                  <Input
                    id="targetWeightKg"
                    type="number"
                    step="0.1"
                    placeholder="65"
                    {...register("targetWeightKg")}
                  />
                  {errors.targetWeightKg && <p className="text-xs text-destructive">{errors.targetWeightKg.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step: Goal */}
          {step === "goal" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold mb-1">{t("onboarding.yourGoal")}</h1>
                <p className="text-muted-foreground">
                  {t("onboarding.goalDesc")}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("onboarding.activityLevel")}</Label>
                  <div className="space-y-2">
                    {ACTIVITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setValue("activityLevel", level.value as OnboardingInput["activityLevel"])}
                        className={cn(
                          "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                          watchedValues.activityLevel === level.value
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-border hover:border-border/80"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5",
                          watchedValues.activityLevel === level.value
                            ? "border-brand-500 bg-brand-500"
                            : "border-border"
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
                  <Label>{t("onboarding.goalType")}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {GOAL_TYPES.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => setValue("goalType", goal.value as OnboardingInput["goalType"])}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          watchedValues.goalType === goal.value
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-border hover:border-border/80"
                        )}
                      >
                        <p className={cn("text-sm font-semibold", goal.color)}>{t(`goalTypes.${goal.value}`)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t(`goalTypes.${goal.value}_desc`)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Review */}
          {step === "review" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold mb-1">{t("onboarding.yourPlanReady")}</h1>
                <p className="text-muted-foreground">
                  {t("onboarding.planReadyDesc")}
                </p>
              </div>

              {fetchingTargets ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12">
                  <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                  </div>
                  <p className="text-sm text-muted-foreground">Calculating your personalized targets…</p>
                </div>
              ) : (() => {
                // Use AI targets if available, otherwise fall back to local estimate
                const displayTargets = aiTargets ?? targets;
                if (!displayTargets) return null;
                return (
                  <>
                    <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20 space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t("onboarding.dailyCalorieTarget")}</p>
                        <p className="text-5xl font-bold text-brand-600 dark:text-brand-400 mt-1">
                          {displayTargets.calories.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{t("onboarding.kcalPerDay")}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-500/20">
                        {[
                          { labelKey: "settings.protein", value: `${displayTargets.proteinG}g`, color: "text-brand-600 dark:text-brand-400" },
                          { labelKey: "settings.carbs", value: `${displayTargets.carbsG}g`, color: "text-blue-400" },
                          { labelKey: "settings.fat", value: `${displayTargets.fatG}g`, color: "text-yellow-400" },
                        ].map((m) => (
                          <div key={m.labelKey} className="text-center">
                            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{t(m.labelKey)}</p>
                          </div>
                        ))}
                      </div>

                      {"maintenanceCalories" in displayTargets && (displayTargets as CalcTargetsResult).maintenanceCalories > 0 && (
                        <p className="text-center text-xs text-muted-foreground pt-1">
                          Maintenance: {(displayTargets as CalcTargetsResult).maintenanceCalories.toLocaleString()} kcal/day
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-muted/20 border border-border text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1 flex items-center gap-1.5">
                        {aiTargets?.source === "ai" && <Sparkles className="w-3.5 h-3.5 text-brand-500" />}
                        {t("onboarding.howWeCalculated")}
                      </p>
                      <p>
                        {aiTargets?.explanation || t("onboarding.calculationExplanation")}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {stepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(STEPS[stepIndex - 1])}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4" />
                {t("onboarding.back")}
              </Button>
            )}

            {step !== "review" ? (
              <Button type="button" onClick={nextStep} className="flex-1">
                {t("onboarding.continue")}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 glow-green"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {t("onboarding.startTracking")}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

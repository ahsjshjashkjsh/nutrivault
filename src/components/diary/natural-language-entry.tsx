"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, X, Zap, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import { formatCalories } from "@/lib/utils";
import type { AIMealAnalysis, AIMealFood } from "@/lib/nutrition-agent";
import { MealTypeSelect, type MealType } from "./meal-type-select";

interface NaturalLanguageEntryProps {
  open: boolean;
  mealType: MealType;
  date: string;
  onClose: () => void;
  onAddAIItems: (items: AIMealFood[], mealType: MealType) => Promise<void>;
}

export function NaturalLanguageEntry({
  open,
  mealType,
  date,
  onClose,
  onAddAIItems,
}: NaturalLanguageEntryProps) {
  const { t } = useLanguage();
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<AIMealAnalysis | null>(null);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [step, setStep] = useState<"input" | "review">("input");
  const [error, setError] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(mealType);

  useEffect(() => {
    if (open) setSelectedMealType(mealType);
  }, [open, mealType]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/meal-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meal: input.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Analysis failed" }));
        throw new Error(err.error || "Analysis failed");
      }

      const data: AIMealAnalysis = await res.json();
      setAnalysis(data);

      const initQty: Record<number, string> = {};
      data.foods.forEach((_, i) => { initQty[i] = "1"; });
      setQuantities(initQty);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const getAdjustedItem = (item: AIMealFood, index: number): AIMealFood => {
    const qty = parseFloat(quantities[index] || "1") || 1;
    return {
      ...item,
      servings: qty,
      calories: Math.round(item.calories * qty),
      proteinG: Math.round(item.proteinG * qty * 10) / 10,
      carbsG: Math.round(item.carbsG * qty * 10) / 10,
      fatG: Math.round(item.fatG * qty * 10) / 10,
    };
  };

  const adjustedItems = (analysis?.foods ?? []).map((item, i) => getAdjustedItem(item, i));
  const totalCalories = adjustedItems.reduce((s, i) => s + i.calories, 0);
  const totalProtein = adjustedItems.reduce((s, i) => s + i.proteinG, 0);
  const totalCarbs = adjustedItems.reduce((s, i) => s + i.carbsG, 0);
  const totalFat = adjustedItems.reduce((s, i) => s + i.fatG, 0);

  const handleRemoveItem = (index: number) => {
    if (!analysis) return;
    const updatedFoods = analysis.foods.filter((_, i) => i !== index);
    const updatedQty: Record<number, string> = {};
    updatedFoods.forEach((_, i) => { updatedQty[i] = quantities[i < index ? i : i + 1] || "1"; });
    setAnalysis({ ...analysis, foods: updatedFoods });
    setQuantities(updatedQty);
  };

  const handleAddAll = async () => {
    if (!analysis || adjustedItems.length === 0) return;
    setAdding(true);
    try {
      await onAddAIItems(adjustedItems, selectedMealType);
      handleClose();
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setInput("");
    setAnalysis(null);
    setQuantities({});
    setStep("input");
    setError(null);
    onClose();
  };

  const confidencePct = analysis ? Math.round(analysis.confidence * 100) : 0;
  const isAI = analysis?.source === "ai";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            {t("diary.nlp.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-5">
          <MealTypeSelect value={selectedMealType} onChange={setSelectedMealType} />
        </div>

        {step === "input" ? (
          <div className="p-6 space-y-5 flex flex-col flex-1">
            <p className="text-sm text-muted-foreground">
              {t("diary.nlp.placeholder")}
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
              <p>• 2 eggs, toast with butter, and coffee</p>
              <p>• 150g chicken breast with rice and salad</p>
              <p>• 1 slice of pizza and cola</p>
              <p>• S.Pellegrino and a caprese salad</p>
            </div>

            <div className="space-y-3 flex-1">
              <textarea
                autoFocus
                className="w-full h-28 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                placeholder={t("diary.nlp.placeholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAnalyze();
                }}
              />
              {error && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Ctrl+Enter to analyze</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                {t("diary.nlp.back")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleAnalyze}
                disabled={!input.trim() || analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("diary.nlp.analyzing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t("diary.nlp.analyze")}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t("diary.nlp.results")}
                </p>
                <div className="flex items-center gap-2">
                  {isAI ? (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">
                      <Zap className="w-2.5 h-2.5" />
                      AI · {confidencePct}% confidence
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      Offline estimate
                    </span>
                  )}
                </div>
              </div>

              {adjustedItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">{t("diary.nlp.noResults")}</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setStep("input")}>
                    {t("diary.nlp.back")}
                  </Button>
                </div>
              ) : (
                <>
                  {(analysis?.foods ?? []).map((item, index) => {
                    const adj = adjustedItems[index];
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card"
                      >
                        <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium capitalize">{item.name}</p>
                            {item.brand && (
                              <span className="text-xs text-muted-foreground">{item.brand}</span>
                            )}
                            {item.isNew && (
                              <span className="text-[10px] text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded-full font-medium">new</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Input
                              type="number"
                              min="0.1"
                              step="0.5"
                              value={quantities[index] ?? "1"}
                              onChange={(e) =>
                                setQuantities((prev) => ({ ...prev, [index]: e.target.value }))
                              }
                              className="h-7 w-20 text-xs px-2"
                            />
                            <span className="text-xs text-muted-foreground">
                              × {item.servingSize}g serving
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              {formatCalories(adj.calories)} {t("diary.nlp.calories")}
                            </span>
                            <span>P: {adj.proteinG}g</span>
                            <span>C: {adj.carbsG}g</span>
                            <span>F: {adj.fatG}g</span>
                            <span className="text-brand-500 text-[10px] font-medium ml-auto">
                              {t("diary.nlp.estimated")}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Total */}
                  <div className="p-3 rounded-xl bg-brand-500/8 border border-brand-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {t("diary.nlp.total")}
                      </span>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="text-muted-foreground">
                          P: {Math.round(totalProtein)}g · C: {Math.round(totalCarbs)}g · F: {Math.round(totalFat)}g
                        </span>
                        <span className="text-brand-600 dark:text-brand-400 text-sm">
                          {formatCalories(totalCalories)} kcal
                        </span>
                      </div>
                    </div>
                    {analysis?.notes && (
                      <p className="text-[10px] text-muted-foreground mt-1.5">{analysis.notes}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {adjustedItems.length > 0 && (
              <div className="p-6 pt-0 flex gap-3 border-t border-border mt-auto">
                <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>
                  {t("diary.nlp.back")}
                </Button>
                <Button className="flex-1" onClick={handleAddAll} disabled={adding}>
                  {adding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("diary.nlp.adding")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {t("diary.nlp.addAll")}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

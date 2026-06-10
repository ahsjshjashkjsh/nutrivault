"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Crown,
  ImagePlus,
  Loader2,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCalories } from "@/lib/utils";
import type { AIMealFood } from "@/lib/nutrition-agent";
import { MealTypeSelect, type MealType } from "./meal-type-select";

interface PhotoMealAnalysisProps {
  open: boolean;
  mealType: MealType;
  date: string;
  isPremium: boolean;
  onClose: () => void;
  onAddAIItems: (items: AIMealFood[], mealType: MealType) => Promise<void>;
}

type Step = "upload" | "analyzing" | "review";

interface AnalysisResult {
  foods: AIMealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes: string;
  confidence: number;
  source: "ai";
}

export function PhotoMealAnalysis({
  open,
  mealType,
  date,
  isPremium,
  onClose,
  onAddAIItems,
}: PhotoMealAnalysisProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(mealType);

  useEffect(() => {
    if (open) setSelectedMealType(mealType);
  }, [open, mealType]);

  const handleClose = () => {
    setStep("upload");
    setPreviewUrl(null);
    setSelectedFile(null);
    setAnalysis(null);
    setQuantities({});
    setError(null);
    setAdding(false);
    setIsDragging(false);
    onClose();
  };

  const applyFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Please use an image under 10 MB.");
      return;
    }
    setError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setStep("analyzing");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/photo-meal-analysis", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      setAnalysis(data as AnalysisResult);
      const initQty: Record<number, string> = {};
      (data.foods as AIMealFood[]).forEach((_, i) => { initQty[i] = "1"; });
      setQuantities(initQty);
      setStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
      setStep("upload");
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

  const handleRemoveItem = (index: number) => {
    if (!analysis) return;
    const updatedFoods = analysis.foods.filter((_, i) => i !== index);
    const updatedQty: Record<number, string> = {};
    updatedFoods.forEach((_, i) => {
      updatedQty[i] = quantities[i < index ? i : i + 1] || "1";
    });
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

  const adjustedItems = (analysis?.foods ?? []).map((item, i) => getAdjustedItem(item, i));
  const totalCalories = adjustedItems.reduce((s, i) => s + i.calories, 0);
  const totalProtein = adjustedItems.reduce((s, i) => s + i.proteinG, 0);
  const totalCarbs = adjustedItems.reduce((s, i) => s + i.carbsG, 0);
  const totalFat = adjustedItems.reduce((s, i) => s + i.fatG, 0);
  const confidencePct = analysis ? Math.round(analysis.confidence * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-brand-500" />
            Analyze food photo
          </DialogTitle>
        </DialogHeader>

        {/* ── Premium gate ─────────────────────────────────────────── */}
        {isPremium && (
          <div className="px-6 pt-5">
            <MealTypeSelect value={selectedMealType} onChange={setSelectedMealType} />
          </div>
        )}

        {!isPremium ? (
          <div className="flex flex-col items-center justify-center gap-5 p-8 text-center flex-1">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <div>
              <p className="text-base font-semibold">Premium feature</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Photo meal analysis is available for premium subscribers. Upgrade to
                instantly estimate calories from any food photo.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>AI-powered photo recognition</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>Instant calorie &amp; macro estimates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span>Edit &amp; save directly to your diary</span>
              </div>
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  handleClose();
                  window.location.href = "/settings";
                }}
              >
                <Crown className="w-4 h-4" />
                Upgrade
              </Button>
            </div>
          </div>
        ) : step === "upload" ? (
          /* ── Upload step ─────────────────────────────────────────── */
          <div className="p-6 space-y-5 flex flex-col flex-1">
            {/* Drop zone */}
            <div
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors cursor-pointer
                ${isDragging
                  ? "border-brand-500 bg-brand-500/5"
                  : "border-border hover:border-brand-500/50 hover:bg-secondary/30"
                }
                ${previewUrl ? "p-2" : "p-10"}
              `}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {previewUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Meal preview"
                    className="max-h-52 w-full object-contain rounded-lg"
                  />
                  <p className="text-xs text-muted-foreground">Click to change photo</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Drop a photo here</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      or click to browse · JPEG, PNG, WebP · max 10 MB
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Works best with clear, well-lit photos</span>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 mt-auto">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedFile}
                onClick={handleAnalyze}
              >
                <Camera className="w-4 h-4" />
                Analyze photo
              </Button>
            </div>
          </div>
        ) : step === "analyzing" ? (
          /* ── Analyzing step ──────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center gap-5 p-10 flex-1 text-center">
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Meal preview"
                className="max-h-40 w-full object-contain rounded-lg opacity-70"
              />
            )}
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold">Analyzing your meal…</p>
              <p className="text-xs text-muted-foreground mt-1">
                AI is detecting foods and estimating nutrition
              </p>
            </div>
          </div>
        ) : (
          /* ── Review step ─────────────────────────────────────────── */
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {/* Photo thumbnail + confidence */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Meal"
                      className="w-10 h-10 object-cover rounded-lg border border-border"
                    />
                  )}
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Detected foods
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-medium text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">
                  <Zap className="w-2.5 h-2.5" />
                  AI · {confidencePct}% confidence
                </span>
              </div>

              {adjustedItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No foods to add.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setStep("upload")}
                  >
                    Try another photo
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
                              <span className="text-[10px] text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded-full font-medium">
                                new
                              </span>
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
                              {formatCalories(adj.calories)} kcal
                            </span>
                            <span>P: {adj.proteinG}g</span>
                            <span>C: {adj.carbsG}g</span>
                            <span>F: {adj.fatG}g</span>
                            <span className="text-brand-500 text-[10px] font-medium ml-auto">
                              estimated
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

                  {/* Totals */}
                  <div className="p-3 rounded-xl bg-brand-500/8 border border-brand-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Total
                      </span>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="text-muted-foreground">
                          P: {Math.round(totalProtein)}g · C: {Math.round(totalCarbs)}g · F:{" "}
                          {Math.round(totalFat)}g
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
                <Button variant="outline" className="flex-1" onClick={() => setStep("upload")}>
                  New photo
                </Button>
                <Button className="flex-1" onClick={handleAddAll} disabled={adding}>
                  {adding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Add to diary
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

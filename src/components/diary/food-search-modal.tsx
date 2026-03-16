"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Search, ChevronLeft, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatCalories } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";
import { toast } from "@/hooks/use-toast";

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

interface FoodItem {
  id: string;
  name: string;
  brand?: string | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSize: number;
  servingUnit: string;
  source?: string | null;
}

interface FoodSearchModalProps {
  open: boolean;
  mealType: MealType;
  date: string;
  onClose: () => void;
  onAddEntry: (
    mealType: MealType,
    foodId: string,
    servings: number,
    servingSize: number,
    servingUnit: string
  ) => Promise<void>;
}

type ModalView = "search" | "serving" | "create";

export function FoodSearchModal({
  open,
  mealType,
  date,
  onClose,
  onAddEntry,
}: FoodSearchModalProps) {
  const { t } = useLanguage();
  const [view, setView] = useState<ModalView>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState("1");
  const [servingSize, setServingSize] = useState("");
  const [adding, setAdding] = useState(false);

  // Create food form state
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    brand: "",
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
    fiberG: "",
    sugarG: "",
    servingSize: "100",
    servingUnit: "g",
  });

  const mealLabel = t(`diary.mealType.${mealType.toLowerCase()}`);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/foods?q=${encodeURIComponent(q)}&limit=15`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.foods || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (open) {
      search("");
      setSelected(null);
      setQuery("");
      setServings("1");
      setView("search");
      setCreateForm({
        name: "",
        brand: "",
        calories: "",
        proteinG: "",
        carbsG: "",
        fatG: "",
        fiberG: "",
        sugarG: "",
        servingSize: "100",
        servingUnit: "g",
      });
    }
  }, [open, search]);

  const handleSelect = (food: FoodItem) => {
    setSelected(food);
    setServingSize(food.servingSize.toString());
    setView("serving");
  };

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      let foodId = selected.id;

      // OpenFoodFacts foods have temp IDs starting with "off-"
      // We must save them to DB first so the diary entry has a real FK
      if (selected.source === "openfoodfacts" || selected.id.startsWith("off-")) {
        const saveRes = await fetch("/api/foods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: selected.name,
            brand: selected.brand || undefined,
            calories: selected.calories,
            proteinG: selected.proteinG,
            carbsG: selected.carbsG,
            fatG: selected.fatG,
            servingSize: selected.servingSize,
            servingUnit: selected.servingUnit,
          }),
        });
        if (saveRes.ok) {
          const { food } = await saveRes.json();
          foodId = food.id;
        }
      }

      await onAddEntry(
        mealType,
        foodId,
        parseFloat(servings) || 1,
        parseFloat(servingSize) || selected.servingSize,
        selected.servingUnit
      );
    } finally {
      setAdding(false);
      setSelected(null);
      setView("search");
    }
  };

  const handleCreateFood = async () => {
    const name = createForm.name.trim();
    const calories = parseFloat(createForm.calories);
    if (!name || isNaN(calories)) return;
    setCreating(true);
    try {
      const res = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand: createForm.brand.trim() || undefined,
          calories,
          proteinG: parseFloat(createForm.proteinG) || 0,
          carbsG: parseFloat(createForm.carbsG) || 0,
          fatG: parseFloat(createForm.fatG) || 0,
          fiberG: createForm.fiberG ? parseFloat(createForm.fiberG) : undefined,
          sugarG: createForm.sugarG ? parseFloat(createForm.sugarG) : undefined,
          servingSize: parseFloat(createForm.servingSize) || 100,
          servingUnit: createForm.servingUnit.trim() || "g",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        toast({ title: t("diary.createFoodFailed"), description: err.error, variant: "destructive" });
        return;
      }

      const { food } = await res.json();
      toast({ title: t("diary.createFoodSuccess"), description: t("diary.createFoodSuccessDesc") });

      // Pre-select the newly created food so user can immediately add it
      setSelected(food);
      setServingSize(food.servingSize.toString());
      setView("serving");
    } catch {
      toast({ title: t("diary.createFoodFailed"), variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const previewCalories = selected
    ? Math.round(
        (selected.calories * (parseFloat(servings) || 1) * (parseFloat(servingSize) || selected.servingSize)) /
          selected.servingSize
      )
    : 0;

  const cf = (k: keyof typeof createForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCreateForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle>
            {view === "create"
              ? t("diary.createFoodTitle")
              : `${t("diary.addTo")} ${mealLabel}`}
          </DialogTitle>
        </DialogHeader>

        {/* ── SEARCH VIEW ── */}
        {view === "search" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-6 py-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder={t("diary.searchFoods")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10"
                onClick={() => setView("create")}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {t("diary.createFood")}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {query ? t("diary.noFoodsFound") : t("diary.startTyping")}
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => handleSelect(food)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-secondary transition-colors text-left group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.brand && `${food.brand} · `}
                          {food.servingSize}{food.servingUnit}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        <div className="text-right text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {formatCalories(food.calories)} kcal
                          </p>
                          <p>P:{Math.round(food.proteinG)}g C:{Math.round(food.carbsG)}g F:{Math.round(food.fatG)}g</p>
                        </div>
                        <Plus className="w-4 h-4 text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SERVING VIEW ── */}
        {view === "serving" && selected && (
          <div className="p-6 space-y-6 flex-1">
            <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <p className="font-semibold">{selected.name}</p>
              {selected.brand && (
                <p className="text-sm text-muted-foreground">{selected.brand}</p>
              )}
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                {[
                  { label: t("diary.caloriesLabel"), value: `${previewCalories} kcal`, accent: true },
                  { label: t("diary.protein"), value: `${Math.round(selected.proteinG * (parseFloat(servings)||1) * (parseFloat(servingSize)||selected.servingSize) / selected.servingSize)}g` },
                  { label: t("diary.carbohydrates"), value: `${Math.round(selected.carbsG * (parseFloat(servings)||1) * (parseFloat(servingSize)||selected.servingSize) / selected.servingSize)}g` },
                  { label: t("diary.fat"), value: `${Math.round(selected.fatG * (parseFloat(servings)||1) * (parseFloat(servingSize)||selected.servingSize) / selected.servingSize)}g` },
                ].map((item) => (
                  <div key={item.label} className="text-xs">
                    <p className="text-muted-foreground">{item.label}</p>
                    <p className={`font-semibold mt-0.5 ${item.accent ? "text-brand-600 dark:text-brand-400" : ""}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("diary.servings")}</Label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("diary.servingSize")} ({selected.servingUnit})</Label>
                <Input
                  type="number"
                  min="1"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setView("search")}>
                {t("diary.back")}
              </Button>
              <Button className="flex-1" onClick={handleAdd} disabled={adding}>
                {adding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t("diary.add")} {previewCalories} kcal
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── CREATE FOOD VIEW ── */}
        {view === "create" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>{t("diary.foodNameLabel")} *</Label>
                <Input
                  autoFocus
                  placeholder="S.Pellegrino, Chicken tikka..."
                  value={createForm.name}
                  onChange={cf("name")}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>{t("diary.brandLabel")}</Label>
                <Input
                  placeholder="Nestlé, Barilla..."
                  value={createForm.brand}
                  onChange={cf("brand")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("diary.caloriesLabel")} *</Label>
                <Input type="number" min="0" placeholder="0" value={createForm.calories} onChange={cf("calories")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("diary.protein")} (g)</Label>
                <Input type="number" min="0" placeholder="0" value={createForm.proteinG} onChange={cf("proteinG")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("diary.carbohydrates")} (g)</Label>
                <Input type="number" min="0" placeholder="0" value={createForm.carbsG} onChange={cf("carbsG")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("diary.fat")} (g)</Label>
                <Input type="number" min="0" placeholder="0" value={createForm.fatG} onChange={cf("fatG")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("diary.fiberLabel")}</Label>
                <Input type="number" min="0" placeholder="0" value={createForm.fiberG} onChange={cf("fiberG")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("diary.sugarLabel")}</Label>
                <Input type="number" min="0" placeholder="0" value={createForm.sugarG} onChange={cf("sugarG")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("diary.servingSize")}</Label>
                <Input type="number" min="0.1" placeholder="100" value={createForm.servingSize} onChange={cf("servingSize")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("diary.servingUnitLabel")}</Label>
                <Input placeholder="g, ml, piece..." value={createForm.servingUnit} onChange={cf("servingUnit")} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setView("search")}
              >
                <ChevronLeft className="w-4 h-4" />
                {t("diary.back")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateFood}
                disabled={creating || !createForm.name || !createForm.calories}
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {t("diary.createFood")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

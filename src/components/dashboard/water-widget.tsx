"use client";

import { Droplets, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { percentOf } from "@/lib/utils";
import { WATER_QUICK_ADD } from "@/constants";
import { useLanguage } from "@/contexts/language-context";

interface WaterWidgetProps {
  current: number;
  target: number;
  onAdd: (ml: number) => void;
}

export function WaterWidget({ current, target, onAdd }: WaterWidgetProps) {
  const { t } = useLanguage();
  const pct = Math.min(percentOf(current, target), 100);
  const remaining = Math.max(0, target - current);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          {t("dashboard.waterIntake")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wave-style progress */}
        <div className="relative flex flex-col items-center">
          <div className="water-vessel relative w-28 h-28 rounded-full border-4 border-blue-500/20 bg-blue-500/5 flex items-center justify-center overflow-hidden">
            <div
              className="water-level absolute bottom-0 left-0 right-0 bg-blue-500/30 transition-all duration-700"
              style={{ height: `${pct}%` }}
            />
            <div className="relative text-center z-10">
              <p className="text-lg font-bold text-blue-500">
                {(current / 1000).toFixed(1)}L
              </p>
              <p className="text-xs text-muted-foreground">{t("dashboard.of")} {(target / 1000).toFixed(1)}L</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {remaining > 0
            ? `${(remaining / 1000).toFixed(1)}${t("dashboard.waterRemaining")}`
            : t("dashboard.waterGoalReached")}
        </p>

        {/* Quick add buttons */}
        <div className="grid grid-cols-2 gap-2">
          {WATER_QUICK_ADD.map((ml) => (
            <Button
              key={ml}
              variant="muted"
              size="sm"
              className="text-xs"
              onClick={() => onAdd(ml)}
            >
              <Plus className="w-3 h-3" />
              {ml}ml
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

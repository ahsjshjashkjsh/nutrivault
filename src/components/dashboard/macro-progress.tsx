"use client";

import { cn, percentOf } from "@/lib/utils";

interface MacroProgressProps {
  label: string;
  consumed: number;
  target: number;
  color: string;
  unit: string;
}

export function MacroProgress({ label, consumed, target, color, unit }: MacroProgressProps) {
  const pct = Math.min(percentOf(consumed, target), 100);
  const isOver = consumed > target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={cn("font-semibold tabular-nums", isOver && "text-red-400")}>
            {Math.round(consumed)}{unit}
          </span>
          <span className="text-muted-foreground text-xs">/ {target}{unit}</span>
        </div>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

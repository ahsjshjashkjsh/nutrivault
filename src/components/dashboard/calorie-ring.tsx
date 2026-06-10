"use client";

import { useEffect, useState } from "react";
import { formatCalories } from "@/lib/utils";

interface CalorieRingProps {
  consumed: number;
  target: number;
  percent: number;
}

export function CalorieRing({ consumed, target, percent }: CalorieRingProps) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  // Start fully empty, then animate to the real value on mount
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const progress = drawn ? Math.min(percent, 100) / 100 : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const getColor = () => {
    if (percent >= 110) return "#ef4444";
    if (percent >= 95) return "#f59e0b";
    return "#22c55e";
  };
  const isOver = percent >= 95;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        className="-rotate-90"
      >
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#22c55e" floodOpacity="0.45" />
          </filter>
        </defs>
        {/* Background circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={isOver ? getColor() : "url(#ring-gradient)"}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter={isOver ? undefined : "url(#ring-glow)"}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.3s" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-bold font-display tabular-nums">
          {formatCalories(consumed)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          of {formatCalories(target)} kcal
        </p>
        <p
          className="text-xs font-semibold mt-1 tabular-nums"
          style={{ color: getColor() }}
        >
          {Math.round(percent)}%
        </p>
      </div>
    </div>
  );
}

"use client";

import { formatCalories } from "@/lib/utils";

interface CalorieRingProps {
  consumed: number;
  target: number;
  percent: number;
}

export function CalorieRing({ consumed, target, percent }: CalorieRingProps) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  const getColor = () => {
    if (percent >= 110) return "#ef4444";
    if (percent >= 95) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        className="-rotate-90"
      >
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
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out, stroke 0.3s" }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-bold tabular-nums">
          {formatCalories(consumed)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          of {formatCalories(target)} kcal
        </p>
        <p
          className="text-xs font-semibold mt-1"
          style={{ color: getColor() }}
        >
          {Math.round(percent)}%
        </p>
      </div>
    </div>
  );
}

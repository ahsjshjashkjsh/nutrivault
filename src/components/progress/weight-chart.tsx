"use client";

import type { WeightEntry } from "@prisma/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";

interface WeightChartProps {
  entries: WeightEntry[];
  target?: number | null;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold">{payload[0].value.toFixed(1)} kg</p>
      </div>
    );
  }
  return null;
};

export function WeightChart({ entries, target }: WeightChartProps) {
  const data = entries.map((e) => ({
    date: format(new Date(e.date), "MMM d"),
    weight: e.weightKg,
  }));

  const weights = entries.map((e) => e.weightKg);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const padding = Math.max(2, (maxWeight - minWeight) * 0.2);
  const yMin = Math.floor(minWeight - padding);
  const yMax = Math.ceil(maxWeight + padding);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[yMin, yMax]}
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}kg`}
        />
        <Tooltip content={<CustomTooltip />} />
        {target && (
          <ReferenceLine
            y={target}
            stroke="#3b82f6"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{ value: "Target", fill: "#3b82f6", fontSize: 10, position: "right" }}
          />
        )}
        <Area
          type="monotone"
          dataKey="weight"
          stroke="#22c55e"
          strokeWidth={2.5}
          fill="url(#weightGrad)"
          dot={{ fill: "#22c55e", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: "#22c55e" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

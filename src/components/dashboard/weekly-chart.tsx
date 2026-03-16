"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { CHART_COLORS } from "@/constants";

interface WeeklyChartProps {
  data: Array<{
    date: string;
    day: string;
    calories: number;
  }>;
  target: number;
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
        <p className="text-sm font-semibold">{Math.round(payload[0].value).toLocaleString()} kcal</p>
      </div>
    );
  }
  return null;
};

export function WeeklyChart({ data, target }: WeeklyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={24} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        <XAxis
          dataKey="day"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
        <ReferenceLine
          y={target}
          stroke={CHART_COLORS.primary}
          strokeDasharray="4 4"
          strokeOpacity={0.5}
        />
        <Bar
          dataKey="calories"
          fill={CHART_COLORS.primary}
          radius={[4, 4, 0, 0]}
          fillOpacity={0.85}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface CalorieLog {
  date: string;
  day: string;
  calories: number;
  logged: boolean;
}

interface CalorieChartProps {
  logs: CalorieLog[];
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
        <p className="text-sm font-semibold">
          {payload[0].value > 0
            ? `${Math.round(payload[0].value).toLocaleString()} kcal`
            : "Not logged"}
        </p>
      </div>
    );
  }
  return null;
};

export function CalorieChart({ logs, target }: CalorieChartProps) {
  const displayLogs = logs.filter((_, i) => i % 3 === 0 || i === logs.length - 1 || logs[i].logged);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={logs} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="day"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${Math.round(v / 1000)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        {target && (
          <ReferenceLine
            y={target}
            stroke="#22c55e"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{ value: "Target", fill: "#22c55e", fontSize: 10, position: "right" }}
          />
        )}
        <Area
          type="monotone"
          dataKey="calories"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#calGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#f59e0b" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function StatCard({ label, value, subtext, icon, color, bgColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bgColor, color)}>
          {icon}
        </div>
      </div>
      <p className={cn("text-2xl font-bold tabular-nums", color)}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <p className="text-xs text-muted-foreground/60 mt-0.5">{subtext}</p>
    </div>
  );
}

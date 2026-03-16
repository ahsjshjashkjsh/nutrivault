import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-6 px-4" : "py-16 px-6",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mb-4">
          {icon}
        </div>
      )}
      <h3 className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base")}>
        {title}
      </h3>
      {description && (
        <p className={cn("text-muted-foreground mt-1", compact ? "text-xs" : "text-sm max-w-xs")}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

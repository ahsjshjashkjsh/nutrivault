import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/20",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/15 text-destructive border border-destructive/20",
        outline: "border border-border text-muted-foreground",
        muted: "bg-muted text-muted-foreground",
        blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        yellow: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20",
        orange: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20",
        purple: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

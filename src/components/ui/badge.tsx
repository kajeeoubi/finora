import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
        secondary:
          "bg-muted text-muted-foreground",
        destructive:
          "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
        outline: "text-foreground border border-border",
        income:
          "bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300",
        expense:
          "bg-[#FEE2E2] text-[#B91C1C] dark:bg-rose-950/60 dark:text-rose-300",
        warning:
          "bg-[#FEF3C7] text-[#B45309] dark:bg-amber-950/60 dark:text-amber-300",
        lime:
          "bg-[#B6F23D] text-[#17171B] font-bold",
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

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-violet-600 text-white shadow hover:bg-violet-700 active:bg-violet-800",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline:
          "border border-border bg-card shadow-sm hover:bg-muted text-foreground",
        secondary:
          "bg-violet-100 text-violet-700 hover:bg-violet-200",
        ghost: "hover:bg-muted text-foreground",
        link: "text-violet-600 underline-offset-4 hover:underline",
        dark: "bg-ink-950 text-white hover:bg-ink-900 border border-white/10",
        surface: "bg-surface-muted text-foreground hover:bg-muted",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-full px-3 text-xs",
        lg: "h-12 rounded-full px-7 text-base font-semibold",
        icon: "h-10 w-10 rounded-full",
        iconSm: "h-8 w-8 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

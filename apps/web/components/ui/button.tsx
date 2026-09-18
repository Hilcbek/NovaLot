// components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all duration-150 outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // bg-brand-panel + text-brand-panel-foreground is CORRECT here —
        // this is a solid background with dedicated foreground token, not
        // text sitting directly on bg-background. Leave this pair as-is.
        default:
          "bg-brand-panel text-brand-panel-foreground shadow-none hover:opacity-90 active:opacity-80",

        // This is the one that breaks in dark mode if it says text-brand-panel.
        // text-foreground is theme-aware (dark text in light mode, light text
        // in dark mode) since there's no solid brand background here to give
        // it a matching foreground token.
        outline:
          "border border-border bg-transparent text-foreground shadow-none hover:bg-muted active:bg-muted/80",

        ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted/80",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
// components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-sm bg-muted px-3 py-2 text-base outline-none",
        "border-0 shadow-none transition-colors",
        "placeholder:text-muted-foreground text-foreground",
        "focus-visible:bg-muted/70 focus-visible:ring-1 focus-visible:ring-brand-accent/40",
        "aria-invalid:ring-1 aria-invalid:ring-destructive/50 aria-invalid:bg-destructive/5",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
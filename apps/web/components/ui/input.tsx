// components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-sm bg-[#173A2C]/[0.04] px-3 py-2 text-base outline-none",
        "border-0 shadow-none transition-colors",
        "placeholder:text-[#173A2C]/40 text-[#173A2C]",
        "focus-visible:bg-[#173A2C]/[0.06] focus-visible:ring-1 focus-visible:ring-[#173A2C]/30",
        "aria-invalid:ring-1 aria-invalid:ring-red-500/50 aria-invalid:bg-red-50",
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
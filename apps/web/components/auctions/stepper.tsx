// components/auctions/stepper.tsx
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center">
      {steps.map((label, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  isComplete && "border-brand-accent bg-brand-accent text-white",
                  isCurrent && "border-brand-accent text-brand-accent",
                  !isComplete && !isCurrent && "border-border text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  (isComplete || isCurrent) ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 h-0.5 flex-1 transition-colors",
                  isComplete ? "bg-brand-accent" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
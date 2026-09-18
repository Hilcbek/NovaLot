// components/mode-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  function toggleTheme() {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    // Fall back to an instant switch on browsers without the View Transitions API
    if (!document.startViewTransition) {
      setTheme(next);
      return;
    }

    document.startViewTransition(() => {
      setTheme(next);
    });
  }

  if (!mounted) {
    return <div className="h-7 w-12 rounded-full bg-muted" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "relative h-7 w-12 rounded-full border border-border transition-colors duration-300",
        isDark ? "bg-brand-panel" : "bg-muted",
      )}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm"
        animate={{ x: isDark ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="h-3 w-3 text-brand-panel" strokeWidth={2.2} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="h-3 w-3 text-brand-gold" strokeWidth={2.2} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
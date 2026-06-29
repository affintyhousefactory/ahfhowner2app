"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/shared/lib/cn";

/* Jauge FOMO « X / 12 réservées ». Phase 1 : valeurs statiques,
   branchées sur Supabase Realtime en Phase 4. */
export function Gauge({
  reserved,
  total,
  variant = "full",
  className,
}: {
  reserved: number;
  total: number;
  variant?: "full" | "mini";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(reduce ? reserved : 0);

  useEffect(() => {
    if (!inView || reduce) {
      setCount(reserved);
      return;
    }
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= reserved) clearInterval(id);
    }, 140);
    return () => clearInterval(id);
  }, [inView, reserved, reduce]);

  const remaining = total - reserved;

  if (variant === "mini") {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2.5", className)}
        aria-label={`${reserved} sur ${total} réservées`}
      >
        <div className="flex gap-[3px]">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-3.5 w-[3px] rounded-full transition-colors duration-500",
                i < count ? "bg-accent" : "bg-ink/15",
              )}
            />
          ))}
        </div>
        <span className="font-mono text-xs tabular-nums text-muted">
          {reserved}/{total}
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div className="flex items-end justify-between">
        <div className="eyebrow">Série 01 — réservations en direct</div>
        <div className="font-mono text-xs tabular-nums text-muted">
          {remaining > 0 ? `${remaining} encore disponibles` : "Complet"}
        </div>
      </div>

      <div
        className="mt-3 grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
        aria-label={`${reserved} exemplaires réservés sur ${total}`}
      >
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            className="relative h-12 overflow-hidden rounded-md bg-ink/[0.06]"
          >
            <motion.span
              className="absolute inset-0 bg-accent"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: i < count ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "bottom" }}
            />
            <span
              className={cn(
                "absolute inset-x-0 bottom-1 text-center font-mono text-[0.6rem] tabular-nums transition-colors duration-300",
                i < count ? "text-white/80" : "text-muted",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-2xl tabular-nums text-ink">
          {String(count).padStart(2, "0")}
        </span>
        <span className="font-mono text-sm text-muted">
          / {total} réservées
        </span>
      </div>
    </div>
  );
}

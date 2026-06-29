"use client";

import Link from "next/link";
import { SERIES_DEADLINE_ISO, SERIES_DEADLINE_LABEL } from "@/lib/site";
import { useCountdown } from "@/components/effects/useCountdown";
import { cn } from "@/shared/lib/cn";

const pad = (n: number) => n.toString().padStart(2, "0");

/* CountdownBanner — affichage FOMO du compte à rebours Série 01.
   Variantes :
   - `bar`     : bandeau fin sticky en haut de page (placé au-dessus de Nav).
   - `compact` : inline (utilisé dans Devis / Reservation).
   SSR-safe : tant que `ready` est faux côté client, on rend la structure
   sans chiffres (pas de mismatch hydratation). Caché si `done`. */
export function CountdownBanner({
  variant = "bar",
  className,
  href = "/configurer",
}: {
  variant?: "bar" | "compact";
  className?: string;
  href?: string;
}) {
  const { days, hours, minutes, seconds, done, ready } =
    useCountdown(SERIES_DEADLINE_ISO);

  if (done) return null;

  const time = ready
    ? `J-${days} · ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : "J-… · --:--:--";

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5",
          className,
        )}
        aria-label={SERIES_DEADLINE_LABEL}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
          Série 01
        </span>
        <span className="font-mono text-xs tabular-nums text-ink">{time}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-[60] bg-ink text-canvas",
        "border-b border-canvas/10",
        className,
      )}
      role="region"
      aria-label={SERIES_DEADLINE_LABEL}
    >
      <Link
        href={href}
        className="container-page flex h-8 items-center justify-center gap-3 text-[0.72rem] tracking-tight transition-colors hover:text-white md:gap-4"
      >
        <span className="font-mono uppercase tracking-[0.18em] text-canvas/70">
          {SERIES_DEADLINE_LABEL}
        </span>
        <span aria-hidden className="text-canvas/30">
          ·
        </span>
        <span className="font-mono tabular-nums">{time}</span>
        <span aria-hidden className="hidden text-canvas/30 md:inline">
          ·
        </span>
        <span className="hidden text-canvas/80 md:inline">Réserver →</span>
      </Link>
    </div>
  );
}

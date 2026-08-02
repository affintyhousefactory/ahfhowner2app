"use client";

/**
 * Composants partagés du configurateur v2 (ADR-030, `docs/design/configurateur-v2.md`).
 *
 * Règles qui gouvernent ce fichier :
 * — toute commande est un <button> porteur de son état ARIA, jamais un <div>
 *   cliquable ;
 * — une mention essentielle est visible sans interaction, le détail s'ouvre au
 *   clic ou au toucher, jamais au seul survol (§10) ;
 * — cibles tactiles ≥ 44 px sur les en-têtes, ≥ 48 px sur les CTA.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/shared/lib/cn";
import { eur } from "./store";
import type { MentionTexte } from "@/lib/configurateur/mentions";
import type { Ambiance } from "@/lib/configurateur/config";

/* ------------------------------------------------------------------ */
/* Section dépliante — le résumé remplace le compteur d'étapes         */
/* ------------------------------------------------------------------ */

export function Section({
  n,
  titre,
  resume,
  ouvertParDefaut,
  children,
}: {
  n: number;
  titre: string;
  /** Choix courant, lisible sans déplier. C'est ce qui remplace « étape 3/7 ». */
  resume: string;
  ouvertParDefaut?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={ouvertParDefaut} className="border-b border-line">
      <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-4 py-3.5 transition-colors hover:bg-paper [&::-webkit-details-marker]:hidden">
        <span className="w-[18px] shrink-0 font-mono text-[0.66rem] tracking-[0.08em] text-accent">
          {String(n).padStart(2, "0")}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[0.94rem] font-semibold text-ink">{titre}</span>
          <span className="truncate text-[0.76rem] text-muted">{resume}</span>
        </span>
        <svg
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 text-muted transition-transform [details[open]_&]:rotate-180"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>
    </details>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted">{children}</p>
  );
}

/* ------------------------------------------------------------------ */
/* Mention — courte visible, détail dépliable                          */
/* ------------------------------------------------------------------ */

export function Mention({ texte }: { texte: MentionTexte }) {
  return (
    <div className="flex flex-col gap-1.5">
      {texte.courte && (
        <p className="font-mono text-[0.64rem] leading-relaxed text-muted">{texte.courte}</p>
      )}
      <details className="border-t border-dashed border-line pt-1.5">
        <summary className="flex min-h-[28px] cursor-pointer list-none items-center text-xs font-medium text-accent [&::-webkit-details-marker]:hidden">
          Détail
        </summary>
        <p className="pb-1 pt-1.5 text-[0.76rem] leading-relaxed text-muted">{texte.detail}</p>
      </details>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Carte de choix                                                      */
/* ------------------------------------------------------------------ */

export function Choix({
  titre,
  detail,
  prix,
  actif,
  onClick,
}: {
  titre: string;
  detail?: string;
  prix?: string;
  actif: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className={cn(
        "flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",
        actif
          ? "border-accent bg-accent/[0.07] shadow-[inset_0_0_0_1px_var(--color-accent)]"
          : "border-line bg-surface hover:border-accent/45",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full border transition-all",
          actif ? "border-accent bg-accent" : "border-line",
        )}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" className={actif ? "opacity-100" : "opacity-0"}>
          <path d="M2 6.2l2.6 2.6L10 3.4" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[0.9rem] font-semibold text-ink">{titre}</span>
        {detail && <span className="text-[0.74rem] leading-snug text-muted">{detail}</span>}
      </span>
      {prix && <span className="whitespace-nowrap font-mono text-[0.8rem] tabular-nums text-ink">{prix}</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Scène collante — l'objet configuré                                  */
/* ------------------------------------------------------------------ */

export function Scene({
  nom,
  sous,
  tag,
  pastilles,
  compact,
  ambiances,
  ambianceActive,
}: {
  nom: string;
  sous: string;
  tag: string;
  pastilles: string[];
  compact: boolean;
  /** Toutes les ambiances, pas seulement l'active — cf. empilement ci-dessous. */
  ambiances: Ambiance[];
  ambianceActive: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 flex flex-col justify-between overflow-hidden border-b border-line bg-ink p-4 transition-[height] duration-200 motion-reduce:transition-none",
        "lg:top-3 lg:h-[min(calc(100svh-1.5rem),640px)] lg:self-start lg:border-b-0 lg:border-r lg:p-5",
        compact ? "h-[132px]" : "h-[232px]",
        "lg:!h-[min(calc(100svh-1.5rem),640px)]",
      )}
    >
      {/* Les trois rendus sont empilés et permutés en opacité, pas montés à la
          demande : le §« mobile d'abord » d'ADR-030 demande le préchargement de
          l'ambiance suivante pour que le changement soit instantané. Un montage
          conditionnel ferait apparaître un carré vide le temps du téléchargement,
          c'est-à-dire exactement au moment où l'on compare deux teintes. */}
      {ambiances.map((a) => {
        const actif = a.id === ambianceActive;
        return (
          <Image
            key={a.id}
            src={a.visuel}
            alt={actif ? `${nom} — ambiance ${a.nom}` : ""}
            aria-hidden={!actif}
            fill
            priority={actif}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className={cn(
              "object-cover transition-opacity duration-500 motion-reduce:transition-none",
              actif ? "opacity-100" : "opacity-0",
            )}
          />
        );
      })}

      {/* Voile : le nom du module et les pastilles doivent rester lisibles
          quelle que soit la teinte du bardage derrière eux. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/10 to-ink/70"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[1.15rem] font-semibold tracking-tight text-white lg:text-[1.5rem]">
            {nom}
          </p>
          {!compact && <p className="truncate text-[0.8rem] text-white/75">{sous}</p>}
        </div>
        <span className="shrink-0 rounded border border-white/25 bg-ink/40 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-white/80 backdrop-blur">
          {tag}
        </span>
      </div>
      <div className={cn("relative flex flex-wrap gap-1.5 transition-opacity", compact && "pointer-events-none opacity-0 lg:pointer-events-auto lg:opacity-100")}>
        {pastilles.map((p) => (
          <span
            key={p}
            className="rounded-full border border-white/25 bg-ink/40 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.06em] text-white/85 backdrop-blur"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Barre de prix collante — delta transitoire                          */
/* ------------------------------------------------------------------ */

export function BarrePrix({
  total,
  mention,
  action,
  actionDesactivee,
  motif,
  onAction,
}: {
  total: number;
  mention: string;
  action: string;
  actionDesactivee?: boolean;
  motif: string;
  onAction: () => void;
}) {
  const [delta, setDelta] = useState<number | null>(null);
  const precedent = useRef<number | null>(null);

  useEffect(() => {
    if (precedent.current !== null && precedent.current !== total) {
      setDelta(total - precedent.current);
      const t = setTimeout(() => setDelta(null), 2000);
      precedent.current = total;
      return () => clearTimeout(t);
    }
    precedent.current = total;
  }, [total]);

  return (
    <div className="sticky bottom-0 z-20 flex flex-col gap-2 border-t border-line bg-paper/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted">
          {mention}
        </span>
        <span
          aria-live="polite"
          className={cn(
            "font-mono text-[0.66rem] text-accent transition-all",
            delta === null ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100",
          )}
        >
          {delta !== null && `${delta > 0 ? "+ " : "− "}${eur(Math.abs(delta))}`}
        </span>
      </div>
      <span className="text-[1.3rem] font-semibold tabular-nums tracking-tight text-ink">
        {eur(total)}
      </span>
      <button
        type="button"
        onClick={onAction}
        disabled={actionDesactivee}
        className={cn(
          "min-h-[46px] w-full rounded-xl bg-accent px-4 text-[0.9rem] font-semibold text-white transition-opacity",
          actionDesactivee ? "cursor-not-allowed opacity-45" : "hover:bg-accent-ink",
        )}
      >
        {action}
      </button>
      <p className="text-center font-mono text-[0.6rem] text-muted">{motif}</p>
    </div>
  );
}

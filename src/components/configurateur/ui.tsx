"use client";

/**
 * Composants partagés du configurateur v2 (ADR-030, `docs/design/configurateur-v2.md`).
 *
 * Trois règles gouvernent ce fichier :
 * — toute commande est un <button> porteur de son état ARIA, jamais un <div>
 *   cliquable ;
 * — une mention essentielle est visible sans interaction, le détail s'ouvre au
 *   clic ou au toucher, jamais au seul survol (§10) ;
 * — cibles tactiles ≥ 48 px, cible de conception 390 px (§14).
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { ETAPES, eur } from "./store";
import type { MentionTexte } from "@/lib/configurateur/mentions";

/* ------------------------------------------------------------------ */
/* Progression                                                         */
/* ------------------------------------------------------------------ */

export function Progression({ etape, onAller }: { etape: number; onAller: (n: number) => void }) {
  return (
    <nav aria-label="Progression" className="flex gap-1">
      {ETAPES.map((e) => {
        const atteinte = e.n <= etape;
        const cliquable = e.n < etape;
        return (
          <button
            key={e.n}
            type="button"
            disabled={!cliquable}
            onClick={() => cliquable && onAller(e.n)}
            aria-label={`Étape ${e.n + 1} sur ${ETAPES.length} — ${e.titre}`}
            aria-current={e.n === etape ? "step" : undefined}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              atteinte ? "bg-accent" : "bg-line",
              cliquable ? "cursor-pointer hover:opacity-80" : "cursor-default",
            )}
          />
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Coque d'écran                                                       */
/* ------------------------------------------------------------------ */

export function Ecran({
  titre,
  sous,
  children,
}: {
  titre: string;
  sous?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1">
      <h2 className="text-[1.35rem] font-semibold tracking-tight text-ink md:text-[1.6rem]">
        {titre}
      </h2>
      {sous && <p className="text-sm leading-relaxed text-muted">{sous}</p>}
      <div className="mt-4 flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted">{children}</p>
  );
}

/* ------------------------------------------------------------------ */
/* Mention — courte visible, détail dépliable                          */
/* ------------------------------------------------------------------ */

export function Mention({ texte }: { texte: MentionTexte }) {
  return (
    <div className="flex flex-col gap-1.5">
      {texte.courte && (
        <p className="font-mono text-[0.66rem] leading-relaxed text-muted">{texte.courte}</p>
      )}
      <details className="border-t border-dashed border-line pt-1.5">
        <summary className="flex min-h-[30px] cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-accent [&::-webkit-details-marker]:hidden">
          Détail
        </summary>
        <p className="pb-1 pt-1.5 text-[0.78rem] leading-relaxed text-muted">{texte.detail}</p>
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
        "flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",
        actif
          ? "border-accent bg-accent/[0.07] shadow-[inset_0_0_0_1px_var(--color-accent)]"
          : "border-line bg-surface hover:border-accent/45",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all",
          actif ? "border-accent bg-accent" : "border-line",
        )}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" className={actif ? "opacity-100" : "opacity-0"}>
          <path
            d="M2 6.2l2.6 2.6L10 3.4"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[0.95rem] font-semibold text-ink">{titre}</span>
        {detail && <span className="text-xs leading-snug text-muted">{detail}</span>}
      </span>
      {prix && (
        <span className="whitespace-nowrap font-mono text-[0.82rem] tabular-nums text-ink">{prix}</span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Barre de prix ancrée — delta transitoire                            */
/* ------------------------------------------------------------------ */

export function BarrePrix({
  total,
  mention,
  action,
  onAction,
  actionDesactivee,
  motifBlocage,
}: {
  total: number;
  mention: string;
  action: string;
  onAction: () => void;
  actionDesactivee?: boolean;
  motifBlocage?: string;
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
    <div className="sticky bottom-0 z-20 border-t border-line bg-paper/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      <div className="mx-auto flex max-w-2xl flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
            {mention}
          </span>
          <span
            aria-live="polite"
            className={cn(
              "font-mono text-[0.7rem] text-accent transition-all",
              delta === null ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100",
            )}
          >
            {delta !== null && `${delta > 0 ? "+ " : "− "}${eur(Math.abs(delta))}`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[1.3rem] font-semibold tabular-nums tracking-tight text-ink">
            {eur(total)}
          </span>
          <button
            type="button"
            onClick={onAction}
            disabled={actionDesactivee}
            className={cn(
              "min-h-[48px] whitespace-nowrap rounded-xl px-5 text-[0.92rem] font-semibold text-white transition-opacity",
              actionDesactivee ? "cursor-not-allowed bg-accent opacity-45" : "bg-accent hover:bg-accent-ink",
            )}
          >
            {action}
          </button>
        </div>
        {actionDesactivee && motifBlocage && (
          <p className="text-center font-mono text-[0.62rem] text-muted">{motifBlocage}</p>
        )}
      </div>
    </div>
  );
}

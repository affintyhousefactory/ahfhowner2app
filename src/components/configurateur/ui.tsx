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
import type { VueInterieure } from "@/lib/configurateur/config";

/* ------------------------------------------------------------------ */
/* Section dépliante — le résumé remplace le compteur d'étapes         */
/* ------------------------------------------------------------------ */

export function Section({
  n,
  titre,
  resume,
  ouvertParDefaut,
  saillant,
  badge,
  children,
}: {
  n: number;
  titre: string;
  /** Choix courant, lisible sans déplier. C'est ce qui remplace « étape 3/7 ». */
  resume: string;
  ouvertParDefaut?: boolean;
  /**
   * Section mise en avant — fond teinté, filet d'accent et titre appuyé.
   *
   * À réserver aux sections qui **offrent** quelque chose plutôt que d'exiger
   * : la pré-analyse de terrain répond gratuitement à la question qui bloque
   * le plus les projets. Si toutes les sections ressortaient, plus aucune ne
   * ressortirait.
   */
  saillant?: boolean;
  /** Court libellé posé à droite du titre — ex. « Gratuit · immédiat ». */
  badge?: string;
  children: ReactNode;
}) {
  return (
    <details
      open={ouvertParDefaut}
      className={cn(
        "border-b border-line",
        saillant && "border-l-2 border-l-accent bg-accent/[0.035]",
      )}
    >
      <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-4 py-3.5 transition-colors hover:bg-paper [&::-webkit-details-marker]:hidden">
        <span className="w-[18px] shrink-0 font-mono text-[0.66rem] tracking-[0.08em] text-accent">
          {String(n).padStart(2, "0")}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "text-[0.94rem] font-semibold",
                saillant ? "text-accent" : "text-ink",
              )}
            >
              {titre}
            </span>
            {badge && (
              <span className="rounded-full border border-accent/35 bg-surface px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-accent">
                {badge}
              </span>
            )}
          </span>
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
  cale,
  bardages,
  ambianceActive,
  vuesInterieures,
  interieurs,
  ambianceInterieureActive,
}: {
  nom: string;
  sous: string;
  tag: string;
  pastilles: string[];
  /**
   * Scène calée en haut de l'écran. Ne change **pas** sa taille : elle réserve
   * seulement la place de l'en-tête qui vient se poser dessus.
   */
  cale: boolean;
  /**
   * Tous les bardages, rendu **déjà résolu pour le modèle courant** — pas
   * seulement l'actif, cf. empilement ci-dessous. Comme pour les ambiances
   * intérieures, c'est le store qui choisit le rendu du modèle : la scène ne
   * sait pas quel studio est sélectionné, et n'a pas à le savoir.
   */
  bardages: { id: string; nom: string; teinte: string; visuel: string }[];
  ambianceActive: string;
  /** Vues du modèle courant, pour l'ambiance intérieure sélectionnée. */
  vuesInterieures: VueInterieure[];
  /**
   * Les ambiances intérieures **déjà résolues pour le modèle courant** : la
   * scène n'a pas à savoir quel studio est sélectionné pour savoir quoi
   * afficher. C'est le store qui tranche, une fois.
   */
  interieurs: { id: string; nom: string; vues: VueInterieure[] }[];
  ambianceInterieureActive: string;
}) {
  /**
   * Face montrée — extérieur ou intérieur.
   *
   * La scène bascule **d'elle-même** vers la face qu'on est en train de
   * choisir : toucher au bardage ramène l'extérieur, choisir une ambiance
   * intérieure montre l'intérieur. Sans cela, le visiteur changerait
   * d'ambiance intérieure sans rien voir changer — le pire retour possible
   * pour un configurateur. Les deux onglets restent là pour reprendre la main.
   */
  const [face, setFace] = useState<"exterieur" | "interieur">("exterieur");
  const premierRendu = useRef(true);
  useEffect(() => {
    if (premierRendu.current) return;
    setFace("exterieur");
  }, [ambianceActive]);
  useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    setFace("interieur");
  }, [ambianceInterieureActive]);

  /* Vue courante du défilement intérieur. Bornée à la longueur réelle : passer
     de l'Arko Max (4 vues) à l'Arko One (3) ne doit pas laisser un index mort. */
  const [vue, setVue] = useState(0);
  const iVue = vuesInterieures.length ? vue % vuesInterieures.length : 0;

  const interieur = face === "interieur" && vuesInterieures.length > 0;

  /* Défilement automatique des vues intérieures — seulement quand l'intérieur
     est effectivement montré, et jamais sous `prefers-reduced-motion` : un
     carrousel qui tourne tout seul est précisément ce que ce réglage demande
     d'éviter. Les points restent alors le seul moyen de naviguer, ce qui suffit. */
  useEffect(() => {
    if (!interieur || vuesInterieures.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setVue((v) => v + 1), 4200);
    return () => clearInterval(id);
  }, [interieur, vuesInterieures.length]);
  return (
    /* Hauteur constante (arbitrage Richard, 2026-08-02). Une scène qui rétrécit
       au défilement recadre le rendu : à 132 px sur un visuel 4:3, `object-cover`
       coupait le pied du studio — terrasse et sol disparaissaient, et le studio
       semblait remonter dans le cadre. Mieux vaut un tiers d'écran constant
       qu'un rendu qui s'ampute. */
    <div
      className={cn(
        "sticky top-0 z-10 flex h-[232px] flex-col justify-between overflow-hidden border-b border-line bg-ink p-4",
        "lg:top-3 lg:h-[min(calc(100svh-1.5rem),640px)] lg:self-start lg:border-b-0 lg:border-r lg:p-5",
      )}
    >
      {/* Les trois rendus sont empilés et permutés en opacité, pas montés à la
          demande : le §« mobile d'abord » d'ADR-030 demande le préchargement de
          l'ambiance suivante pour que le changement soit instantané. Un montage
          conditionnel ferait apparaître un carré vide le temps du téléchargement,
          c'est-à-dire exactement au moment où l'on compare deux teintes. */}
      {/* Calque `absolute` explicite : `fill` exige un parent en position
          absolute/fixed/relative, et la scène est en `sticky`. */}
      <div className="absolute inset-0">
        {bardages.map((a) => {
          const actif = a.id === ambianceActive && !interieur;
          return (
            <Image
              key={a.id}
              src={a.visuel}
              alt={actif ? `${nom} — bardage ${a.nom}` : ""}
              aria-hidden={!actif}
              fill
              priority={a.id === ambianceActive}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className={cn(
                "object-cover transition-opacity duration-500 motion-reduce:transition-none",
                actif ? "opacity-100" : "opacity-0",
              )}
            />
          );
        })}

        {/* Calque intérieur — seule la **vue courante** de chaque ambiance est
            montée, pas les quatre : empiler huit rendus pour n'en montrer un
            que ferait payer huit téléchargements au visiteur. Les deux
            ambiances de cette vue restent superposées, elles, parce que c'est
            exactement le geste attendu ici — comparer bois et blanc sur le
            même cadrage, sans attendre. */}
        {interieurs.map((amb) => {
          const v = amb.vues[Math.min(iVue, Math.max(amb.vues.length - 1, 0))];
          if (!v) return null;
          const actif = interieur && amb.id === ambianceInterieureActive;
          return (
            <Image
              key={`${amb.id}-${v.id}`}
              src={v.src}
              alt={actif ? `${nom} — ${amb.nom}, ${v.nom}` : ""}
              aria-hidden={!actif}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className={cn(
                "object-cover transition-opacity duration-500 motion-reduce:transition-none",
                actif ? "opacity-100" : "opacity-0",
              )}
            />
          );
        })}
      </div>

      {/* Voile : le nom du studio et les pastilles doivent rester lisibles
          quelle que soit la teinte du bardage derrière eux. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/10 to-ink/70"
      />

      {/* Une fois la scène calée en haut, elle passe sous l'en-tête du tunnel :
          on lui réserve la hauteur que celui-ci occupe réellement (`--cfg-nav`,
          nulle dès qu'il s'est effacé) pour que le nom du studio ne finisse
          jamais derrière le logo. Hors calage, aucune réserve — la scène est
          déjà sous l'en-tête dans le flux. */}
      <div
        style={cale ? { paddingTop: "var(--cfg-nav, 0px)" } : undefined}
        className="relative flex items-start justify-between gap-3 transition-[padding] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none"
      >
        <div className="min-w-0">
          <p className="truncate text-[1.15rem] font-semibold tracking-tight text-white lg:text-[1.5rem]">
            {nom}
          </p>
          <p className="truncate text-[0.8rem] text-white/75">{sous}</p>
        </div>
        <span className="shrink-0 rounded border border-white/25 bg-ink/40 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-white/80 backdrop-blur">
          {tag}
        </span>
      </div>
      {/* Bas de scène — un seul enfant en flux, sinon `justify-between` du
          parent répartit les blocs et pousse les pastilles au milieu de
          l'image. C'est ce qui s'est produit en ajoutant les points de vue :
          trois enfants au lieu de deux, et le bloc du milieu se centre. */}
      <div className="relative flex flex-col gap-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {pastilles.map((p) => (
            <span
              key={p}
              className="rounded-full border border-white/25 bg-ink/40 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.06em] text-white/85 backdrop-blur"
            >
              {p}
            </span>
          ))}
        </div>

        {/* Bascule extérieur / intérieur. Présente même quand la scène montre
            l'extérieur : c'est ce qui rend le comportement automatique
            réversible, et ce qui signale au visiteur qu'un intérieur existe. */}
        {vuesInterieures.length > 0 && (
          <div
            role="tablist"
            aria-label="Face montrée"
            className="flex shrink-0 gap-1 rounded-full border border-white/25 bg-ink/40 p-0.5 backdrop-blur"
          >
            {(
              [
                ["exterieur", "Extérieur"],
                ["interieur", "Intérieur"],
              ] as const
            ).map(([id, libelle]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={face === id}
                onClick={() => setFace(id)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] transition-colors",
                  face === id ? "bg-white text-ink" : "text-white/75 hover:text-white",
                )}
              >
                {libelle}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Points de vue — n'apparaissent qu'en intérieur, et portent le nom de
          la vue plutôt qu'un numéro : « La salle de bain » situe mieux qu'un
          rang dans une liste, pour l'œil comme pour un lecteur d'écran. */}
      {interieur && vuesInterieures.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.08em] text-white/75">
            {vuesInterieures[iVue]?.nom}
          </span>
          <div className="flex gap-1.5">
            {vuesInterieures.map((v, i) => (
              <button
                key={v.id}
                type="button"
                aria-label={`Voir ${v.nom}`}
                aria-current={i === iVue}
                onClick={() => setVue(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === iVue ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70",
                )}
              />
            ))}
          </div>
        </div>
      )}
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
  manques,
  note,
  detail,
  enCours,
  retour,
}: {
  total: number;
  mention: string;
  action: string;
  actionDesactivee?: boolean;
  motif: string;
  onAction: () => void;
  /**
   * Ce qui manque encore pour réserver. Chaque entrée porte le libellé montré
   * au visiteur et l'identifiant du champ à atteindre.
   */
  manques?: readonly { cle: string; libelle: string; ancre: string }[];
  /** Précision affichée sous le bouton — ex. réservation sous condition. */
  note?: string;
  /**
   * Récapitulatif complet de la configuration, ouvert depuis la barre.
   *
   * Il vit ici plutôt que dans un accordéon parce qu'il répond à la question
   * que pose le total affiché juste au-dessus — « d'où vient ce prix ? ».
   * Ailleurs, il aurait fallu quitter des yeux le chiffre qu'il explique.
   */
  detail?: ReactNode;
  /** Demande en cours d'envoi — le bouton se verrouille et le dit. */
  enCours?: boolean;
  /**
   * Retour de la soumission, affiché **contre le bouton** qui vient d'être
   * cliqué : c'est là que le regard se trouve. Une erreur montrée à sept
   * sections de distance oblige à la chercher, quand elle devrait sauter aux
   * yeux.
   */
  retour?: { ton: "ok" | "alerte"; texte: string };
}) {
  const [delta, setDelta] = useState<number | null>(null);
  const precedent = useRef<number | null>(null);

  /* Ce qui manque ne s'affiche **qu'au clic** sur le bouton (demande de
     Richard, 2026-08-20). Affichée en permanence, la liste occupait le bas de
     l'écran pendant tout le parcours et devenait un décor qu'on ne lit plus —
     alors qu'elle n'a de sens qu'au moment où l'on essaie de valider. */
  /* Un seul panneau à la fois : deux volets ouverts au-dessus d'une barre
     collante se recouvriraient, et le second n'aurait nulle part où aller. */
  const [panneau, setPanneau] = useState<"manques" | "detail" | null>(null);
  const bloc = useRef<HTMLDivElement>(null);
  const incomplet = (manques?.length ?? 0) > 0;
  const ouvert = panneau === "manques";
  const setOuvert = (v: boolean | ((p: boolean) => boolean)) =>
    setPanneau((p) => ((typeof v === "function" ? v(p === "manques") : v) ? "manques" : null));

  /* Pas d'effet pour refermer quand le formulaire se complète : la liste ne se
     rend déjà que si `ouvert && incomplet`. Synchroniser un état sur un autre
     par un effet créerait un rendu en cascade pour un résultat identique. */

  useEffect(() => {
    if (!panneau) return;
    const surEchap = (e: KeyboardEvent) => e.key === "Escape" && setPanneau(null);
    const surClic = (e: MouseEvent) => {
      if (!bloc.current?.contains(e.target as Node)) setPanneau(null);
    };
    window.addEventListener("keydown", surEchap);
    /* `capture` : la fermeture doit précéder les gestionnaires du contenu,
       sinon un clic sur un bouton de la liste la referme avant de l'exécuter. */
    window.addEventListener("mousedown", surClic, true);
    return () => {
      window.removeEventListener("keydown", surEchap);
      window.removeEventListener("mousedown", surClic, true);
    };
  }, [panneau]);

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
      <div ref={bloc} className="relative">
        {/* Détail de la configuration — même mécanique que la liste des
            manques, même endroit : ce qui explique le prix s'ouvre à côté du
            prix. Le panneau défile s'il dépasse, la barre restant collée en
            bas d'un écran qui peut être court. */}
        {panneau === "detail" && detail && (
          <div
            role="dialog"
            aria-label="Votre configuration en détail"
            className="absolute bottom-full left-0 right-0 z-30 mb-2 max-h-[62svh] overflow-y-auto rounded-xl border border-line bg-surface px-3 py-3 shadow-[0_12px_32px_rgba(10,9,7,0.16)]"
          >
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                Votre configuration en détail
              </p>
              <button
                type="button"
                onClick={() => setPanneau(null)}
                aria-label="Fermer le détail"
                className="-mr-1 shrink-0 px-1 font-mono text-[0.8rem] leading-none text-muted transition-colors hover:text-ink"
              >
                ×
              </button>
            </div>
            {detail}
          </div>
        )}

        {/* Ce qui manque, nommé et **atteignable**, au-dessus du bouton qui
            vient d'être refusé. Un bouton qui ne dit pas pourquoi il ne part
            pas laisse chercher ; une liste qui le dit sans y emmener laisse
            deviner où. Chaque entrée conduit donc au champ et lui donne le
            focus. */}
        {ouvert && manques && manques.length > 0 && (
          <div
            role="dialog"
            aria-label="Éléments à compléter"
            className="absolute bottom-full left-0 right-0 z-30 mb-2 flex flex-col gap-1.5 rounded-xl border border-accent/30 bg-surface px-3 py-2.5 shadow-[0_12px_32px_rgba(10,9,7,0.16)]"
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-[0.72rem] font-medium text-ink">
                Il reste {manques.length === 1 ? "une chose" : `${manques.length} choses`} à
                compléter :
              </p>
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer"
                className="-mr-1 shrink-0 px-1 font-mono text-[0.8rem] leading-none text-muted transition-colors hover:text-ink"
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {manques.map((m) => (
                <button
                  key={m.cle}
                  type="button"
                  onClick={() => {
                    setOuvert(false);
                    allerAu(m.ancre);
                  }}
                  className="rounded-full border border-accent/40 bg-surface px-2.5 py-1 text-[0.7rem] text-accent transition-colors hover:bg-accent hover:text-white"
                >
                  {m.libelle}
                </button>
              ))}
            </div>
          </div>
        )}

        {detail && (
          <button
            type="button"
            aria-expanded={panneau === "detail"}
            onClick={() => setPanneau((p) => (p === "detail" ? null : "detail"))}
            className="mb-2 flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-[0.76rem] text-ink transition-colors hover:border-ink/30"
          >
            <span>Votre configuration en détail</span>
            <span
              aria-hidden
              className={cn(
                "font-mono text-[0.7rem] text-muted transition-transform duration-300",
                panneau === "detail" && "rotate-180",
              )}
            >
              ▲
            </span>
          </button>
        )}

        {/* `aria-disabled` plutôt que `disabled` : le bouton doit rester
            focusable et activable pour pouvoir **expliquer** son refus. Un
            bouton `disabled` est un cul-de-sac — il ne reçoit ni clic ni
            focus, et ne dit donc jamais ce qu'il attend. L'atténuation visuelle
            reste, elle : le parcours doit se lire d'un coup d'œil. */}
        <button
          type="button"
          aria-disabled={actionDesactivee || undefined}
          aria-busy={enCours || undefined}
          /* `disabled` **ici** et pas ailleurs : pendant l'envoi, le bouton n'a
             rien à expliquer — il a besoin qu'on ne le clique pas deux fois. */
          disabled={enCours}
          onClick={() => {
            if (incomplet) {
              setOuvert((v) => !v);
              return;
            }
            onAction();
          }}
          className={cn(
            /* Teinte du bouton du site (ADR-041 § Amendement) : fond clair + liseré.
               Le liseré n'est pas décoratif — sans lui, la teinte claire ne se
               détacherait pas du fond du tunnel. */
            "min-h-12 w-full rounded-lg border border-accent bg-lumiere px-4 text-[0.9rem] font-semibold text-ink transition-opacity",
            actionDesactivee || enCours ? "opacity-45" : "hover:bg-lumiere-ink",
          )}
        >
          {enCours ? "Envoi en cours…" : action}
        </button>
      </div>
      {retour && (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "rounded-xl border px-3 py-2 text-[0.78rem] leading-relaxed",
            retour.ton === "ok"
              ? "border-accent/30 bg-accent/[0.06] text-ink"
              : "border-[#8a6a2f]/35 bg-[#8a6a2f]/[0.09] text-[#8a6a2f]",
          )}
        >
          {retour.texte}
        </p>
      )}

      {note && (
        <p className="text-center text-[0.68rem] leading-snug text-[#8a6a2f]">{note}</p>
      )}
      <p className="text-center font-mono text-[0.6rem] text-muted">{motif}</p>
    </div>
  );
}

/**
 * Amène au champ manquant et lui donne le focus.
 *
 * `scrollIntoView` seul déplace la page sans dire où regarder ; `focus()` seul
 * saute sans transition et perd le visiteur sur mobile. Les deux ensemble
 * donnent le seul comportement lisible — d'où aussi les `scroll-mt-32` posés
 * sur les cibles, la barre d'en-tête étant fixe.
 *
 * Le focus est différé d'une frame : sur mobile, le donner pendant le
 * défilement l'interrompt et le clavier s'ouvre au mauvais endroit.
 */
function allerAu(ancre: string) {
  const el = document.getElementById(ancre);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => el.focus({ preventScroll: true }), 300);
}

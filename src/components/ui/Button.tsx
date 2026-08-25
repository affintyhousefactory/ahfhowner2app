"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { Magnetic } from "./Magnetic";

/**
 * Bouton unique du site — homogénéisé le 2026-08-25 (ADR-040 § Amendement).
 *
 * Il coexistait trois façons de dessiner un bouton : ce composant (16 fichiers),
 * la classe `.btn-rl` de `globals.css` (un seul fichier), et des boutons écrits
 * en ligne dans les pages produit. Trois façons, c'est trois dérives possibles :
 * tout passe désormais par ici.
 *
 * **Deux changements visibles sur tout le site**, décidés par Richard :
 *
 * - **Angles nets** au lieu de la pilule. C'est le dessin proposé avec la
 *   direction « Heure bleue » et retenu pour l'ensemble ; il s'accorde aux
 *   filets et aux cadres de la charte, là où le `rounded-full` tirait vers le
 *   bouton d'application.
 * - **48 px de hauteur minimale**, partout. La cible tactile descendait
 *   au-dessous sur certains écrans ; en dessous de 44 px un bouton se rate au
 *   doigt.
 *
 * Les variantes `lumiere` et `contour-clair` servent les fonds sombres (pages
 * produit) ; `accent`, `outline` et `ghost` les fonds clairs. Un bouton qui
 * doit choisir sa teinte selon le fond de la page est un bouton qu'on oublie
 * d'accorder — d'où des variantes nommées par le fond qu'elles habitent.
 */

type Variant = "accent" | "outline" | "ghost" | "lumiere" | "contour-clair";

/* Le socle porte tout ce qui ne doit JAMAIS varier d'un bouton à l'autre : la
   police, la graisse, l'interlettrage, le rayon. Les tailles passent par `size`
   et non par une surcharge de `className` — c'est ainsi que le bouton du menu
   s'était retrouvé à 0,875 rem et celui des cookies à 0,78 rem, ce qui se lit
   comme une police différente alors que c'est la même. */
const base =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-lg font-sans font-medium tracking-tight transition-colors duration-300 will-change-transform whitespace-nowrap";

/* Deux tailles, pas davantage. `sm` reste au-dessus de 40 px : c'est un bouton
   de barre, entouré d'espace ; `md` tient les 48 px des cibles principales. */
const sizes = {
  sm: "min-h-10 px-5 text-[0.85rem]",
  md: "min-h-12 px-7 text-[0.95rem]",
} as const;

const styles: Record<Variant, string> = {
  /* ── Fonds clairs ── */
  /* ⚠ Fond `lumiere` ET liseré `accent`, les deux ensemble.
     La teinte claire des pages produit ne donne que 1,47:1 sur le fond de la
     barre de menu : sans liseré, le bouton ne se détacherait pas de son fond
     (WCAG 1.4.11 exige 3:1 pour un composant). Le liseré bronze est à 5,8:1.
     Le texte, lui, est confortable — encre sur lumière, 11,7:1. */
  accent: "border border-accent bg-lumiere text-ink hover:bg-lumiere-ink",
  outline: "border border-ink/15 text-ink hover:border-ink/40 bg-transparent",
  ghost: "text-ink hover:text-accent",

  /* ── Fonds sombres (ADR-040) ── */
  lumiere: "bg-lumiere text-nuit hover:bg-lumiere-ink",
  "contour-clair":
    "border border-lumiere/40 text-lumiere hover:border-lumiere/75 hover:bg-lumiere/10",
};

export function Button({
  children,
  href,
  variant = "accent",
  size = "md",
  className,
  magnetic = true,
  onClick,
  ariaLabel,
  disabled,
  tabIndex,
  type = "button",
}: {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
  magnetic?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  tabIndex?: number;
  /** `submit` pour les boutons de formulaire — ils rejoignent le composant. */
  type?: "button" | "submit";
}) {
  const inner = (
    <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
  );

  const cls = cn(
    base,
    sizes[size],
    styles[variant],
    disabled && "pointer-events-none border-white/10 bg-transparent text-white/20",
    className,
  );

  const el = href ? (
    <Link href={href} className={cls} onClick={onClick} aria-label={ariaLabel} tabIndex={tabIndex}>
      {inner}
    </Link>
  ) : (
    <button
      type={type}
      className={cls}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      tabIndex={tabIndex}
    >
      {inner}
    </button>
  );

  /* Un bouton désactivé ne suit pas le curseur : l'effet promettrait une action
     qui n'aura pas lieu. */
  return magnetic && !disabled ? <Magnetic strength={0.25}>{el}</Magnetic> : el;
}

/**
 * Bouton carré d'icône — commandes de défilement, fermeture, navigation.
 *
 * Même grammaire que `Button` (angles nets, 48 px), sans la gouttière ni le
 * remplissage horizontal d'un bouton porteur de texte.
 */
export function IconButton({
  children,
  onClick,
  ariaLabel,
  variant = "contour-clair",
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  variant?: Extract<Variant, "contour-clair" | "outline">;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "group inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300",
        styles[variant],
        disabled && "pointer-events-none border-white/10 bg-transparent text-white/20",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * La flèche du site. Une seule — elle était dessinée deux fois, ici et dans les
 * pages produit sous le nom `Fleche`, avec exactement le même tracé.
 */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cn("transition-transform duration-300 group-hover:translate-x-0.5", className)}
      aria-hidden
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

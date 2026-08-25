import { Reveal } from "@/components/ui/Reveal";

/* ============================================================
   Blocs éditoriaux — ADR-038 §8.

   Extraits de la première page du lot 2 plutôt que devinés avant elle : ce
   sont les formes que les cinq specs d'Albert emploient réellement. Tous sont
   des composants **serveur** — `Reveal` est le seul îlot client, et son état
   masqué vit sous `.js-motion` dans globals.css, donc le HTML servi reste
   visible sans JS (leçon du 2026-07-20, où framer-motion sérialisait
   `opacity:0` au rendu serveur et servait une page blanche aux crawlers).

   Aucun de ces blocs ne porte de `<main>` : le layout `(public)` en fournit
   déjà un.
   ============================================================ */

/** En-tête de section : filet, numéro d'ordre et mention de droite. */
export function EnteteSection({
  numero,
  titre,
  mention,
}: {
  numero: string;
  titre: string;
  mention?: string;
}) {
  return (
    <>
      <Reveal>
        <div className="rule flex items-baseline justify-between pt-5">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
            {numero}
          </span>
          {mention ? (
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              {mention}
            </span>
          ) : null}
        </div>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="titre-l mt-12 max-w-4xl text-balance text-ink md:mt-16">
          {titre}
        </h2>
      </Reveal>
    </>
  );
}

/** Section de page : fond, rythme vertical et largeur de page communs. */
export function Section({
  id,
  fond = "canvas",
  children,
}: {
  id?: string;
  fond?: "canvas" | "surface" | "ink";
  children: React.ReactNode;
}) {
  const fonds = {
    canvas: "bg-canvas",
    surface: "bg-surface",
    ink: "bg-ink text-canvas",
  } as const;
  return (
    <section id={id} className={`${fonds[fond]} py-20 md:py-32`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

/** Paragraphes d'introduction — largeur de lecture confortable. */
export function Chapo({
  paragraphes,
  clair = false,
}: {
  paragraphes: readonly string[];
  clair?: boolean;
}) {
  return (
    <div className="mt-8 max-w-2xl space-y-4">
      {paragraphes.map((p, i) => (
        <Reveal key={i} delay={0.05 + i * 0.05}>
          <p
            className={`text-[1.05rem] leading-relaxed ${clair ? "text-canvas/80" : "text-muted"}`}
          >
            {p}
          </p>
        </Reveal>
      ))}
    </div>
  );
}

/**
 * Réserve — la nuance qui empêche une promesse d'être lue comme un engagement.
 *
 * Les specs en imposent plusieurs (délais qui dépendent du projet, performances
 * qui ne tiennent pas à la seule ossature). Elle est **visuellement discrète
 * mais jamais escamotée** : la masquer reviendrait à publier la promesse sans
 * sa condition, ce qui est précisément le risque que la nuance écarte.
 */
export function Reserve({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 border-l border-line pl-4 text-sm leading-relaxed text-muted">
      {children}
    </p>
  );
}

/** Liste à puces sobre — usages, points d'approche. */
export function ListePuces({
  items,
  clair = false,
}: {
  items: readonly string[];
  clair?: boolean;
}) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-baseline gap-3">
          <span
            className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${clair ? "bg-canvas/50" : "bg-muted/60"}`}
          />
          <span
            className={`text-[1rem] leading-relaxed ${clair ? "text-canvas/85" : "text-ink/85"}`}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

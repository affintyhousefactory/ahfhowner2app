import type { Metadata } from "next";
import Image from "next/image";
import { ABOUT, BRAND, SERIE_COUNT, SERIE_TOTAL, reserverHref } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { aboutPageSchema } from "@/lib/jsonld";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

export const metadata: Metadata = {
  // Titre court : le `kicker` complet portait la balise à 76 caractères, au-delà
  // de ce qu'un SERP affiche. Il reste dans le <h1> et dans le JSON-LD.
  title: "L'ADN Howner — technologie & art de vivre | HOWNER",
  description:
    "L'architecture d'avant-garde au service de votre liberté : ossature acier léger, ingénierie de pointe et fabrication Hors-Site au Pays-Basque. La philosophie derrière Arko One et Arko Max.",
  alternates: { canonical: "/a-propos" },
};

/* Page éditoriale — aucun prix, aucune grille : rien ici ne dépend de
   `config.ts`, la page ne peut donc pas se périmer avec les tarifs.
   Contenu dans `site.ts` (`ABOUT`), comme PROCESS / FAQ / LAND_PREP.

   Composant serveur : `Reveal` est le seul îlot client, et son état masqué vit
   sous `.js-motion` dans globals.css — le HTML servi reste visible sans JS,
   donc indexable (leçon du 2026-07-20, `opacity:0` sérialisé au SSR).

   Pas de <main> ici : le layout `(public)` en fournit déjà un
   (`<main id="main-content">`). En rouvrir un l'imbriquerait. */

/** Visuels d'appui — un par section, choisis dans les assets existants pour ne
 *  pas alourdir le poids de page (ADR-006 : Lighthouse 100, LCP < 0.8 s). */
const VISUELS = {
  philosophie: {
    src: "/assets/arko/interior/kitchen.jpg",
    alt: "Intérieur Arko — la lumière traverse le séjour-cuisine, volumes épurés",
    legende: "L'essentiel, savouré — séjour-cuisine",
  },
  ingenierie: {
    src: "/assets/arko/sketch/arko-sketch-ink.jpg",
    alt: "Esquisse d'architecte de l'Arko, tracé à l'encre",
    legende: "Du trait d'architecte à la modélisation 3D",
  },
  eco: {
    src: "/assets/arko/exterior/arko-forest.jpg",
    alt: "Un studio de jardin Arko posé dans une clairière boisée, empreinte au sol minimale",
    legende: "Pays Basque — posé sans lourdes fondations",
  },
} as const;

export default function AProposPage() {
  const [philosophie, acier, ingenierie, eco] = ABOUT.sections;

  return (
    <>
      <JsonLd data={aboutPageSchema()} />

      {/* ── Ouverture ─────────────────────────────────────────────── */}
      <section className="bg-canvas pt-16 md:pt-[4.5rem]">
        <div className="container-page py-20 md:py-28">
          <Reveal>
            <div className="rule flex items-baseline justify-between pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                {ABOUT.eyebrow}
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                {BRAND.madeIn}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="editorial mt-12 max-w-4xl text-balance text-[2.4rem] leading-[1.02] text-ink md:mt-16 md:text-[4.8rem]">
              {ABOUT.title}{" "}
              {/* Le `{" "}` n'est pas décoratif : le <span> est en `block`, donc
                  sans lui le nom accessible du <h1> concatène les deux membres
                  sans séparateur (« Howner.Quand la … »). */}
              <span className="block text-ink/35">{ABOUT.kicker}</span>
            </h1>
          </Reveal>

          {/* Le manifeste, cité — c'est la promesse de marque, pas une phrase
              de corps de texte. */}
          <Reveal delay={0.1}>
            <blockquote className="mt-12 max-w-3xl border-l border-accent pl-6 md:mt-16 md:pl-8">
              <p className="editorial text-balance text-xl leading-snug text-ink md:text-3xl">
                {ABOUT.quote}
              </p>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ── 01 · Philosophie ──────────────────────────────────────── */}
      <section id={philosophie.id} className="bg-canvas pb-24 md:pb-32">
        <div className="container-page">
          <Reveal>
            <div className="rule flex items-baseline justify-between pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                {philosophie.step} — {philosophie.eyebrow}
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="editorial mt-10 max-w-3xl text-balance text-[2rem] leading-[1.04] text-ink md:mt-14 md:text-[3.6rem]">
              {philosophie.title}
            </h2>
          </Reveal>

          <div className="mt-14 grid items-start gap-12 md:mt-20 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
            <Stagger className="grid gap-y-8">
              {philosophie.points.map((p) => (
                <StaggerItem key={p.k}>
                  <div className="border-t border-line pt-4">
                    <p className="font-medium text-ink">{p.k}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {p.d}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.1}>
              <figure className="group">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-surface">
                  <Image
                    src={VISUELS.philosophie.src}
                    alt={VISUELS.philosophie.alt}
                    fill
                    sizes="(max-width: 768px) 92vw, 44vw"
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                  {VISUELS.philosophie.legende}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 02 · L'acier léger — bloc sombre, la structure se révèle ── */}
      <section id={acier.id} className="bg-ink py-24 text-canvas md:py-32">
        <div className="container-page">
          <Reveal>
            <div className="flex items-baseline justify-between border-t border-canvas/15 pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
                {acier.step} — {acier.eyebrow}
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/55">
                Light Steel Frame
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="editorial mt-10 max-w-3xl text-balance text-[2rem] leading-[1.04] text-canvas md:mt-14 md:text-[3.6rem]">
              {acier.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-canvas/70 md:text-lg">
              {acier.intro}
            </p>
          </Reveal>

          <Stagger className="mt-14 grid gap-x-12 gap-y-10 md:mt-20 md:grid-cols-2">
            {acier.points.map((p) => (
              <StaggerItem key={p.k}>
                <div className="border-t border-canvas/15 pt-4">
                  <p className="font-medium text-canvas">{p.k}</p>
                  <p className="mt-2 text-sm leading-relaxed text-canvas/60">
                    {p.d}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── 03 · L'ingénierie invisible ───────────────────────────── */}
      <section id={ingenierie.id} className="bg-canvas py-24 md:py-32">
        <div className="container-page">
          <Reveal>
            <div className="rule flex items-baseline justify-between pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                {ingenierie.step} — {ingenierie.eyebrow}
              </span>
            </div>
          </Reveal>

          <div className="mt-10 grid items-start gap-12 md:mt-14 md:grid-cols-[0.95fr_1.05fr] md:gap-16">
            <Reveal delay={0.05}>
              <figure className="group">
                <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-surface">
                  <Image
                    src={VISUELS.ingenierie.src}
                    alt={VISUELS.ingenierie.alt}
                    fill
                    sizes="(max-width: 768px) 92vw, 44vw"
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                  {VISUELS.ingenierie.legende}
                </figcaption>
              </figure>
            </Reveal>

            <div>
              <Reveal delay={0.1}>
                <h2 className="editorial max-w-2xl text-balance text-[2rem] leading-[1.04] text-ink md:text-[3.4rem]">
                  {ingenierie.title}
                </h2>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-8 max-w-xl text-base leading-relaxed text-muted md:text-lg">
                  {ingenierie.intro}
                </p>
              </Reveal>
              <Stagger className="mt-12 grid gap-y-8">
                {ingenierie.points.map((p) => (
                  <StaggerItem key={p.k}>
                    <div className="border-t border-line pt-4">
                      <p className="font-medium text-ink">{p.k}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {p.d}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · Éco-responsabilité ───────────────────────────────── */}
      {/* `bg-surface` (blanc) et non `bg-paper` : paper (#fbfcfd) et canvas
          (#f6f7f9) ne diffèrent que de trois valeurs, l'alternance ne se
          voyait pas. */}
      <section id={eco.id} className="bg-surface py-24 md:py-32">
        <div className="container-page">
          <Reveal>
            <div className="rule flex items-baseline justify-between pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                {eco.step} — {eco.eyebrow}
              </span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
                Objectif zéro déchet
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="editorial mt-10 max-w-3xl text-balance text-[2rem] leading-[1.04] text-ink md:mt-14 md:text-[3.6rem]">
              {eco.title}
            </h2>
          </Reveal>

          <div className="mt-14 grid items-start gap-12 md:mt-20 md:grid-cols-[1.05fr_0.95fr] md:gap-16">
            <Stagger className="grid gap-y-8">
              {eco.points.map((p) => (
                <StaggerItem key={p.k}>
                  <div className="border-t border-line pt-4">
                    <p className="font-medium text-ink">{p.k}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {p.d}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal delay={0.1}>
              <figure className="group">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-surface">
                  <Image
                    src={VISUELS.eco.src}
                    alt={VISUELS.eco.alt}
                    fill
                    sizes="(max-width: 768px) 92vw, 44vw"
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
                  {VISUELS.eco.legende}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Sortie ────────────────────────────────────────────────────
          Le compteur dérive de SERIE_COUNT / SERIE_TOTAL : aucun volume
          recopié en littéral (règle du 2026-08-04). */}
      <section className="bg-canvas pb-24 md:pb-32">
        <div className="container-page">
          <div className="rule flex flex-col gap-8 pt-10 md:flex-row md:items-end md:justify-between md:pt-14">
            <Reveal>
              <p className="editorial max-w-2xl text-balance text-[1.8rem] leading-[1.06] text-ink md:text-[3rem]">
                {BRAND.baseline}.
              </p>
              <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                {BRAND.series} · {SERIE_COUNT} séries · {SERIE_TOTAL}{" "}
                exemplaires numérotés
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <Button href={reserverHref()} variant="accent" className="px-6 py-3">
                Réserver un numéro
                <Arrow />
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

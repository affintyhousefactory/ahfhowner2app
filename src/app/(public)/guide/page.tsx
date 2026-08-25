import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS, reserverHref } from "@/lib/site";
import { pageParRoute, pagesDeFamille } from "@/lib/pages/registry";
import { HUB_GUIDE as C } from "@/lib/pages/contenu/guides";
import { JsonLd } from "@/components/seo/JsonLd";
import { guidesHubSchema } from "@/lib/jsonld";
import { FilAriane } from "@/components/editorial/FilAriane";
import { BandeCta } from "@/components/editorial/BandeCta";
import { Section, EnteteSection } from "@/components/editorial/Bloc";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

/* Hub éditorial `/guide` (ADR-038, lot 3).

   La liste d'articles **dérive du registre** : elle ne peut donc annoncer que
   des guides réellement publiés. Pendant le chantier, le hub se remplit à
   mesure que les articles passent en ligne, sans qu'aucune liste ne soit à
   tenir à jour à la main.

   Le hub n'a volontairement aucun visuel : c'est un centre de ressources, pas
   une page produit. Une image y coûterait du poids (ADR-006) sans rien
   apporter à la lecture. */

const ROUTE = "/guide";

export const metadata: Metadata = {
  title: "Guides studio de jardin : permis, prix et réglementation | HOWNER",
  description:
    "Permis, déclaration préalable, prix, surface, location et agrandissement : les guides Howner pour préparer un projet de studio de jardin en toute clarté.",
  alternates: { canonical: ROUTE },
};

export default function GuideHubPage() {
  const page = pageParRoute(ROUTE)!;
  const articles = pagesDeFamille("guide");

  const fil = [
    { nom: "Accueil", route: "/" },
    { nom: page.libelle, route: ROUTE },
  ];

  return (
    <>
      {articles.length > 0 ? (
        <JsonLd data={guidesHubSchema(page, articles)} />
      ) : null}

      <section className="bg-ink pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container-page">
          <FilAriane fil={fil} clair />

          <Reveal>
            <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/60">
              {C.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="titre-xl mt-6 max-w-4xl text-balance text-canvas">
              {page.h1}
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 max-w-2xl text-[1.15rem] leading-relaxed text-canvas/85">
              {C.chapo}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href={reserverHref()}>
                Configurer mon studio
                <Arrow />
              </Button>
              <Button
                href={PRODUCTS.one.slug}
                variant="outline"
                className="border-canvas/25 text-canvas hover:border-canvas/60"
              >
                Découvrir {PRODUCTS.one.name}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-8 max-w-lg font-mono text-[0.7rem] leading-relaxed text-canvas/50">
              {C.microRassurance}
            </p>
          </Reveal>
        </div>
      </section>

      <Section id="articles">
        <Reveal>
          <p className="max-w-2xl text-[1.05rem] leading-relaxed text-muted">
            {C.intro}
          </p>
        </Reveal>

        {articles.length > 0 ? (
          <div className="mt-14 md:mt-20">
            {articles.map((a, i) => (
              <Reveal key={a.route} delay={0.04 * i}>
                {/* Toute la ligne est cliquable — le « + » est décoratif et
                    porté par le même lien, pour ne pas créer deux cibles
                    concurrentes vers la même destination. */}
                <Link
                  href={a.route}
                  className="group flex items-start justify-between gap-8 border-b border-line py-7 transition-colors hover:border-ink/40"
                >
                  <div className="max-w-2xl">
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                      Guide {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="titre-m mt-2 text-ink transition-colors group-hover:text-accent">
                      {a.h1}
                    </h2>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                      {a.resume}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line font-mono text-lg text-muted transition-all duration-300 group-hover:border-ink/40 group-hover:text-ink"
                  >
                    +
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : null}
      </Section>

      <BandeCta
        titre={C.conversion.titre}
        texte={C.conversion.texte}
        principal={{ libelle: "Configurer mon studio", href: reserverHref() }}
      />

      <Section id="formats" fond="surface">
        <EnteteSection
          numero="Choisir son format"
          titre={C.formats.titre}
          mention="One ou Max"
        />
        <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-2 md:gap-10">
          {(
            [
              [PRODUCTS.one, C.formats.one] as const,
              [PRODUCTS.max, C.formats.max] as const,
            ]
          ).map(([produit, texte], i) => (
            <Reveal key={produit.key} delay={i * 0.08}>
              <div className="flex h-full flex-col border border-line bg-canvas p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="titre-m text-ink">{produit.name}</h3>
                  <span className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-muted">
                    {produit.area}
                  </span>
                </div>
                <p className="mt-4 text-[1rem] leading-relaxed text-muted">{texte}</p>
                <div className="mt-8 md:mt-auto md:pt-6">
                  <Button href={produit.slug} variant="outline">
                    Découvrir {produit.name}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="reassurance" fond="ink">
        <Reveal>
          <h2 className="titre-l max-w-3xl text-balance text-canvas">
            {C.reassurance.titre}
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-canvas/75">
            {C.reassurance.texte}
          </p>
        </Reveal>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { PRODUCTS, reserverHref } from "@/lib/site";
import { pageParRoute } from "@/lib/pages/registry";
import { HAUT_DE_GAMME as C } from "@/lib/pages/contenu/studio-jardin-haut-de-gamme";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { CartesModeles } from "@/components/editorial/CartesModeles";
import { BandeCta } from "@/components/editorial/BandeCta";
import { PagesLiees } from "@/components/editorial/PagesLiees";
import { Section, EnteteSection, Chapo, ListePuces } from "@/components/editorial/Bloc";
import { Arguments, Cartes, Etapes, TableauDeux } from "@/components/editorial/Listes";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

/* Page d'entrée commerciale pour les recherches génériques « studio de jardin
   haut de gamme » (ADR-038, lot 2). Contenu dans
   `src/lib/pages/contenu/studio-jardin-haut-de-gamme.ts`, jamais ici.

   Composant **serveur** : aucun état, aucun effet. Les seuls îlots clients
   sont `Reveal` et `Button` (effet magnétique).

   Visuels : les deux images demandées par le classeur sont **déjà au dépôt**,
   versées le 2026-08-19 — aucun média ajouté, budget d'ADR-006 inchangé. */

const ROUTE = "/studio-jardin-haut-de-gamme";
const page = pageParRoute(ROUTE)!;

export const metadata: Metadata = {
  title: "Studio de jardin haut de gamme — Arko One & Arko Max | HOWNER",
  description:
    "Studios de jardin haut de gamme Howner : Arko One 20 m² et Arko Max 40 m². Architecture contemporaine, ossature acier LSF, fabrication hors-site et configuration personnalisée.",
  alternates: { canonical: ROUTE },
};

const FIL = [
  { nom: "Accueil", route: "/" },
  { nom: page.libelle, route: ROUTE },
] as const;

export default function StudioJardinHautDeGammePage() {
  return (
    <>
      <EditorialHero
        eyebrow={C.hero.eyebrow}
        h1={page.h1}
        chapo={C.hero.chapo}
        paragraphes={C.hero.paragraphes}
        note={C.hero.note}
        fil={FIL}
        principal={{ libelle: "Configurer mon studio", href: reserverHref() }}
        secondaire={{ libelle: "Découvrir Arko One", href: PRODUCTS.one.slug }}
        visuel={{
          src: "/assets/arko/max/clairiere.avif",
          alt: "Studio de jardin haut de gamme Howner posé dans une clairière boisée",
        }}
      />

      <Section id="modeles">
        <EnteteSection numero="001 — La gamme" titre={C.modeles.titre} mention="Deux formats" />
        <Chapo paragraphes={[C.modeles.intro]} />
        <CartesModeles one={C.modeles.one} max={C.modeles.max} />
      </Section>

      <Section id="pourquoi" fond="surface">
        <EnteteSection numero="002 — L'approche" titre={C.pourquoi.titre} mention="Cinq partis pris" />
        <Chapo paragraphes={C.pourquoi.intro} />
        <Arguments items={C.pourquoi.arguments} />

        {/* L'ossature LSF, montrée plutôt que décrite — l'argument structurel
            est le plus difficile à croire sur parole. */}
        <Reveal>
          <figure className="mt-16 md:mt-24">
            <div className="relative aspect-[16/9] w-full overflow-hidden border border-line bg-canvas">
              <Image
                src="/assets/arko/structure/structure-lsf.webp"
                alt="Ossature Light Steel Frame en acier léger galvanisé, profilés minces assemblés et boulonnés"
                fill
                sizes="(max-width: 768px) 92vw, 80vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
              Ossature Light Steel Frame — assemblage boulonné, profilés minces
            </figcaption>
          </figure>
        </Reveal>
      </Section>

      <BandeCta
        titre="Vous connaissez déjà votre usage ? Passez à votre configuration."
        texte="Surface, aménagement, niveau d'équipement : composez une première version de votre studio Arko et donnez une forme concrète à votre projet."
        principal={{ libelle: "Configurer mon studio", href: reserverHref() }}
      />

      <Section id="exigences">
        <EnteteSection
          numero="003 — L'exigence"
          titre={C.exigences.titre}
          mention="Sept critères"
        />
        <Chapo paragraphes={[C.exigences.intro]} />
        <TableauDeux
          entetes={["Exigence", "Approche Howner"]}
          lignes={C.exigences.lignes.map((l) => ({
            gauche: l.exigence,
            droite: l.approche,
          }))}
        />
      </Section>

      <Section id="choisir" fond="surface">
        <EnteteSection numero="004 — Le choix" titre={C.choisir.titre} mention="One ou Max" />
        <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-2 md:gap-10">
          {(
            [
              [C.choisir.one, PRODUCTS.one] as const,
              [C.choisir.max, PRODUCTS.max] as const,
            ]
          ).map(([bloc, produit], i) => (
            <Reveal key={produit.key} delay={i * 0.08}>
              <div className="flex h-full flex-col border-t border-line pt-6">
                <h3 className="titre-m text-ink">{bloc.condition}</h3>
                <p className="mt-4 text-[1rem] leading-relaxed text-muted">{bloc.texte}</p>
                <p className="mt-5 text-[0.95rem] font-medium leading-snug text-ink">
                  {produit.area} — {bloc.resume}
                </p>
                <div className="mt-6 md:mt-auto md:pt-6">
                  <Button href={produit.slug} variant="outline">
                    Voir {produit.name}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.16}>
          <div className="mt-14 border-t border-line pt-6">
            <h3 className="titre-s text-ink">{C.choisir.hesitation.titre}</h3>
            <p className="mt-3 max-w-xl text-[1rem] leading-relaxed text-muted">
              {C.choisir.hesitation.texte}
            </p>
            <div className="mt-6">
              <Button href={reserverHref()}>
                Configurer mon projet
                <Arrow />
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section id="usages">
        <EnteteSection
          numero="005 — Les usages"
          titre={C.usages.titre}
          mention={`${C.usages.cartes.length} directions`}
        />
        <Cartes items={C.usages.cartes} />
      </Section>

      <Section id="difference" fond="ink">
        <Reveal>
          <div className="rule flex items-baseline justify-between border-canvas/20 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/60">
              006 — La différence
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="titre-l mt-12 max-w-4xl text-balance text-canvas md:mt-16">
            {C.difference.titre}
          </h2>
        </Reveal>
        <Chapo paragraphes={C.difference.intro} clair />
        <ListePuces items={C.difference.points} clair />
        <Reveal delay={0.15}>
          <p className="mt-10 max-w-2xl text-[1rem] leading-relaxed text-canvas/70">
            {C.difference.conclusion}
          </p>
        </Reveal>
      </Section>

      <Section id="parcours">
        <EnteteSection
          numero="007 — Le parcours"
          titre={C.parcours.titre}
          mention="Cinq temps"
        />
        <Etapes items={C.parcours.etapes} />
      </Section>

      <PagesLiees famille="usage" routeCourante={ROUTE} />

      <BandeCta
        titre={C.final.titre}
        texte={`${C.final.texte} ${C.final.relance}`}
        principal={{ libelle: "Configurer mon studio de jardin", href: reserverHref() }}
        secondaire={{ libelle: "Découvrir Arko Max", href: PRODUCTS.max.slug }}
      />
    </>
  );
}

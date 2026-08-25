import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS, reserverHref } from "@/lib/site";
import { pageParRoute } from "@/lib/pages/registry";
import { BUREAU_TELETRAVAIL as C } from "@/lib/pages/contenu/bureau-pour-teletravail";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageSchema } from "@/lib/jsonld";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { CartesModeles } from "@/components/editorial/CartesModeles";
import { BandeCta } from "@/components/editorial/BandeCta";
import { PagesLiees } from "@/components/editorial/PagesLiees";
import { FaqEditoriale } from "@/components/editorial/FaqEditoriale";
import { Section, EnteteSection, Chapo, ListePuces, Reserve } from "@/components/editorial/Bloc";
import { Arguments, Cartes, Etapes, TableauMatrice } from "@/components/editorial/Listes";
import { Reveal } from "@/components/ui/Reveal";
import { Arrow } from "@/components/ui/Button";

/* Page d'usage « bureau pour télétravail » (ADR-038, lot 2).

   ⚠ Cette page et `/bureau-de-jardin` traitent un sujet voisin. Le partage est
   documenté en tête de `src/lib/pages/contenu/bureau-pour-teletravail.ts` :
   ici la **situation** (ce que le télétravail fait au logement, les profils,
   les alternatives), là-bas l'**objet** (l'ossature, les modèles, la journée
   type). La section constructive n'est donc pas dupliquée : elle est liée. */

const ROUTE = "/bureau-pour-teletravail";
const page = pageParRoute(ROUTE)!;

export const metadata: Metadata = {
  title: "Bureau pour télétravail dans le jardin | HOWNER",
  description:
    "Créez un véritable bureau pour télétravailler dans votre jardin : studios de jardin d'architecte Arko One et Arko Max, ossature acier LSF, configuration en ligne.",
  alternates: { canonical: ROUTE },
};

const FIL = [
  { nom: "Accueil", route: "/" },
  { nom: page.libelle, route: ROUTE },
] as const;

export default function BureauPourTeletravailPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(C.faq)} />

      <EditorialHero
        eyebrow={C.hero.eyebrow}
        h1={page.h1}
        chapo={C.hero.chapo}
        paragraphes={C.hero.paragraphes}
        note={C.hero.note}
        fil={FIL}
        principal={{ libelle: "Configurer mon bureau", href: reserverHref() }}
        secondaire={{ libelle: "Comparer Arko One et Max", href: "#modeles" }}
        visuel={{
          src: "/assets/arko/max/clairiere.avif",
          alt: "Studio de jardin Arko utilisé comme bureau de télétravail, au fond d'un jardin",
        }}
      />

      <Section id="probleme">
        <EnteteSection
          numero="001 — Le constat"
          titre={C.probleme.titre}
          mention="Le télétravail au long cours"
        />
        <Chapo paragraphes={C.probleme.intro} />
        <ListePuces items={C.probleme.points} />
        <Reveal delay={0.1}>
          <p className="editorial mt-14 max-w-3xl text-balance text-[1.4rem] leading-snug text-ink md:mt-20 md:text-[2rem]">
            {C.probleme.conclusion}
          </p>
        </Reveal>
      </Section>

      <Section id="benefices" fond="surface">
        <EnteteSection
          numero="002 — Ce que ça change"
          titre={C.benefices.titre}
          mention="Cinq effets"
        />
        <Arguments items={C.benefices.arguments} />
      </Section>

      <Section id="serieux">
        <EnteteSection
          numero="003 — Le niveau d'exigence"
          titre={C.serieux.titre}
          mention="Une vraie construction"
        />
        <Chapo paragraphes={C.serieux.intro} />
        <Reveal delay={0.1}>
          <Link
            href={C.serieux.lien.href}
            className="group mt-8 inline-flex items-center gap-2 border-b border-ink/20 pb-1 text-[1rem] text-ink transition-colors hover:border-ink"
          >
            {C.serieux.lien.texte}
            <Arrow className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </Section>

      <Section id="profils" fond="surface">
        <EnteteSection numero="004 — Pour qui" titre={C.profils.titre} mention="Six profils" />
        <Cartes items={C.profils.cartes} />
      </Section>

      <Section id="alternatives">
        <EnteteSection
          numero="005 — Les options"
          titre={C.alternatives.titre}
          mention="Trois façons de faire"
        />
        <Chapo paragraphes={[C.alternatives.intro]} />
        <TableauMatrice
          entetes={C.alternatives.entetes}
          lignes={C.alternatives.lignes.map((l) => ({
            tete: l.critere,
            cellules: [l.piece, l.extension, l.arko],
          }))}
        />
      </Section>

      <Section id="modeles" fond="surface">
        <EnteteSection
          numero="006 — Les modèles"
          titre="Quel Arko pour votre façon de travailler ?"
          mention="One ou Max"
        />
        <CartesModeles
          one={{
            accroche: "Compact à l'extérieur. Professionnel à l'intérieur.",
            texte:
              "Le format d'un bureau individuel premium, suffisamment séparé du logement pour changer réellement la façon de travailler.",
            usages: [
              "télétravail plusieurs jours par semaine",
              "activité de consultant ou de freelance",
              "espace de concentration ou studio créatif",
            ],
          }}
          max={{
            accroche: "Deux postes, un coin réunion, ou les deux.",
            texte:
              "Le format qui absorbe plusieurs fonctions dans un même volume, sans que chaque pièce du logement ne devienne un bureau.",
            usages: [
              "deux postes de travail",
              "bureau et espace de réunion",
              "accueil ponctuel de clients",
            ],
          }}
        />
      </Section>

      <BandeCta
        titre="Vous savez ce dont vous avez besoin. Reste à le dessiner."
        texte="Choisissez votre modèle, vos usages et commencez à configurer votre futur bureau."
        principal={{ libelle: "Configurer mon bureau", href: reserverHref() }}
      />

      <Section id="patrimoine">
        <EnteteSection numero="007 — La suite" titre={C.patrimoine.titre} mention="Un usage de plus" />
        <Chapo paragraphes={C.patrimoine.intro} />
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-ink/85">
            {C.patrimoine.conclusion}
          </p>
        </Reveal>
        <Reserve>{C.patrimoine.reserve}</Reserve>
      </Section>

      <Section id="design" fond="ink">
        <Reveal>
          <div className="rule flex items-baseline justify-between border-canvas/20 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/60">
              {"008 — L'architecture"}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="titre-l mt-12 max-w-4xl text-balance text-canvas md:mt-16">
            {C.design.titre}
          </h2>
        </Reveal>
        <Chapo paragraphes={C.design.intro} clair />
        <Reveal delay={0.15}>
          <p className="editorial mt-12 max-w-2xl text-balance text-[1.4rem] leading-snug text-canvas md:text-[2rem]">
            {C.design.phrase}
          </p>
        </Reveal>
      </Section>

      <Section id="parcours">
        <EnteteSection numero="009 — Le parcours" titre={C.parcours.titre} mention="Quatre temps" />
        <Etapes items={C.parcours.etapes} />
        <Reserve>{C.parcours.reserve}</Reserve>
      </Section>

      <Section id="faq" fond="surface">
        <EnteteSection
          numero="010 — Questions"
          titre="Questions fréquentes sur le bureau de télétravail"
          mention={`${C.faq.length} réponses`}
        />
        <FaqEditoriale items={C.faq} />
      </Section>

      <PagesLiees famille="usage" routeCourante={ROUTE} />

      <BandeCta
        titre={C.final.titre}
        texte={C.final.texte}
        principal={{ libelle: "Configurer mon bureau", href: reserverHref() }}
        secondaire={{ libelle: "Découvrir Arko One", href: PRODUCTS.one.slug }}
      />
    </>
  );
}

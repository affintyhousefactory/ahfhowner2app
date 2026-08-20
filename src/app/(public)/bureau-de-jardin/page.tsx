import type { Metadata } from "next";
import { PRODUCTS, reserverHref } from "@/lib/site";
import { pageParRoute } from "@/lib/pages/registry";
import { BUREAU_DE_JARDIN as C } from "@/lib/pages/contenu/bureau-de-jardin";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageSchema } from "@/lib/jsonld";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { CartesModeles } from "@/components/editorial/CartesModeles";
import { BandeCta } from "@/components/editorial/BandeCta";
import { PagesLiees } from "@/components/editorial/PagesLiees";
import { FaqEditoriale } from "@/components/editorial/FaqEditoriale";
import { Section, EnteteSection, Chapo, ListePuces, Reserve } from "@/components/editorial/Bloc";
import { Arguments, Cartes, TableauMatrice } from "@/components/editorial/Listes";
import { Reveal } from "@/components/ui/Reveal";

/* Page d'usage « bureau de jardin » (ADR-038, lot 2).
   Contenu dans `src/lib/pages/contenu/bureau-de-jardin.ts`, jamais ici.

   `FAQPage` est posé **parce que** la FAQ est réellement rendue dans la page,
   en `<details>` natifs dont le texte est présent dans le HTML servi — c'est
   la condition posée par ADR-038 §6, et la règle des moteurs. */

const ROUTE = "/bureau-de-jardin";
const page = pageParRoute(ROUTE)!;

export const metadata: Metadata = {
  title: "Bureau de jardin d'architecte — travailler chez soi, sans travailler dedans | HOWNER",
  description:
    "Un vrai bureau indépendant à quelques mètres de chez vous : studio de jardin d'architecte Arko One ou Arko Max, ossature acier LSF, fabrication hors-site.",
  alternates: { canonical: ROUTE },
};

const FIL = [
  { nom: "Accueil", route: "/" },
  { nom: page.libelle, route: ROUTE },
] as const;

export default function BureauDeJardinPage() {
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
        principal={{ libelle: "Configurer mon bureau de jardin", href: reserverHref() }}
        secondaire={{ libelle: "Découvrir les modèles Arko", href: PRODUCTS.one.slug }}
        visuel={{
          src: "/assets/arko/max/clairiere.avif",
          alt: "Studio de jardin Arko installé au fond d'un jardin, utilisé comme bureau indépendant",
        }}
      />

      <Section id="concept">
        <EnteteSection numero="001 — Le principe" titre={C.concept.titre} mention="La frontière" />
        <Chapo paragraphes={C.concept.intro} />
        <Cartes items={C.concept.benefices} />
      </Section>

      <Section id="serieux" fond="surface">
        <EnteteSection
          numero="002 — Le niveau d'exigence"
          titre={C.serieux.titre}
          mention="Pas une cabane"
        />
        <Chapo paragraphes={C.serieux.intro} />
        <ListePuces items={C.serieux.points} />
        <Reserve>{C.serieux.reserve}</Reserve>
      </Section>

      <Section id="lsf">
        <EnteteSection numero="003 — La construction" titre={C.lsf.titre} mention="Light Steel Frame" />
        <Chapo paragraphes={C.lsf.intro} />
        <Arguments items={C.lsf.arguments} />
        <Reveal delay={0.1}>
          <p className="editorial mt-16 max-w-3xl text-balance text-[1.4rem] leading-snug text-ink md:mt-20 md:text-[2rem]">
            {C.lsf.phrase}
          </p>
        </Reveal>
      </Section>

      <Section id="modeles" fond="surface">
        <EnteteSection numero="004 — Les modèles" titre={C.modeles.titre} mention="One ou Max" />
        <Chapo paragraphes={[C.modeles.intro]} />
        <CartesModeles one={C.modeles.one} max={C.modeles.max} />
      </Section>

      <Section id="comparatif">
        <EnteteSection
          numero="005 — Le comparatif"
          titre={C.comparatif.titre}
          mention="Par besoin"
        />
        <TableauMatrice
          entetes={["Besoin", PRODUCTS.one.name, PRODUCTS.max.name]}
          lignes={C.comparatif.lignes.map((l) => ({ tete: l.besoin, cellules: [l.one, l.max] }))}
        />
      </Section>

      <BandeCta
        titre={C.comparatif.relance}
        principal={{ libelle: "Configurer mon bureau de jardin", href: reserverHref() }}
      />

      <Section id="journee" fond="surface">
        <EnteteSection numero="006 — Une journée" titre={C.journee.titre} mention="8 h 27" />
        <div className="mt-12 max-w-2xl space-y-4 border-l border-line pl-6 md:mt-16">
          {C.journee.recit.map((l, i) => (
            <Reveal key={i} delay={0.05 * i}>
              <p className="text-[1.05rem] leading-relaxed text-ink/85">{l}</p>
            </Reveal>
          ))}
        </div>
        <ListePuces items={C.journee.benefices} />
      </Section>

      <Section id="evolutif">
        <EnteteSection
          numero="007 — La suite"
          titre={C.evolutif.titre}
          mention="Un espace qui dure"
        />
        <Chapo paragraphes={C.evolutif.intro} />
        <ListePuces items={C.evolutif.usages} />
        <Reserve>{C.evolutif.reserve}</Reserve>
      </Section>

      <Section id="sans-travaux" fond="ink">
        <Reveal>
          <div className="rule flex items-baseline justify-between border-canvas/20 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/60">
              {"008 — L'alternative"}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 max-w-4xl text-balance text-[2rem] leading-[1.06] text-canvas md:mt-16 md:text-[3.6rem]">
            {C.sansTravaux.titre}
          </h2>
        </Reveal>
        <Chapo paragraphes={C.sansTravaux.intro} clair />
        <Reveal delay={0.15}>
          <p className="editorial mt-12 max-w-2xl text-balance text-[1.4rem] leading-snug text-canvas md:text-[2rem]">
            {C.sansTravaux.phrase}
          </p>
        </Reveal>
      </Section>

      <Section id="faq">
        <EnteteSection
          numero="009 — Questions"
          titre="Questions fréquentes sur le bureau de jardin"
          mention={`${C.faq.length} réponses`}
        />
        <FaqEditoriale items={C.faq} />
      </Section>

      <PagesLiees famille="usage" routeCourante={ROUTE} />

      <BandeCta
        titre={C.final.titre}
        texte={C.final.texte}
        principal={{ libelle: "Configurer mon bureau de jardin", href: reserverHref() }}
        secondaire={{ libelle: "Découvrir Arko Max", href: PRODUCTS.max.slug }}
      />
    </>
  );
}

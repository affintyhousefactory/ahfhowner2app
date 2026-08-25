import type { Metadata } from "next";
import { PRODUCTS, reserverHref } from "@/lib/site";
import { pageParRoute } from "@/lib/pages/registry";
import { DEPENDANCE_HABITABLE as C } from "@/lib/pages/contenu/dependance-habitable";
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

/* Page d'usage « dépendance habitable » (ADR-038, lot 2).

   ⚠ Cadre de vente : la page décrit une **annexe sur parcelle déjà bâtie**,
   configuration ouverte par ADR-029. Rien n'y présente le logement indépendant
   sur terrain nu comme disponible — c'est la consigne n°11 de la spec, et le
   guardrail de marque.

   ⚠ Urbanisme : aucun argument « sans permis ». La page dit l'inverse — le
   terrain se vérifie avant que le projet aille plus loin. */

const ROUTE = "/dependance-habitable";
const page = pageParRoute(ROUTE)!;

export const metadata: Metadata = {
  title: "Dépendance habitable de jardin — studios Arko | HOWNER",
  description:
    "Créez une dépendance habitable élégante dans votre jardin avec les studios Arko One et Arko Max : design, confort, ossature acier LSF, fabrication hors-site et configuration en ligne.",
  alternates: { canonical: ROUTE },
};

const FIL = [
  { nom: "Accueil", route: "/" },
  { nom: page.libelle, route: ROUTE },
] as const;

export default function DependanceHabitablePage() {
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
        principal={{ libelle: "Configurer ma dépendance", href: reserverHref() }}
        secondaire={{ libelle: "Voir les deux studios", href: "#modeles" }}
        visuel={{
          src: "/assets/arko/max/clairiere.avif",
          alt: "Dépendance habitable Arko installée dans le jardin d'une propriété existante",
        }}
      />

      <Section id="changements">
        <EnteteSection
          numero="001 — Ce que ça change"
          titre={C.changements.titre}
          mention="Cinq usages"
        />
        <Chapo paragraphes={[C.changements.intro]} />
        <Cartes items={C.changements.cartes} />
      </Section>

      <Section id="rupture" fond="surface">
        <EnteteSection
          numero="002 — La différence"
          titre={C.rupture.titre}
          mention="Pas une annexe"
        />
        <Chapo paragraphes={C.rupture.intro} />
        <ListePuces items={C.rupture.points} />
        <Reveal delay={0.1}>
          <p className="editorial mt-14 max-w-3xl text-balance text-[1.4rem] leading-snug text-ink md:mt-20 md:text-[2rem]">
            {C.rupture.conclusion}
          </p>
        </Reveal>
      </Section>

      <Section id="modeles">
        <EnteteSection numero="003 — La gamme" titre={C.modeles.titre} mention="Deux modèles" />
        <Chapo paragraphes={[C.modeles.intro]} />
        <CartesModeles one={C.modeles.one} max={C.modeles.max} />
      </Section>

      <Section id="comparatif" fond="surface">
        <EnteteSection
          numero="004 — Le comparatif"
          titre={C.comparatif.titre}
          mention="Par projet"
        />
        <TableauMatrice
          entetes={["Votre projet", PRODUCTS.one.name, PRODUCTS.max.name]}
          lignes={C.comparatif.lignes.map((l) => ({ tete: l.besoin, cellules: [l.one, l.max] }))}
        />
      </Section>

      <BandeCta
        titre={C.comparatif.relance}
        principal={{ libelle: "Comparer dans le configurateur", href: reserverHref() }}
      />

      <Section id="construction">
        <EnteteSection
          numero="005 — La construction"
          titre={C.construction.titre}
          mention="Light Steel Frame"
        />
        <Chapo paragraphes={C.construction.intro} />
        <Arguments items={C.construction.arguments} />
        <Reveal delay={0.1}>
          <p className="editorial mt-16 max-w-3xl text-balance text-[1.4rem] leading-snug text-ink md:mt-20 md:text-[2rem]">
            {C.construction.conclusion}
          </p>
        </Reveal>
      </Section>

      <Section id="integration" fond="surface">
        <EnteteSection
          numero="006 — L'intégration"
          titre={C.integration.titre}
          mention="Un dialogue"
        />
        <Chapo paragraphes={C.integration.intro} />
        <ListePuces items={C.integration.points} />
        <Reveal delay={0.1}>
          <div className="mt-14 max-w-2xl border-t border-line pt-6">
            <h3 className="titre-m text-ink">
              {C.integration.personnalisation.titre}
            </h3>
            <p className="mt-4 text-[1rem] leading-relaxed text-muted">
              {C.integration.personnalisation.texte}
            </p>
          </div>
        </Reveal>
      </Section>

      <Section id="parcours">
        <EnteteSection numero="007 — Le parcours" titre={C.parcours.titre} mention="Cinq temps" />
        <Etapes items={C.parcours.etapes} />
        <Reserve>{C.parcours.reserve}</Reserve>
      </Section>

      <Section id="urbanisme" fond="ink">
        <Reveal>
          <div className="rule flex items-baseline justify-between border-canvas/20 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/60">
              008 — Les démarches
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="titre-l mt-12 max-w-4xl text-balance text-canvas md:mt-16">
            {C.urbanisme.titre}
          </h2>
        </Reveal>
        <Chapo paragraphes={C.urbanisme.intro} clair />
        <Reveal delay={0.15}>
          <p className="editorial mt-12 max-w-2xl text-balance text-[1.4rem] leading-snug text-canvas md:text-[2rem]">
            {C.urbanisme.phrase}
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl border-l border-canvas/25 pl-4 text-sm leading-relaxed text-canvas/60">
            {C.urbanisme.reserve}
          </p>
        </Reveal>
      </Section>

      <Section id="profils">
        <EnteteSection numero="009 — Pour qui" titre={C.profils.titre} mention="Quatre situations" />
        <Cartes items={C.profils.cartes} />
      </Section>

      <Section id="emotion" fond="surface">
        <Reveal>
          <h2 className="titre-l max-w-4xl text-balance text-ink">
            {C.emotion.titre}
          </h2>
        </Reveal>
        <Chapo paragraphes={C.emotion.lignes} />
      </Section>

      <Section id="faq">
        <EnteteSection
          numero="010 — Questions"
          titre="Questions fréquentes sur la dépendance habitable"
          mention={`${C.faq.length} réponses`}
        />
        <FaqEditoriale items={C.faq} />
      </Section>

      <PagesLiees famille="usage" routeCourante={ROUTE} />

      <BandeCta
        titre={C.final.titre}
        texte={`${C.final.texte} ${C.final.note}`}
        principal={{ libelle: "Configurer ma dépendance habitable", href: reserverHref() }}
        secondaire={{ libelle: "Découvrir Arko Max", href: PRODUCTS.max.slug }}
      />
    </>
  );
}

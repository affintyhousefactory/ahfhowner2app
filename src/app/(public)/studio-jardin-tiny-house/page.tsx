import type { Metadata } from "next";
import { PRODUCTS, reserverHref } from "@/lib/site";
import { pageParRoute } from "@/lib/pages/registry";
import { TINY_HOUSE as C } from "@/lib/pages/contenu/studio-jardin-tiny-house";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { CartesModeles } from "@/components/editorial/CartesModeles";
import { BandeCta } from "@/components/editorial/BandeCta";
import { PagesLiees } from "@/components/editorial/PagesLiees";
import { Section, EnteteSection, Chapo, ListePuces } from "@/components/editorial/Bloc";
import { TableauMatrice } from "@/components/editorial/Listes";
import { Reveal } from "@/components/ui/Reveal";

/* Page de comparaison (ADR-038, lot 2).

   ⚠ Seule page du site où « tiny house » est autorisé — ADR-029 § Amendement
   du 2026-08-20. Le terme y désigne toujours le produit concurrent qu'on
   écarte, jamais un Arko. L'exception est portée par le champ `sauf` du
   contrôle et couvre trois chemins : cette page, son fichier de contenu et le
   registre. Le reste de la blocklist s'y applique intégralement.

   ⚠ Ton : aucune attaque du produit comparé. La tiny house est présentée comme
   une bonne réponse à un autre projet — celui de se déplacer. */

const ROUTE = "/studio-jardin-tiny-house";
const page = pageParRoute(ROUTE)!;

export const metadata: Metadata = {
  title: "Studio de jardin ou tiny house : que choisir ? | HOWNER",
  description:
    "Mobilité ou implantation durable : ce qui sépare vraiment une tiny house d'un studio de jardin d'architecte. Comparaison honnête, et les deux modèles Arko.",
  alternates: { canonical: ROUTE },
};

const FIL = [
  { nom: "Accueil", route: "/" },
  { nom: page.libelle, route: ROUTE },
] as const;

export default function StudioJardinTinyHousePage() {
  return (
    <>
      <EditorialHero
        eyebrow={C.hero.eyebrow}
        h1={page.h1}
        chapo={C.hero.chapo}
        paragraphes={C.hero.paragraphes}
        note={C.hero.note}
        fil={FIL}
        principal={{ libelle: "Configurer mon studio de jardin", href: reserverHref() }}
        secondaire={{ libelle: "Voir les deux studios", href: "#modeles" }}
        visuel={{
          src: "/assets/arko/max/ecrin.avif",
          alt: "Studio de jardin d'architecte Arko posé durablement dans un jardin arboré",
        }}
      />

      <Section id="philosophies">
        <EnteteSection
          numero="001 — Le point de départ"
          titre={C.philosophies.titre}
          mention="Partir ou rester"
        />
        <Chapo paragraphes={C.philosophies.intro} />
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-ink/85">
            {C.philosophies.conclusion}
          </p>
        </Reveal>
      </Section>

      <Section id="comparaison" fond="surface">
        <EnteteSection
          numero="002 — La comparaison"
          titre={C.comparaison.titre}
          mention={`${C.comparaison.lignes.length} critères`}
        />
        <TableauMatrice
          entetes={C.comparaison.entetes}
          lignes={C.comparaison.lignes.map((l) => ({
            tete: l.critere,
            cellules: [l.tiny, l.arko],
          }))}
        />
        <Reveal delay={0.1}>
          <p className="mt-12 max-w-3xl border-l border-line pl-5 text-[1.05rem] leading-relaxed text-ink/85">
            {C.comparaison.retenir}
          </p>
        </Reveal>
      </Section>

      <Section id="remorque">
        <EnteteSection
          numero="003 — La contrainte"
          titre={C.remorque.titre}
          mention="Le gabarit routier"
        />
        <Chapo paragraphes={C.remorque.intro} />
        <ListePuces items={C.remorque.compromis} />
        <Reveal delay={0.1}>
          <p className="mt-10 max-w-2xl text-[1.05rem] leading-relaxed text-ink/85">
            {C.remorque.conclusion}
          </p>
        </Reveal>
      </Section>

      <Section id="plain-pied" fond="surface">
        <EnteteSection
          numero="004 — L'usage"
          titre={C.plainPied.titre}
          mention="Sans mezzanine"
        />
        <Chapo paragraphes={C.plainPied.intro} />
        <Reveal delay={0.1}>
          <p className="editorial mt-12 max-w-3xl text-balance text-[1.4rem] leading-snug text-ink md:text-[2rem]">
            {C.plainPied.phrase}
          </p>
        </Reveal>
      </Section>

      <Section id="durable">
        <EnteteSection
          numero="005 — L'implantation"
          titre={C.durable.titre}
          mention="Pour durer"
        />
        <Chapo paragraphes={C.durable.intro} />
        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-[1.05rem] leading-relaxed text-ink/85">
            {C.durable.conclusion}
          </p>
        </Reveal>
      </Section>

      <Section id="choisir" fond="ink">
        <Reveal>
          <div className="rule flex items-baseline justify-between border-canvas/20 pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/60">
              006 — Le choix
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="editorial mt-12 max-w-4xl text-balance text-[2rem] leading-[1.06] text-canvas md:mt-16 md:text-[3.6rem]">
            {C.choisir.titre}
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-2 md:gap-16">
          {[C.choisir.tiny, C.choisir.studio].map((bloc, i) => (
            <Reveal key={bloc.titre} delay={0.08 * i}>
              <div className="border-t border-canvas/25 pt-6">
                <h3 className="editorial text-xl text-canvas md:text-2xl">{bloc.titre}</h3>
                <ListePuces items={bloc.points} clair />
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="polyvalence">
        <EnteteSection
          numero="007 — La durée"
          titre={C.polyvalence.titre}
          mention="Un bâtiment, des usages"
        />
        <Chapo paragraphes={C.polyvalence.intro} />
        <Reveal delay={0.1}>
          <p className="editorial mt-12 max-w-3xl text-balance text-[1.4rem] leading-snug text-ink md:text-[2rem]">
            {C.polyvalence.phrase}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl text-[1rem] leading-relaxed text-muted">
            {C.polyvalence.conclusion}
          </p>
        </Reveal>
      </Section>

      <Section id="architecture" fond="surface">
        <EnteteSection
          numero="008 — L'architecture"
          titre={C.architecture.titre}
          mention="Le petit volume assumé"
        />
        <Chapo paragraphes={C.architecture.intro} />
        <Reveal delay={0.1}>
          <p className="editorial mt-12 max-w-3xl text-balance text-[1.4rem] leading-snug text-ink md:text-[2rem]">
            {C.architecture.phrase}
          </p>
        </Reveal>
      </Section>

      <Section id="modeles">
        <EnteteSection numero="009 — La gamme" titre={C.modeles.titre} mention="One ou Max" />
        <CartesModeles one={C.modeles.one} max={C.modeles.max} />
      </Section>

      <Section id="convergence" fond="surface">
        <EnteteSection
          numero="010 — Le point commun"
          titre={C.convergence.titre}
          mention="Construire compact"
        />
        <Chapo paragraphes={C.convergence.intro} />
      </Section>

      <Section id="urbanisme">
        <EnteteSection
          numero="011 — Les règles"
          titre={C.urbanisme.titre}
          mention="Sans contournement"
        />
        <Chapo paragraphes={C.urbanisme.intro} />
        <Reveal delay={0.1}>
          <p className="editorial mt-12 max-w-3xl text-balance text-[1.4rem] leading-snug text-ink md:text-[2rem]">
            {C.urbanisme.phrase}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-8 max-w-2xl text-[1rem] leading-relaxed text-muted">
            {C.urbanisme.conclusion}
          </p>
        </Reveal>
      </Section>

      <PagesLiees famille="usage" routeCourante={ROUTE} />

      <BandeCta
        titre={C.final.titre}
        texte={C.final.texte}
        principal={{ libelle: "Configurer mon studio de jardin", href: reserverHref() }}
        secondaire={{ libelle: "Découvrir Arko One", href: PRODUCTS.one.slug }}
      />
    </>
  );
}

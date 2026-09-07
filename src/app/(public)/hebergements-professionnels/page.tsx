import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/site";
import { pageParRoute } from "@/lib/pages/registry";
import { HEBERGEMENTS_PRO as C } from "@/lib/pages/contenu/hebergements-professionnels";
import { EditorialHero } from "@/components/editorial/EditorialHero";
import { BandeCta } from "@/components/editorial/BandeCta";
import { PagesLiees } from "@/components/editorial/PagesLiees";
import { Section, EnteteSection, Chapo, ListePuces, Reserve } from "@/components/editorial/Bloc";
import { Cartes } from "@/components/editorial/Listes";

/* Page « Hébergements professionnels » — étude d'implantation (2026-09-07).

   Contenu dans `src/lib/pages/contenu/hebergements-professionnels.ts`, jamais
   ici : convention ADR-038, et la règle éditoriale du brief (« ne pas
   commencer par un nombre d'unités ») se relit à côté du copy qu'elle gouverne.

   Aucun composant nouveau, contrairement à la page RSE : celle-ci a la
   structure d'une page d'usage — hero, sections, cartes, appel — et le gabarit
   existant la rend telle quelle.

   ⚠ Pas de `FAQPage` : la page n'a pas de FAQ. Le schéma ne se pose que là où
   le contenu correspondant est réellement rendu (ADR-038 §6). */

const ROUTE = "/hebergements-professionnels";
const page = pageParRoute(ROUTE)!;

export const metadata: Metadata = {
  title: C.metaTitle,
  description: C.metaDescription,
  alternates: { canonical: ROUTE },
};

const FIL = [
  { nom: "Accueil", route: "/" },
  { nom: page.libelle, route: ROUTE },
] as const;

/* Le formulaire de contact lit `?sujet=` et `?message=` — mécanisme déjà en
   production pour la branche « terrain nu » du configurateur. On pré-remplit
   l'amorce plutôt que d'ouvrir un formulaire vide : l'exploitant qui arrive là
   a une question précise, et lui laisser une page blanche la lui fait
   reformuler. Il reste libre de tout réécrire. */
const HREF_ETUDE = `/contact?sujet=autre&message=${encodeURIComponent(C.cta.message)}`;

export default function HebergementsProfessionnelsPage() {
  return (
    <>
      <EditorialHero
        eyebrow={C.hero.eyebrow}
        h1={page.h1}
        chapo={C.hero.chapo}
        paragraphes={C.hero.paragraphes}
        note={C.hero.note}
        fil={FIL}
        principal={{ libelle: C.cta.libelle, href: HREF_ETUDE }}
        secondaire={{ libelle: "Découvrir les modèles Arko", href: PRODUCTS.max.slug }}
        visuel={{
          src: "/assets/arko/max/clairiere.avif",
          alt: "Studio de jardin Arko implanté sur un terrain arboré, en hébergement d'appoint",
        }}
      />

      <Section id="etude">
        <EnteteSection
          numero="001 — L'étude"
          titre={C.etude.titre}
          mention="Sans engagement"
        />
        <Chapo paragraphes={C.etude.intro} />
        <ListePuces items={C.etude.puces} />
        <Reserve>{C.etude.reserve}</Reserve>
      </Section>

      <Section id="methode" fond="surface">
        <EnteteSection numero="002 — La méthode" titre={C.methode.titre} />
        <Cartes items={C.methode.cartes} />
      </Section>

      <Section id="livrable">
        <EnteteSection numero="003 — Le livrable" titre={C.livrable.titre} />
        <ListePuces items={C.livrable.puces} />
        <Reserve>{C.livrable.reserve}</Reserve>
      </Section>

      {/* Maillage — la famille « usage » regroupe les pages qui répondent à une
          intention : c'est là qu'un exploitant curieux ira ensuite. */}
      <PagesLiees famille="usage" routeCourante={ROUTE} />

      <BandeCta
        titre={C.cta.titre}
        texte={C.cta.texte}
        principal={{ libelle: C.cta.libelle, href: HREF_ETUDE }}
        secondaire={{ libelle: "Voir les studios Arko", href: PRODUCTS.max.slug }}
      />
    </>
  );
}

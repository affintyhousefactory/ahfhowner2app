import { PRODUCTS, reserverHref, type ProductKey } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { ListePuces } from "./Bloc";

/**
 * Duo Arko One / Arko Max — présent dans les cinq specs du lot 2.
 *
 * Le nom, la surface et l'URL viennent de `PRODUCTS` (`site.ts`) et ne sont
 * jamais recopiés dans le contenu de page : le jour où la gamme bouge, une
 * seule ligne change au lieu de cinq pages. Le CTA de configuration passe par
 * `reserverHref()`, donc la bascule d'ADR-031 les suivra sans retouche.
 *
 * Chaque carte porte son propre couple « Découvrir » / « Configurer », comme
 * l'exige la règle de conversion des specs.
 */
type Modele = {
  accroche: string;
  texte: string;
  usages: readonly string[];
  conclusion?: string;
};

export function CartesModeles({
  one,
  max,
}: {
  one: Modele;
  max: Modele;
}) {
  return (
    <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-2 md:gap-10">
      <CarteModele cle="one" modele={one} />
      <CarteModele cle="max" modele={max} />
    </div>
  );
}

function CarteModele({ cle, modele }: { cle: ProductKey; modele: Modele }) {
  const produit = PRODUCTS[cle];
  return (
    <Reveal delay={cle === "max" ? 0.08 : 0}>
      <article className="flex h-full flex-col border border-line bg-surface p-8 md:p-10">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="editorial text-2xl text-ink md:text-3xl">{produit.name}</h3>
          <span className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-muted">
            {produit.area}
          </span>
        </div>

        <p className="mt-5 text-[1.05rem] font-medium leading-snug text-ink">
          {modele.accroche}
        </p>
        <p className="mt-4 text-[1rem] leading-relaxed text-muted">{modele.texte}</p>

        <ListePuces items={modele.usages} />

        {modele.conclusion ? (
          <p className="mt-6 text-[0.95rem] leading-relaxed text-muted">
            {modele.conclusion}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3 pt-2 md:mt-auto">
          <Button href={produit.slug} variant="outline">
            Découvrir {produit.name}
          </Button>
          <Button href={reserverHref(cle)} variant="ghost">
            Configurer
            <Arrow />
          </Button>
        </div>
      </article>
    </Reveal>
  );
}

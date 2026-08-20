import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

/**
 * Bandeau de conversion — intermédiaire ou final.
 *
 * Les specs en demandent plusieurs par page, sans multiplier les actions : un
 * CTA principal vers le configurateur, éventuellement un secondaire vers une
 * page produit. Au-delà, l'attention se disperse et le taux baisse — c'est la
 * règle de conversion rappelée par la spec haut de gamme.
 */
export function BandeCta({
  titre,
  texte,
  principal,
  secondaire,
  fond = "ink",
}: {
  titre: string;
  texte?: string;
  principal: { libelle: string; href: string };
  secondaire?: { libelle: string; href: string };
  fond?: "ink" | "surface";
}) {
  const sombre = fond === "ink";
  return (
    <section className={sombre ? "bg-ink py-20 md:py-28" : "bg-surface py-20 md:py-28"}>
      <div className="container-page">
        <Reveal>
          <h2
            className={`editorial max-w-3xl text-balance text-[1.8rem] leading-[1.1] md:text-[3rem] ${
              sombre ? "text-canvas" : "text-ink"
            }`}
          >
            {titre}
          </h2>
        </Reveal>
        {texte ? (
          <Reveal delay={0.05}>
            <p
              className={`mt-5 max-w-xl text-[1.05rem] leading-relaxed ${
                sombre ? "text-canvas/75" : "text-muted"
              }`}
            >
              {texte}
            </p>
          </Reveal>
        ) : null}
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href={principal.href}>
              {principal.libelle}
              <Arrow />
            </Button>
            {secondaire ? (
              <Button
                href={secondaire.href}
                variant="outline"
                className={sombre ? "border-canvas/25 text-canvas hover:border-canvas/60" : ""}
              >
                {secondaire.libelle}
              </Button>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

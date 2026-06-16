"use client";

import { PRICING } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";

export function Price() {
  const base = PRICING.base.toLocaleString("fr-FR");
  return (
    <section id="prix" className="bg-canvas py-24 md:py-36">
      <div className="container-page">
        <Reveal>
          <div className="rule flex items-baseline justify-between pt-5">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              005 — Le prix
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">
              TTC · clé en main
            </span>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-[1.1fr_0.9fr] md:items-end md:gap-16">
          <Reveal>
            <p className="font-mono text-sm text-muted">À partir de</p>
            <p className="editorial mt-2 text-[3.4rem] leading-[0.95] text-ink md:text-[6rem]">
              {base} €
            </p>
            <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-muted">
              TTC, clé en main · ~{PRICING.perM2.toLocaleString("fr-FR")} €/m²
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="max-w-md text-[1.05rem] leading-relaxed text-ink">
              Tout est compris : la maison finie, prête à vivre. La livraison
              s'estime selon votre terrain, les frais de terrain restent à part.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="#configurer" variant="accent">
                Configurer mon ARKO
                <Arrow />
              </Button>
              <Button href="#perimetre" variant="outline">
                Voir ce qui est inclus
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-12 max-w-2xl font-mono text-[0.7rem] leading-relaxed text-muted">
            Estimation indicative — document non contractuel, devis définitif
            après visite. Validité 3 mois. TVA 20 %.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

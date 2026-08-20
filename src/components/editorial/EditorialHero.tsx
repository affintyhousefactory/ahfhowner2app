import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { Button, Arrow } from "@/components/ui/Button";
import { FilAriane } from "./FilAriane";

/**
 * Hero des pages éditoriales.
 *
 * Le `<h1>` est rendu **hors de tout bloc animé par framer-motion** et
 * n'emprunte que `Reveal`, dont l'état masqué vit en CSS sous `.js-motion` :
 * un `<h1>` né sous `opacity:0` sérialisé part invisible pour un crawler.
 * C'est le défaut du 2026-07-20, re-trouvé le 2026-08-19 sur `ProductHero`.
 * **Aucun `<h1>` ne doit naître sous un bloc animé en JS.**
 *
 * L'image est `priority` : sur ces pages, elle est le LCP. Son `sizes` décrit
 * la largeur réelle du rendu, sinon Next sert une image surdimensionnée et le
 * budget d'ADR-006 (LCP < 0,8 s) s'évapore.
 */
export function EditorialHero({
  eyebrow,
  h1,
  chapo,
  paragraphes,
  note,
  fil,
  principal,
  secondaire,
  visuel,
}: {
  eyebrow: string;
  h1: string;
  chapo: string;
  paragraphes?: readonly string[];
  note?: string;
  fil: readonly { nom: string; route: string }[];
  principal: { libelle: string; href: string };
  secondaire?: { libelle: string; href: string };
  visuel: { src: string; alt: string };
}) {
  return (
    <section className="relative bg-ink pt-32 pb-0 md:pt-40">
      <div className="container-page">
        <FilAriane fil={fil} clair />

        <Reveal>
          <p className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-canvas/60">
            {eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="editorial mt-6 max-w-5xl text-balance text-[2.1rem] leading-[1.04] text-canvas md:text-[4.2rem]">
            {h1}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-[1.15rem] leading-relaxed text-canvas/85 md:text-[1.3rem]">
            {chapo}
          </p>
        </Reveal>

        {paragraphes?.length ? (
          <div className="mt-6 max-w-2xl space-y-4">
            {paragraphes.map((p, i) => (
              <Reveal key={i} delay={0.15 + i * 0.05}>
                <p className="text-[1rem] leading-relaxed text-canvas/70">{p}</p>
              </Reveal>
            ))}
          </div>
        ) : null}

        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href={principal.href}>
              {principal.libelle}
              <Arrow />
            </Button>
            {secondaire ? (
              <Button
                href={secondaire.href}
                variant="outline"
                className="border-canvas/25 text-canvas hover:border-canvas/60"
              >
                {secondaire.libelle}
              </Button>
            ) : null}
          </div>
        </Reveal>

        {note ? (
          <Reveal delay={0.3}>
            <p className="mt-8 max-w-lg font-mono text-[0.7rem] leading-relaxed text-canvas/50">
              {note}
            </p>
          </Reveal>
        ) : null}
      </div>

      <div className="relative mt-16 h-[46vh] w-full overflow-hidden md:mt-24 md:h-[62vh]">
        <Image
          src={visuel.src}
          alt={visuel.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Raccord au fond sombre de la section, pour que l'image n'ait pas
            l'air posée sur le texte mais qu'elle en descende. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent" />
      </div>
    </section>
  );
}

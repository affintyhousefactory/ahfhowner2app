"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { reserverHref, type ProductKey } from "@/lib/site";
import { Button, Arrow } from "@/components/ui/Button";
import { contenuProduit, prixBase, numerosLibres } from "@/lib/produits/heure-bleue";

/**
 * Hero des pages produit — direction « Heure bleue » (ADR-040).
 *
 * Le seul moment orchestré de la page : l'image se dézoome pendant que le titre
 * monte ligne par ligne. Tout le reste du mouvement est délégué à `Reveal`.
 *
 * ⚠ Trois contraintes tiennent la mise en œuvre :
 *
 * 1. **L'image est le LCP** (ADR-006, LCP < 0,8 s). D'où `priority` et
 *    `sizes="100vw"`. Le dézoom porte sur `scale`, composité par le GPU : il
 *    n'entre pas dans la mesure du LCP, contrairement à un `width` animé.
 *
 * 2. **Rien n'est masqué par un style inline.** Le titre est rendu tel quel, et
 *    les blocs qui l'entourent passent par `Reveal`, dont l'état masqué vit
 *    dans le CSS sous `.js-motion` — classe posée seulement si JS s'exécute.
 *
 *    ⚠ Ce n'était pas le cas au premier jet : `motion.p` sérialisait
 *    `style="opacity:0"` dans le HTML servi. Le `<h1>` était épargné, mais
 *    l'accroche ET le bouton « Réserver un numéro » partaient invisibles —
 *    sans JS, la page n'avait plus de CTA. Constaté en production le
 *    2026-08-25, sur le corps servi. Le code HTTP ne l'aurait jamais dit.
 *
 * 3. **L'en-tête du site n'est pas repris.** Sa barre porte un fond clair
 *    permanent depuis le 2026-08-20 : elle se pose sur ce hero sombre sans
 *    rien changer, comme elle le fait déjà sur les pages éditoriales.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroHeureBleue({ produit }: { produit: ProductKey }) {
  const c = contenuProduit(produit);
  const reduce = useReducedMotion();
  const libres = numerosLibres(produit);

  return (
    <section className="relative isolate overflow-hidden bg-nuit">
      {/* ⚠ Le cadre suit le rapport de l'image jusqu'à `md`. Un hero plein
          écran sur 390 × 844 px (rapport 0,46) rognerait les deux tiers d'un
          visuel en 16/9 — donc le studio lui-même. Au-delà, la hauteur permet
          la superposition sans rien perdre. Même règle que sur l'accueil. */}
      <div className="relative mt-20 aspect-video w-full md:mt-0 md:aspect-auto md:h-[min(88svh,52rem)]">
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.07 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE }}
        >
          <Image
            src={c.hero.src}
            alt={c.hero.alt}
            fill
            priority
            sizes="100vw"
            style={{ filter: `brightness(${c.hero.luminosite ?? 0.74}) saturate(1.1)` }}
            className="object-cover"
          />
        </motion.div>

        {/* Le voile ne sert que le texte : il n'apparaît qu'avec lui. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(15,21,25,.72)_0%,rgba(15,21,25,.18)_34%,rgba(15,21,25,.97)_100%)] md:block"
        />

      </div>

      {/* ⚠ UN SEUL bloc de texte, donc un seul `<h1>` dans le HTML. Deux blocs
          alternés par media query auraient servi deux titres au crawler, ce que
          la vérification « un seul h1 par page » d'ADR-038 interdit.

          Sur mobile il suit l'image dans le flux ; à partir de `md` il devient
          absolu et se pose dessus. Une seule copie du contenu, deux positions. */}
      <div className="container-page relative z-10 flex flex-col gap-5 py-9 md:absolute md:inset-x-0 md:bottom-0 md:gap-0 md:pb-16">
        <div className="md:flex md:items-end md:justify-between md:gap-14">
          <div className="flex flex-col gap-5 md:max-w-3xl md:gap-0">
            <Reveal as="span" delay={0.1} className="block font-mono text-[0.66rem] uppercase tracking-[0.24em] text-lumiere md:text-[0.7rem]">
              {c.eyebrow}
            </Reveal>

            {/* La coupe de ligne n'existe qu'à partir de `md` : sur 390 px le
                titre se replie tout seul, un `<br>` y créerait une veuve. */}
            <h1 className="titre-hero text-nuit-titre md:mt-5">
              {c.titre[0]}
              <br className="hidden md:inline" />{" "}
              {c.titre[1]}
            </h1>

            <Reveal as="span" delay={0.3} className="block text-[0.95rem] font-light leading-relaxed text-nuit-muted md:mt-6 md:max-w-[52ch] md:text-lg">
              {c.accroche}
            </Reveal>

            <Reveal delay={0.42} className="flex flex-col gap-3 md:mt-8 md:flex-row md:flex-wrap md:items-center md:gap-5">
              <Button href={reserverHref(produit)} variant="lumiere" className="w-full md:w-auto">
                Réserver un numéro
                <Arrow />
              </Button>
              <span className="text-[0.85rem] text-nuit-muted md:text-sm">
                {libres} numéro{libres > 1 ? "s" : ""} encore libre{libres > 1 ? "s" : ""}
              </span>
            </Reveal>
          </div>

          <Reveal as="span" delay={0.54} className="flex shrink-0 items-baseline gap-3 md:flex-col md:items-end md:gap-1.5 md:pb-1.5">
            <span className="titre-m leading-none text-nuit-titre md:[font-size:clamp(1.9rem,4vw,2.9rem)]">
              {prixBase(produit).toLocaleString("fr-FR")} €
            </span>
            <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-nuit-faible md:text-[0.68rem]">
              TTC · à partir de
            </span>
          </Reveal>
        </div>
      </div>

    </section>
  );
}


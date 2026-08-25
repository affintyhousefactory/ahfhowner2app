"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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
 * 2. **Le titre n'est jamais masqué en JS.** Il est rendu tel quel côté
 *    serveur ; l'animation ne s'applique qu'aux blocs qui l'entourent. Un
 *    `<h1>` en `opacity: 0` sérialisé n'est pas indexé — leçon du 2026-08-19,
 *    et raison d'être de l'état masqué en CSS dans `Reveal`.
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

  /* Le titre est le repère : les blocs voisins entrent autour de lui. */
  const monte = (delai: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay: delai, ease: EASE },
        };

  return (
    <section className="relative isolate overflow-hidden bg-[#0f1519]">
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
          className="object-cover brightness-[.74] saturate-[1.1]"
        />
      </motion.div>

      {/* Le dégradé porte la lisibilité du texte : sans lui, le contraste
          dépend de la photo, donc de la prochaine photo. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,21,25,.72)_0%,rgba(15,21,25,.18)_34%,rgba(15,21,25,.97)_100%)]"
      />

      <div className="container-page relative flex min-h-[min(88svh,52rem)] flex-col justify-end pb-14 pt-28 md:pb-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between md:gap-14">
          <div className="max-w-3xl">
            <motion.p
              {...monte(0.1)}
              className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-[#e8c9a0]"
            >
              {c.eyebrow}
            </motion.p>

            {/* Rendu sans animation d'opacité : voir la contrainte 2. */}
            <h1 className="mt-5 font-display text-[clamp(2.2rem,6.4vw,4.6rem)] font-normal leading-[1.02] tracking-[-0.035em] text-[#f7f9fa] [text-wrap:pretty]">
              {c.titre[0]}
              <br />
              {c.titre[1]}
            </h1>

            <motion.p
              {...monte(0.3)}
              className="mt-6 max-w-[52ch] text-[1.0625rem] font-light leading-relaxed text-[#b9c3cb] md:text-lg"
            >
              {c.accroche}
            </motion.p>

            <motion.div {...monte(0.42)} className="mt-8 flex flex-wrap items-center gap-5">
              <Button href={reserverHref(produit)} variant="lumiere">
                Réserver un numéro
                <Arrow />
              </Button>
              <span className="text-sm text-[#b9c3cb]">
                {libres} numéro{libres > 1 ? "s" : ""} encore libre{libres > 1 ? "s" : ""}
              </span>
            </motion.div>
          </div>

          <motion.p
            {...monte(0.54)}
            className="flex shrink-0 flex-col gap-1.5 md:items-end md:pb-1.5"
          >
            <span className="font-display text-[clamp(1.9rem,4vw,2.9rem)] leading-none text-[#f7f9fa]">
              {prixBase(produit).toLocaleString("fr-FR")} €
            </span>
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#7d8b95]">
              TTC · à partir de
            </span>
          </motion.p>
        </div>
      </div>
    </section>
  );
}


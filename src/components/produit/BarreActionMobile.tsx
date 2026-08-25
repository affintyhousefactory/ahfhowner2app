"use client";

import { useEffect, useState } from "react";
import { reserverHref, type ProductKey } from "@/lib/site";
import { prixBase, numerosLibres } from "@/lib/produits/heure-bleue";
import { Button, Arrow } from "@/components/ui/Button";

/**
 * Barre d'action mobile — ADR-040, moment de motion n° 4.
 *
 * Le geste attendu reste sous le pouce sur toute la page. Elle n'apparaît
 * qu'une fois le hero franchi : sur le hero, le bouton est déjà là, deux appels
 * superposés n'aideraient personne.
 *
 * ⚠ Mobile seulement (`md:hidden`). Sur bureau le rappel se fait en clôture,
 * une barre collante y mangerait de la hauteur sans rien résoudre.
 *
 * `translate-y-full` plutôt qu'un démontage : l'élément reste dans le DOM, donc
 * son contenu est lisible sans JS et la transition a quelque chose à animer.
 */
export function BarreActionMobile({ produit }: { produit: ProductKey }) {
  const [visible, setVisible] = useState(false);
  const libres = numerosLibres(produit);

  useEffect(() => {
    /* Seuil : 70 % de la hauteur d'écran, soit à peu près la sortie du hero.
       Mesuré au défilement plutôt qu'avec un observateur sur le hero — la barre
       doit aussi réapparaître quand on remonte. */
    const seuil = () => window.innerHeight * 0.7;
    const onScroll = () => setVisible(window.scrollY > seuil());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={[
        "fixed inset-x-0 bottom-0 z-40 border-t border-white/[.09] bg-nuit/95 backdrop-blur-md transition-transform duration-500 md:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
      style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
      /* Masquée à l'assistance tant qu'elle est hors écran : un lien annoncé
         mais invisible désoriente au clavier comme au lecteur d'écran. */
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-4 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <span className="flex flex-col">
          <span className="font-display text-[1.05rem] leading-tight text-nuit-titre">
            {prixBase(produit).toLocaleString("fr-FR")} €
          </span>
          <span className="text-[0.7rem] text-nuit-faible">
            {libres} numéro{libres > 1 ? "s" : ""} libre{libres > 1 ? "s" : ""}
          </span>
        </span>
        <Button
          href={reserverHref(produit)}
          variant="lumiere"
          magnetic={false}
          tabIndex={visible ? undefined : -1}
          className="px-6"
        >
          Configurer
          <Arrow />
        </Button>
      </div>
    </div>
  );
}
